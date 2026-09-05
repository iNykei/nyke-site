// Isolated PostgreSQL/WASM fixtures only. This script never connects to Supabase.
// npm install --prefix work/gear-test-runtime --no-save --no-package-lock @electric-sql/pglite@0.5.8
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(new URL("../work/gear-test-runtime/package.json", import.meta.url));
const { PGlite } = require("@electric-sql/pglite");
const { pgcrypto } = require("@electric-sql/pglite/contrib/pgcrypto");
const db = new PGlite({ extensions: { pgcrypto } });
const owner = randomUUID();
const victim = randomUUID();
let passed = 0;
const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
const migration = await readFile(new URL("009_player_gear_collection.sql", migrationDirectory), "utf8");
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const assertError = async (fn, code) => assert.rejects(fn, (error) => error.code === code);
const pass = (message) => { passed++; console.log(`PASS ${message}`); };

async function asUser(user) {
  await db.exec("set role authenticated");
  await query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
  const [role] = await query("select rolsuper, rolbypassrls from pg_roles where rolname = current_user");
  assert.deepEqual(role, { rolsuper: false, rolbypassrls: false });
}
async function collection(user) {
  return query("select id, user_id, gear_item_id, category, is_active, created_at from public.player_gear where user_id=$1 order by id", [user]);
}

try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema auth to anon, authenticated;
  `);
  for (const file of (await readdir(migrationDirectory)).filter((name) => /^00[1-8]_/.test(name)).sort()) {
    if (file.startsWith("004_")) {
      // Storage is out of scope; only its Profile column is needed by 005/008.
      await db.exec("alter table public.profiles add column banner_url text");
    } else {
      await db.exec(await readFile(new URL(file, migrationDirectory), "utf8"));
    }
  }
  await query("insert into auth.users values ($1, $2), ($3, $4)", [owner, { username: "gear-qa-owner" }, victim, { username: "gear-qa-victim" }]);
  const mice = await query("select id from public.gear_items where category='mouse' order by brand, model limit 3");
  const [keyboard] = await query("select id from public.gear_items where category='keyboard' limit 1");
  const [a, b, c] = mice.map((item) => item.id);
  await query("insert into public.player_gear (user_id, gear_item_id, category) values ($1,$2,'mouse'),($3,$4,'keyboard')", [owner, a, victim, keyboard.id]);
  const before = await collection(owner);
  const victimBefore = await collection(victim);
  const catalogBefore = await query("select id from public.gear_items order by id");

  await db.exec(migration);
  await db.exec(migration);
  assert.deepEqual(await collection(owner), before);
  assert.deepEqual(await collection(victim), victimBefore);
  assert.equal((await query("select indexname from pg_indexes where indexname='player_gear_one_active_category'")).length, 1);
  pass("migration is idempotent and preserves existing rows, UUIDs and active index");

  await asUser(owner);
  for (const id of [b, c]) await query("insert into public.player_gear (user_id, gear_item_id, category, is_active) values ($1,$2,'mouse',false)", [owner, id]);
  assert.equal((await collection(owner)).length, 3);
  assert.equal((await collection(owner)).filter((row) => row.is_active).length, 1);
  pass("multiple inactive mice persist alongside the existing active mouse");

  await assertError(() => query("insert into public.player_gear (user_id, gear_item_id, category, is_active) values ($1,$2,'mouse',false)", [owner, a]), "23505");
  await query("insert into public.player_gear (user_id, gear_item_id, category, is_active) values ($1,$2,'mouse',false) on conflict (user_id,gear_item_id) do nothing", [owner, a]);
  assert.equal((await collection(owner)).find((row) => row.gear_item_id === a).is_active, true);
  pass("duplicate protection and idempotent add preserve active state");

  await query("select public.set_active_player_gear($1)", [b]);
  let rows = await collection(owner);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.filter((row) => row.is_active).map((row) => row.gear_item_id), [b]);
  await assertError(() => query("update public.player_gear set is_active=true where user_id=$1 and gear_item_id=$2", [owner, a]), "23505");
  pass("activation preserves old gear and the unique index enforces one active mouse");

  await db.exec("reset role");
  await db.exec(`alter table public.player_gear add constraint qa_activation_failure check (not (is_active and gear_item_id='${c}'::uuid))`);
  await asUser(owner);
  await assertError(() => query("select public.set_active_player_gear($1)", [c]), "23514");
  assert.deepEqual(await collection(owner), rows);
  await db.exec("reset role; alter table public.player_gear drop constraint qa_activation_failure");
  pass("failure of the second update rolls back deactivation of the old item");

  await asUser(owner);
  await assertError(() => query("select public.set_active_player_gear($1)", [keyboard.id]), "P0002");
  assert.equal((await query("update public.player_gear set is_active=false where user_id=$1 returning id", [victim])).length, 0);
  assert.equal((await query("delete from public.player_gear where user_id=$1 returning id", [victim])).length, 0);
  await assertError(() => query("insert into public.player_gear (user_id,gear_item_id,category,is_active) values ($1,$2,'mouse',false)", [victim, c]), "42501");
  assert.deepEqual(await collection(victim), victimBefore);
  pass("authenticated owner cannot insert, update, delete or activate victim collection rows");

  for (const id of [a, b]) assert.equal((await query("delete from public.player_gear where user_id=$1 and gear_item_id=$2 returning id", [owner, id])).length, 1);
  rows = await collection(owner);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].is_active, false);
  assert.deepEqual(await query("select id from public.gear_items order by id"), catalogBefore);
  pass("owner can remove inactive and active rows without deleting catalog items");

  await db.exec("set role anon");
  assert.equal((await collection(owner)).length, 1);
  await assertError(() => query("select public.set_active_player_gear($1)", [c]), "42501");
  await assertError(() => query("delete from public.player_gear where user_id=$1", [owner]), "42501");
  pass("anonymous viewers read inactive collection rows but cannot mutate them");

  await asUser("");
  await assertError(() => query("select public.set_active_player_gear($1)", [c]), "42501");
  pass("RPC rejects an authenticated role without a user identity");

  await db.exec("reset role");
  const [functionState] = await query("select prosecdef, proconfig from pg_proc where oid='public.set_active_player_gear(uuid)'::regprocedure");
  assert.equal(functionState.prosecdef, false);
  assert.ok(functionState.proconfig.some((value) => value.startsWith("search_path=")));
  pass("RPC uses invoker privileges and a pinned search path");

  await db.exec("alter table public.player_gear drop constraint player_gear_user_item_key");
  await query("insert into public.player_gear (user_id,gear_item_id,category,is_active) values ($1,$2,'mouse',false)", [owner, c]);
  const duplicatesBefore = await collection(owner);
  await assertError(() => db.exec(migration), "P0001");
  await db.exec("rollback");
  assert.deepEqual(await collection(owner), duplicatesBefore);
  pass("pre-existing duplicates stop the migration without deleting any rows");
  console.log(`${passed}/${passed} isolated database checks passed. No remote database was accessed.`);
} finally {
  await db.close();
}
