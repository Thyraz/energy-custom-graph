import assert from "node:assert/strict";
import { test } from "node:test";
import { historyStatesToStatistics, normalizeStateValue } from "../src/data/history";
import type { HistoryStates } from "../src/data/history";

test("null recorder states preserve RAW gaps and other entities", () => {
  // The recorder represents removed entities with a null state, for example
  // when an integration unloads during a Home Assistant restart.
  const history: HistoryStates = {
    "sensor.power": [
      { s: "250", lu: 1000 },
      { s: null, lu: 1010 },
      { s: "300", lu: 1020 },
    ],
    "sensor.other": [{ s: "0", lu: 1015 }],
  };

  const statistics = historyStatesToStatistics(history);
  assert.deepEqual(
    statistics["sensor.power"].map((entry) => [entry.start, entry.mean]),
    [[1000000, 250], [1010000, null], [1020000, 300]]
  );
  const gap = statistics["sensor.power"][1];
  for (const field of ["change", "sum", "mean", "min", "max", "state"] as const) {
    assert.equal(gap[field], null);
  }
  assert.equal(statistics["sensor.other"][0].mean, 0);
});

test("null stream states remain gaps until the entity reports a value again", () => {
  const restartChunk: HistoryStates = {
    "sensor.power": [{ s: null, lu: 1010 }],
  };

  assert.equal(historyStatesToStatistics(restartChunk)["sensor.power"][0].state, null);
  assert.equal(historyStatesToStatistics({
    "sensor.power": [{ s: "300", lu: 1020 }],
  })["sensor.power"][0].state, 300);
});

test("missing states stay empty while numeric and binary mappings are preserved", () => {
  for (const value of [null, undefined, "", "unknown", "unavailable"]) {
    assert.equal(normalizeStateValue(value), null);
  }
  assert.equal(normalizeStateValue("0"), 0);
  assert.equal(normalizeStateValue(" 2.5 "), 2.5);
  assert.equal(normalizeStateValue("ON"), 1);
  assert.equal(normalizeStateValue("off"), 0);
});
