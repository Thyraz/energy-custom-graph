import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSeries } from "../src/chart/series-builder";

const build = (statistics: Record<string, unknown[]>) =>
  buildSeries({
    hass: { states: {} },
    statistics,
    metadata: {},
    configSeries: [
      {
        id: "max",
        statistic_id: "sensor.max",
        chart_type: "line",
        legend_group: "Range",
        fill_to_series: "Minimum",
        name: "Maximum",
      },
      {
        id: "min",
        statistic_id: "sensor.min",
        chart_type: "line",
        legend_group: "Range",
        show_in_legend: false,
        name: "Minimum",
      },
    ],
    colorPalette: [],
    computedStyle: { getPropertyValue: () => "" },
  } as never);

test("grouped series without data still register legend ids", () => {
  const result = build({
    "sensor.max": [{ start: 1000, change: 2 }],
    "sensor.min": [],
  });
  assert.ok(result.legend.some((entry) => entry.id === "min"));
  assert.ok(result.legend.every((entry) => entry.legendGroup === "Range"));
  assert.deepEqual(result.legendSecondaryIds.get("max"), [
    "max__fill_base",
    "max__fill_area",
  ]);
});

test("empty grouped series registers its own fill ids", () => {
  const result = buildSeries({
    hass: { states: {} },
    statistics: { "sensor.min": [] },
    metadata: {},
    configSeries: [
      {
        id: "min",
        statistic_id: "sensor.min",
        chart_type: "line",
        legend_group: "Range",
        fill_to_series: "Maximum",
      },
    ],
    colorPalette: [],
    computedStyle: { getPropertyValue: () => "" },
  } as never);
  assert.equal(result.legend[0].id, "min");
  assert.equal(result.legend[0].showInLegend, false);
  assert.deepEqual(result.legendSecondaryIds.get("min"), [
    "min__fill_base",
    "min__fill_area",
  ]);
});
