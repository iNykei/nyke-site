import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Execute the production calculation module rather than duplicating formulas.
const source = await readFile(new URL("../src/lib/calculations.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { calculateCm360, calculateEdpi } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

function approximately(actual, expected) {
  assert.notEqual(actual, null);
  assert.ok(Math.abs(actual - expected) < 1e-8, `expected ${expected}, received ${actual}`);
}

test("VALORANT keeps its 0.07 yaw result", () => {
  approximately(calculateCm360(800, 0.5, "VALORANT"), 32.65714285714286);
  approximately(calculateCm360(800, 0.5, " valorant "), 32.65714285714286);
});

test("CS2 uses 0.022 yaw, not VALORANT's", () => {
  approximately(calculateCm360(800, 1, "CS2"), 51.95454545454545);
  approximately(calculateCm360(800, 1, " Counter-Strike 2 "), 51.95454545454545);
  approximately(calculateCm360(800, 1, "counter strike 2"), 51.95454545454545);
});

test("unknown or missing games never display a guessed cm/360", () => {
  for (const game of ["Apex Legends", "custom", "", "CS:GO", null, undefined]) {
    assert.equal(calculateCm360(800, 1, game), null);
  }
});

test("invalid DPI and sensitivity do not produce cm/360", () => {
  for (const dpi of [null, 0, -800, NaN, Infinity]) {
    assert.equal(calculateCm360(dpi, 1, "VALORANT"), null);
  }
  for (const sensitivity of [null, 0, -1, NaN, Infinity]) {
    assert.equal(calculateCm360(800, sensitivity, "CS2"), null);
  }
  assert.equal(calculateCm360(Number.MAX_VALUE, Number.MAX_VALUE, "CS2"), null);
});

test("eDPI remains independent of game yaw", () => {
  assert.equal(calculateEdpi(800, 0.5), 400);
});
