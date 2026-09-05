import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/redirects.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2017 } });
const { getSafeRedirectPath, resolvePostAuthDestination } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

function client({ username = "player", settings = true, error = null } = {}) {
  return {
    from(table) {
      return {
        select() { return this; },
        eq(column, value) {
          assert.equal(column, table === "profiles" ? "id" : "user_id");
          assert.equal(value, "authenticated-user");
          return this;
        },
        async maybeSingle() {
          return { data: table === "profiles" ? (username ? { username } : null) : (settings ? { user_id: "authenticated-user" } : null), error };
        },
      };
    },
  };
}

test("normal login and callback use the same completed onboarding destination", async () => {
  assert.equal(await resolvePostAuthDestination(client(), "authenticated-user"), "/player");
});

test("new registration, missing settings, or missing profile require onboarding", async () => {
  for (const state of [{ settings: false }, { username: null }, { username: null, settings: false }]) {
    assert.equal(await resolvePostAuthDestination(client(state), "authenticated-user"), "/settings/profile");
  }
});

test("explicit settings and recovery destinations take priority without profile queries", async () => {
  const noQueries = { from() { throw new Error("unexpected query"); } };
  for (const next of ["/settings/profile", "/reset-password", "/gear?category=mouse#results", "/gear?q=viper%20pro", "/"]) {
    assert.equal(await resolvePostAuthDestination(noQueries, "authenticated-user", next), next);
  }
});

test("missing and unsafe next use onboarding state, never an implicit homepage", async () => {
  for (const next of [null, undefined, "", "https://evil.example", "//evil.example", "/\\evil.example", "/%2f%2fevil.example", "/%5cevil.example", "/\tevil.example", "/%0aevil.example", "/broken%", "/a/..//evil.example"]) {
    assert.equal(getSafeRedirectPath(next), undefined);
    assert.equal(await resolvePostAuthDestination(client(), "authenticated-user", next), "/player");
    assert.equal(await resolvePostAuthDestination(client({ settings: false }), "authenticated-user", next), "/settings/profile");
  }
});

test("database errors are not misclassified as incomplete onboarding", async () => {
  await assert.rejects(resolvePostAuthDestination(client({ error: { code: "42501" } }), "authenticated-user"), /Unable to determine/);
});
