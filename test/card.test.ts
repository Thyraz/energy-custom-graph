import assert from "node:assert/strict";
import { test } from "node:test";
import type { EnergyCustomGraphCardConfig } from "../src/types";
import type { Statistics } from "../src/data/statistics";
import type { ECOption, SeriesOption } from "../src/types/echarts";

// Import the actual card without mounting it or starting Home Assistant requests.
if (typeof customElements === "undefined") {
  Object.defineProperty(globalThis, "customElements", {
    value: { define() {}, get() {} },
    configurable: true,
  });
}

interface CardState {
  _config: EnergyCustomGraphCardConfig;
  _statistics: Statistics;
  _metadata: Record<string, never>;
  _periodStart: Date;
  _periodEnd: Date;
  _statisticsRange: { start: number; end: number };
  _statisticsPeriod: string;
  _lastRenderedRange: { start: number; end: number };
  _comparePeriodStart?: Date;
  _comparePeriodEnd?: Date;
  _statisticsCompare?: Statistics;
  _metadataCompare?: Record<string, never>;
  _statisticsRangeCompare?: { start: number; end: number };
  _statisticsPeriodCompare?: string;
  _chartData: SeriesOption[];
  _chartOptions?: ECOption;
  _generateChart(): void;
}

const HOUR = 60 * 60 * 1000;
const START = Date.UTC(2026, 0, 1);
const END = START + 3 * HOUR - 1;

const statistics = (values: Array<number | undefined>, start = START): Statistics => ({
  "sensor.test": values.flatMap((value, index) =>
    value === undefined
      ? []
      : [{ start: start + index * HOUR, end: start + (index + 1) * HOUR, change: value }]
  ),
});

const generate = async (
  values: Array<number | undefined>,
  options: { compare?: number[]; axis?: Record<string, unknown> } = {}
): Promise<CardState> => {
  const { EnergyCustomGraphCard } = await import("../src/energy-custom-graph-card");
  Object.defineProperty(globalThis, "document", {
    value: { documentElement: {}, body: {}, visibilityState: "visible" },
    configurable: true,
  });
  Object.defineProperty(globalThis, "getComputedStyle", {
    value: () => ({ getPropertyValue: () => "#555555" }),
    configurable: true,
  });

  const card = new EnergyCustomGraphCard();
  card.hass = {
    states: {},
    locale: { language: "en", number_format: "language" },
    config: { time_zone: "UTC" },
  } as never;
  const state = card as unknown as CardState;
  Object.assign(state, {
    _config: {
      type: "custom:energy-custom-graph-card",
      series: [{ id: "main", statistic_id: "sensor.test", chart_type: "bar" }],
      y_axes: [{ id: "left", fit_y_data: true, ...options.axis }],
      show_tooltip: false,
      show_x_axis_pointer: false,
    },
    _statistics: statistics(values),
    _metadata: {},
    _periodStart: new Date(START),
    _periodEnd: new Date(END),
    _statisticsRange: { start: START, end: END },
    _statisticsPeriod: "hour",
    // Skip the initial animation, which temporarily replaces real values with zero.
    _lastRenderedRange: { start: START, end: END },
  });
  if (options.compare) {
    const compareStart = START - 24 * HOUR;
    const compareEnd = END - 24 * HOUR;
    Object.assign(state, {
      _comparePeriodStart: new Date(compareStart),
      _comparePeriodEnd: new Date(compareEnd),
      _statisticsCompare: statistics(options.compare, compareStart),
      _metadataCompare: {},
      _statisticsRangeCompare: { start: compareStart, end: compareEnd },
      _statisticsPeriodCompare: "hour",
    });
  }
  state._generateChart();
  return state;
};

const numericValues = (series: SeriesOption[]): number[] =>
  series.flatMap((item) =>
    (item.data ?? []).flatMap((point) => {
      const value = Array.isArray(point) ? point[1] : point.value[1];
      return typeof value === "number" ? [value] : [];
    })
  );

test("bar layout placeholders do not force a fitted Y axis to zero", async () => {
  const card = await generate([101, 105, 109]);
  assert.deepEqual(numericValues(card._chartData), [101, 105, 109]);
});

test("missing bar buckets do not introduce zero into positive or negative series", async () => {
  for (const sign of [1, -1]) {
    const card = await generate([101 * sign, undefined, 109 * sign]);
    assert.deepEqual(numericValues(card._chartData), [101 * sign, 109 * sign]);
  }
});

test("real zero values remain in fitted bar series", async () => {
  const card = await generate([101, 0, 109]);
  assert.deepEqual(numericValues(card._chartData), [101, 0, 109]);
});

test("compare timespan bars keep their values and separate stack", async () => {
  const card = await generate([101, 105, 109], { compare: [201, 205, 209] });
  assert.deepEqual(numericValues(card._chartData), [201, 205, 209, 101, 105, 109]);
  const main = card._chartData.find((series) => series.id === "main")!;
  const compare = card._chartData.find((series) => series.id === "main--compare")!;
  assert.notEqual(main.stack, compare.stack);
});

test("fit to data preserves explicit Y axis bounds", async () => {
  const card = await generate([0, 0.21, 12.57], { axis: { min: 0, max: 10 } });
  const [axis] = card._chartOptions!.yAxis as Array<Record<string, unknown>>;
  assert.equal(axis.min, 0);
  assert.equal(axis.max, 10);
  assert.equal(axis.scale, true);
});
