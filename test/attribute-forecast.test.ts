import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildAttributeForecastStatistics,
  extractAttributeForecastPoints,
  normalizeAttributeForecastAttributes,
} from "../src/data/attribute-forecast";

const t = (iso: string) => Date.parse(iso);

test("merges Nord Pool style lists and fills end from next start", () => {
  const stateObj = {
    attributes: {
      raw_today: [
        { start: "2026-10-27T22:00:00+00:00", value: 1.5 },
        { start: "2026-10-27T22:15:00+00:00", value: 2 },
      ],
      raw_tomorrow: [{ start: "2026-10-27T22:30:00+00:00", value: "0,5" }],
    },
  };
  const points = extractAttributeForecastPoints(stateObj, {
    attributes: ["raw_today", "raw_tomorrow"],
  });
  assert.deepEqual(points, [
    { start: t("2026-10-27T22:00:00Z"), end: t("2026-10-27T22:15:00Z"), value: 1.5 },
    { start: t("2026-10-27T22:15:00Z"), end: t("2026-10-27T22:30:00Z"), value: 2 },
    { start: t("2026-10-27T22:30:00Z"), end: t("2026-10-27T22:45:00Z"), value: 0.5 },
  ]);
});

test("subtract_key and custom keys", () => {
  const stateObj = {
    attributes: {
      forecast: [
        { time: "2026-10-27T13:00:00Z", charged: 1429, discharged: 0 },
        { time: "2026-10-27T13:15:00Z", charged: 0, discharged: 300 },
        { time: "2026-10-27T13:30:00Z", soc: null },
      ],
    },
  };
  const points = extractAttributeForecastPoints(stateObj, {
    attributes: ["forecast"],
    time_key: "time",
    value_key: "charged",
    subtract_key: "discharged",
  });
  assert.deepEqual(
    points.map((p) => p.value),
    [1429, -300]
  );
});

test("ignores missing attributes and bad entries", () => {
  assert.deepEqual(extractAttributeForecastPoints(undefined, { attributes: ["x"] }), []);
  assert.deepEqual(
    extractAttributeForecastPoints(
      { attributes: { x: [null, { start: "nope", value: 1 }, { value: 2 }] } },
      { attributes: ["x"] }
    ),
    []
  );
});

test("normalizes attribute config", () => {
  assert.deepEqual(normalizeAttributeForecastAttributes(" raw_today "), ["raw_today"]);
  assert.deepEqual(normalizeAttributeForecastAttributes(["a", " ", "b"]), ["a", "b"]);
  assert.deepEqual(normalizeAttributeForecastAttributes(undefined), []);
});

test("range filter and hourly time-weighted mean", () => {
  const points = [0, 1, 2, 3, 4].map((i) => ({
    start: t("2026-10-27T10:00:00Z") + i * 15 * 60000,
    end: t("2026-10-27T10:00:00Z") + (i + 1) * 15 * 60000,
    value: i + 1,
  }));
  const hour = 3600000;
  const bucketing = {
    align: (ts: number) => Math.floor(ts / hour) * hour,
    advance: (ts: number) => ts + hour,
  };
  const stats = buildAttributeForecastStatistics(
    points,
    t("2026-10-27T10:00:00Z"),
    t("2026-10-27T12:00:00Z"),
    bucketing
  );
  assert.equal(stats.length, 2);
  assert.equal(stats[0].mean, 2.5);
  assert.equal(stats[0].sum, 10);
  assert.equal(stats[0].max, 4);
  assert.equal(stats[1].mean, 5);

  const raw = buildAttributeForecastStatistics(
    points,
    t("2026-10-27T10:15:00Z"),
    t("2026-10-27T10:45:00Z")
  );
  assert.deepEqual(
    raw.map((v) => v.mean),
    [2, 3]
  );
});
