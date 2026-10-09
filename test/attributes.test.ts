import assert from "node:assert/strict";
import { test } from "node:test";
import { attributeHistoryToStatistics, createZonedBucketing } from "../src/data/attributes";

const dayBounds = (timeZone: string, at: string) => {
  const bucketing = createZonedBucketing("day", timeZone)!;
  const start = bucketing.align(Date.parse(at));
  const end = bucketing.advance(start);
  return [new Date(start).toISOString(), new Date(end).toISOString()];
};

test("day buckets follow HA time zone", () => {
  assert.deepEqual(dayBounds("UTC", "2026-10-24T13:00:00Z"), [
    "2026-10-24T00:00:00.000Z",
    "2026-10-25T00:00:00.000Z",
  ]);
  // DST ends during the day: 25 hours.
  assert.deepEqual(dayBounds("Europe/Berlin", "2026-10-25T12:00:00Z"), [
    "2026-10-24T22:00:00.000Z",
    "2026-10-25T23:00:00.000Z",
  ]);
});

test("nonexistent midnight uses offset before DST starts, like the recorder", () => {
  assert.deepEqual(dayBounds("America/Havana", "2026-03-08T12:00:00Z"), [
    "2026-03-08T05:00:00.000Z",
    "2026-03-09T04:00:00.000Z",
  ]);
  assert.deepEqual(dayBounds("America/Santiago", "2026-09-06T12:00:00Z"), [
    "2026-09-06T04:00:00.000Z",
    "2026-09-07T03:00:00.000Z",
  ]);
});

test("ambiguous midnight uses first occurrence, like the recorder", () => {
  assert.deepEqual(dayBounds("America/Havana", "2026-11-01T12:00:00Z"), [
    "2026-11-01T04:00:00.000Z",
    "2026-11-02T05:00:00.000Z",
  ]);
});

test("buckets keep advancing across a nonexistent midnight", () => {
  const bucketing = createZonedBucketing("day", "America/Havana")!;
  let cursor = bucketing.align(Date.parse("2026-03-06T12:00:00Z"));
  for (let i = 0; i < 5; i++) {
    const next = bucketing.advance(cursor);
    assert.ok(next > cursor, `bucket ${i} did not advance`);
    cursor = next;
  }
  assert.equal(new Date(cursor).toISOString(), "2026-03-11T04:00:00.000Z");
});

test("constant attribute yields daily values across a nonexistent midnight", () => {
  const entityId = "climate.test";
  const history = {
    [entityId]: [
      { s: "heat", a: { current_temperature: 20 }, lu: Date.parse("2026-03-07T00:00:00Z") / 1000 },
    ],
  };
  const statistics = attributeHistoryToStatistics(history, [`${entityId}@current_temperature`], {
    rangeStart: Date.parse("2026-03-07T05:00:00Z"),
    rangeEnd: Date.parse("2026-03-10T04:00:00Z"),
    bucketing: createZonedBucketing("day", "America/Havana")!,
  });
  const values = statistics[`${entityId}@current_temperature`];
  assert.deepEqual(
    values.map((value) => [new Date(value.start).toISOString(), value.mean]),
    [
      ["2026-03-07T05:00:00.000Z", 20],
      ["2026-03-08T05:00:00.000Z", 20],
      ["2026-03-09T04:00:00.000Z", 20],
    ]
  );
});
