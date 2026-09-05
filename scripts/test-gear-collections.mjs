import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { compileFunction } from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function load(relative, mocks = {}) {
  const source = await readFile(new URL(`../${relative}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } });
  const exports = {};
  compileFunction(outputText, ["require", "exports"], { filename: relative })((name) => name in mocks ? mocks[name] : require(name), exports);
  return exports;
}

const helpers = await load("src/lib/gear-collection.ts");
const owner = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const other = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const mouseA = "11111111-1111-4111-8111-111111111111";
const mouseB = "22222222-2222-4222-8222-222222222222";
const keyboard = "33333333-3333-4333-8333-333333333333";
const catalog = [
  { id: mouseA, category: "mouse", brand: "Razer", model: "Viper", specs: {} },
  { id: mouseB, category: "mouse", brand: "Logitech G", model: "Superlight", specs: {} },
  { id: keyboard, category: "keyboard", brand: "Wooting", model: "80HE", specs: {} },
];
const mapItem = (row) => ({ id: row.id, name: row.model, maker: row.brand, category: row.category, specs: row.specs, summary: "", accent: "" });
const saved = (id, user, active) => ({ id: `row-${id}-${user}`, user_id: user, gear_item_id: id, category: catalog.find((item) => item.id === id).category, is_active: active, created_at: "2026-01-01" });

function client({ user = { id: owner }, rows = [], mutationError = null, readError = null } = {}) {
  const calls = [];
  const tables = {
    profiles: [{ id: owner, username: "test-owner", member_number: null, avatar_url: null, banner_url: null }],
    player_settings: [{ user_id: owner, game: "VALORANT", dpi: 800, sensitivity: 0.3 }],
    gear_items: catalog,
    player_gear: rows.map((row) => ({ ...row })),
  };
  const api = {
    calls, tables,
    auth: { async getUser() { calls.push({ auth: true }); return { data: { user }, error: null }; } },
    async rpc(name, args) {
      calls.push({ rpc: name, args });
      if (mutationError) return { data: null, error: mutationError };
      const target = tables.player_gear.find((row) => row.user_id === user.id && row.gear_item_id === args.p_gear_item_id);
      if (!target) return { error: { code: "P0002", message: "not owned" } };
      tables.player_gear.filter((row) => row.user_id === user.id && row.category === target.category).forEach((row) => { row.is_active = row === target; });
      return { data: target.id, error: null };
    },
    from(table) {
      const call = { table, operation: "select", filters: [] };
      calls.push(call);
      let single = false;
      const q = {
        select(columns) { call.columns = columns; return q; },
        eq(key, value) { call.filters.push([key, value]); return q; },
        neq(key, value) { call.notEqual = [key, value]; return q; },
        in(key, values) { call.in = [key, values]; return q; },
        order() { return q; },
        update(values) { call.operation = "update"; call.values = values; return q; },
        upsert(values, options) { call.operation = "upsert"; call.values = values; call.options = options; return q; },
        delete() { call.operation = "delete"; return q; },
        single() { single = true; return q; },
        maybeSingle() { single = true; return q; },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            const matches = (row) => call.filters.every(([key, value]) => row[key] === value) && (!call.in || call.in[1].includes(row[call.in[0]])) && (!call.notEqual || row[call.notEqual[0]] !== call.notEqual[1]);
            if (call.operation !== "select" && mutationError) return { data: null, error: mutationError };
            if (table === "player_gear" && call.operation === "select" && readError) return { data: null, error: readError };
            if (call.operation === "delete") tables[table] = tables[table].filter((row) => !matches(row));
            if (call.operation === "update") tables[table].filter(matches).forEach((row) => Object.assign(row, call.values));
            if (call.operation === "upsert") {
              const exists = tables[table].find((row) => row.user_id === call.values.user_id && (table !== "player_gear" || row.gear_item_id === call.values.gear_item_id));
              if (exists && !call.options?.ignoreDuplicates) Object.assign(exists, call.values);
              if (!exists) tables[table].push({ id: "added-row", ...call.values });
            }
            const data = tables[table].filter(matches);
            return { data: single ? data[0] ?? null : data, error: null };
          }).then(resolve, reject);
        },
      };
      return q;
    },
  };
  return api;
}

async function action(api) {
  const paths = [];
  const { updateGearCollection } = await load("src/app/settings/gear/actions.ts", {
    "@/lib/supabase/server": { createClient: async () => api },
    "next/cache": { revalidatePath: (...args) => paths.push(args) },
  });
  return { update: updateGearCollection, paths };
}

test("collection retains multiple items per category and separates active items", () => {
  const rows = [saved(mouseA, owner, true), saved(mouseB, owner, false), saved(keyboard, owner, true)];
  const collection = helpers.buildGearCollection(rows, catalog.map(mapItem));
  assert.equal(collection.length, 3);
  assert.equal(collection.filter((item) => item.category === "mouse").length, 2);
  assert.deepEqual(collection.filter((item) => item.isActive).map((item) => item.id), [mouseA, keyboard]);
  assert.equal(rows[0].gear_item_id, mouseA);
  assert.throws(() => helpers.buildGearCollection(rows, []), /could not be loaded/);
});

test("search, category and brand combine; brand choices follow category", () => {
  const items = catalog.map(mapItem);
  assert.deepEqual(helpers.filterGear(items, "  VIPER ", "mouse", "Razer").map((item) => item.id), [mouseA]);
  assert.equal(helpers.filterGear(items, "viper", "keyboard", "Razer").length, 0);
  assert.deepEqual(helpers.getGearBrands(items, "keyboard"), ["Wooting"]);
  assert.deepEqual(helpers.sortGear(items).map((item) => item.id), [mouseB, mouseA, keyboard]);
});

test("malformed requests and anonymous writes are rejected", async () => {
  const api = client({ user: null });
  const { update } = await action(api);
  for (const input of [null, {}, { operation: "delete-all", gearItemId: mouseA }, { operation: "add", gearItemId: "bad" }]) {
    assert.equal((await update(input)).status, "error");
  }
  assert.equal(api.calls.length, 0);
  assert.match((await update({ operation: "add", gearItemId: mouseA })).message, /Sign in/);
  assert.ok(!api.calls.some((call) => call.table));
});

test("add uses Auth identity and catalog category, stays inactive and is idempotent", async () => {
  const api = client({ rows: [saved(mouseA, owner, true)] });
  const { update } = await action(api);
  const input = { operation: "add", gearItemId: mouseB, user_id: other, category: "monitor", is_active: true };
  assert.equal((await update(input)).status, "success");
  assert.equal((await update(input)).status, "success");
  assert.equal((await update({ operation: "add", gearItemId: mouseA })).status, "success");
  assert.equal(api.tables.player_gear.length, 2);
  assert.equal(api.tables.player_gear.find((row) => row.gear_item_id === mouseA).is_active, true);
  const inserted = api.calls.find((call) => call.operation === "upsert");
  assert.deepEqual(inserted.values, { user_id: owner, gear_item_id: mouseB, category: "mouse", is_active: false });
  assert.deepEqual(inserted.options, { onConflict: "user_id,gear_item_id", ignoreDuplicates: true });
});

test("activation uses one atomic RPC, preserves saved gear and revalidates affected views", async () => {
  const api = client({ rows: [saved(mouseA, owner, true), saved(mouseB, owner, false)] });
  const { update, paths } = await action(api);
  const result = await update({ operation: "activate", gearItemId: mouseB });
  assert.equal(result.status, "success");
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows.find((row) => row.gear_item_id === mouseA).is_active, false);
  assert.deepEqual(api.calls.find((call) => call.rpc), { rpc: "set_active_player_gear", args: { p_gear_item_id: mouseB } });
  assert.ok(!api.calls.some((call) => call.operation === "delete"));
  assert.ok(paths.some(([route, type]) => route === "/test-owner" && type === "layout"));
  for (const route of ["/settings/gear", "/settings/profile", "/gear", "/explore", "/"]) assert.ok(paths.some(([path]) => route === path));
});

test("remove targets only the owner's collection, including active gear, never the catalog", async () => {
  for (const active of [false, true]) {
    const api = client({ rows: [saved(mouseA, owner, active), saved(mouseA, other, true)] });
    const { update } = await action(api);
    assert.equal((await update({ operation: "remove", gearItemId: mouseA, user_id: other })).status, "success");
    assert.equal(api.tables.player_gear.length, 1);
    assert.equal(api.tables.player_gear[0].user_id, other);
    assert.deepEqual(api.calls.find((call) => call.operation === "delete").filters, [["user_id", owner], ["gear_item_id", mouseA]]);
    assert.ok(!api.calls.some((call) => call.table === "gear_items" && call.operation !== "select"));
  }
});

test("missing migration, denied writes and failed refresh produce explicit errors", async () => {
  for (const code of ["42P10", "PGRST202", "42501"]) {
    const { update } = await action(client({ mutationError: { code, message: "test failure" } }));
    const result = await update({ operation: "add", gearItemId: mouseA });
    assert.equal(result.status, "error");
    if (code !== "42501") assert.match(result.message, /database update/);
  }
  const { update } = await action(client({ readError: { message: "offline" } }));
  assert.match((await update({ operation: "add", gearItemId: mouseA })).message, /saved.*Reload/);
});

test("public profile uses the full collection but Player/Card compatibility gear remains active only", async () => {
  const api = client({ user: null, rows: [saved(mouseA, owner, true), saved(mouseB, owner, false)] });
  const profiles = await load("src/lib/profiles.ts", {
    react: { cache: (fn) => fn },
    "@/lib/supabase/server": { createClient: async () => api },
    "@/lib/gear": { gearItemColumns: "id, brand, model, category", mapGearItemRow: mapItem },
    "@/lib/gear-collection": helpers,
    "@/lib/mock-data": { getPlayerByUsername: () => undefined, players: [] },
  });
  const data = await profiles.getPublicProfileData("test-owner");
  assert.equal(data.gearCollection.length, 2);
  assert.equal(data.activeGear.length, 1);
  assert.equal(data.player.gear.mouse.id, mouseA);
  assert.equal(data.isOwner, false);
  assert.equal(api.calls.filter((call) => call.table === "gear_items").length, 1);
});

test("ordinary Profile save does not read or delete the gear collection", async () => {
  const api = client({ rows: [saved(mouseA, owner, true), saved(mouseB, owner, false)] });
  const before = structuredClone(api.tables.player_gear);
  const { saveProfile } = await load("src/app/settings/profile/actions.ts", {
    "@/lib/supabase/server": { createClient: async () => api },
    "@/lib/validation": { isReservedUsername: () => false, isValidUsername: () => true, normalizeUsername: (value) => value },
    "next/cache": { revalidatePath() {} },
  });
  const form = new FormData();
  form.set("username", "test-owner");
  form.set("gear_mouse", mouseB);
  assert.equal((await saveProfile({}, form)).status, "success");
  assert.deepEqual(api.tables.player_gear, before);
  assert.ok(!api.calls.some((call) => ["player_gear", "gear_items"].includes(call.table)));
});
