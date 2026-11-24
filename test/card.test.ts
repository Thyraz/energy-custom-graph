import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  EnergyCustomGraphCardConfig,
  EnergyCustomGraphChartType,
  EnergyCustomGraphSeriesConfig,
  EnergyCustomGraphTimespanConfig,
} from "../src/types";
import type { Statistics, StatisticsPeriod } from "../src/data/statistics";
import type { ECOption, SeriesOption, XAxisOption } from "../src/types/echarts";

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
  _energyStart?: Date;
  _energyEnd?: Date;
  _chartData: SeriesOption[];
  _chartOptions?: ECOption;
  _getRoundedNow(period: string): Date;
  _resolvePeriod(): { start: Date; end?: Date } | undefined;
  _generateChart(): void;
  _formatDateTime(date: Date, period?: StatisticsPeriod | "raw" | "disabled"): string;
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
  options: {
    compare?: number[];
    compareData?: Statistics;
    series?: EnergyCustomGraphSeriesConfig[];
    axis?: Record<string, unknown>;
    chartType?: EnergyCustomGraphChartType;
    period?: StatisticsPeriod | "raw";
    range?: { start: Date; end: Date };
    data?: Statistics;
  } = {}
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
  const start = options.range?.start.getTime() ?? START;
  const end = options.range?.end.getTime() ?? END;
  Object.assign(state, {
    _config: {
      type: "custom:energy-custom-graph-card",
      series: options.series ?? [{ id: "main", statistic_id: "sensor.test", chart_type: options.chartType ?? "bar" }],
      y_axes: [{ id: "left", fit_y_data: true, ...options.axis }],
      show_tooltip: false,
      show_x_axis_pointer: false,
    },
    _statistics: options.data ?? statistics(values, start),
    _metadata: {},
    _periodStart: new Date(start),
    _periodEnd: new Date(end),
    _statisticsRange: { start, end },
    _statisticsPeriod: options.period ?? "hour",
    // Skip the initial animation, which temporarily replaces real values with zero.
    _lastRenderedRange: { start, end },
    _chartData: [{ type: "line", data: [] }],
  });
  if (options.compare || options.compareData) {
    const compareStart = START - 24 * HOUR;
    const compareEnd = END - 24 * HOUR;
    Object.assign(state, {
      _comparePeriodStart: new Date(compareStart),
      _comparePeriodEnd: new Date(compareEnd),
      _statisticsCompare: options.compareData ?? statistics(options.compare!, compareStart),
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

const assertDrawOrder = (card: CardState, ids: string[]) => {
  let previousZ = 0;
  for (const id of ids) {
    const series = card._chartData.find((item) => item.id === id);
    assert.ok(series, `missing series ${id}`);
    assert.ok(
      typeof series.z === "number" && series.z > previousZ,
      `${id} must be in front of the preceding series (z=${series.z}, previous=${previousZ})`
    );
    previousZ = series.z;
  }
};

const withCompare = (ids: string[]) => ids.flatMap((id) => [`${id}--compare`, id]);

const chartSeries = (
  id: string,
  chart_type: EnergyCustomGraphChartType,
  options: Partial<EnergyCustomGraphSeriesConfig> = {}
): EnergyCustomGraphSeriesConfig => ({ id, name: id, statistic_id: "sensor.test", chart_type, ...options });

test("mixed bars, lines, and steps follow editor draw order on both Y axes", async () => {
  const series = [
    ...["solar", "grid", "battery"].map((id) => chartSeries(id, "bar", { stack: "energy" })),
    chartSeries("load", "line", { y_axis: "right" }),
    chartSeries("reference", "step"),
    ...Array.from({ length: 8 }, (_, index) => chartSeries(`extra-${index}`, index % 2 ? "line" : "bar")),
  ];
  for (const ordered of [series, [...series].reverse()]) {
    const card = await generate([3, 4, 5], { series: ordered });
    assertDrawOrder(card, ordered.map((item) => item.id!));
  }
});

test("compare stays behind its own series and ahead of earlier editor positions", async () => {
  const series = [
    chartSeries("bar", "bar"),
    chartSeries("line", "line", { y_axis: "right" }),
    chartSeries("step", "step"),
    chartSeries("last-bar", "bar"),
  ];
  const card = await generate([3, 4, 5], { series, compare: [6, 7, 8] });
  assertDrawOrder(card, withCompare(series.map((item) => item.id!)));
});

test("line stacks reverse only their own draw positions without changing stack input order", async () => {
  const series = [
    chartSeries("before", "bar"),
    chartSeries("a1", "line", { stack: "a" }),
    chartSeries("between", "line"),
    chartSeries("a2", "step", { stack: "a" }),
    chartSeries("b1", "line", { stack: "b" }),
    chartSeries("b2", "line", { stack: "b" }),
    chartSeries("right", "line", { stack: "a", y_axis: "right" }),
    chartSeries("after", "bar"),
  ];
  const card = await generate([3, 0, 5], { series, compare: [6, 0, 8] });
  assertDrawOrder(card, withCompare(["before", "a2", "between", "a1", "b2", "b1", "right", "after"]));
  assert.deepEqual(
    card._chartData.filter((item) => series.some((config) => config.id === item.id)).map((item) => item.id),
    series.map((item) => item.id)
  );
});

test("interleaved bar stack members keep individual draw positions including compare", async () => {
  const series = [
    chartSeries("a1", "bar", { stack: "a" }),
    chartSeries("between", "line"),
    chartSeries("a2", "bar", { stack: "a" }),
    chartSeries("after", "step"),
  ];
  const card = await generate([3, 4, 5], { series, compare: [6, 7, 8] });
  assertDrawOrder(card, withCompare(series.map((item) => item.id!)));
});

test("fill bands and their compare variants stay within the source draw position", async () => {
  const source = chartSeries("source", "line", { fill_to_series: "target", statistic_id: "sensor.upper" });
  const target = chartSeries("target", "line");
  const between = chartSeries("between", "bar");
  const data = { ...statistics([2, 3, 4]), "sensor.upper": statistics([5, 6, 7])["sensor.test"] };
  const compareStart = START - 24 * HOUR;
  const compareData = {
    ...statistics([2, 3, 4], compareStart),
    "sensor.upper": statistics([5, 6, 7], compareStart)["sensor.test"],
  };
  for (const series of [[source, between, target], [target, between, source]]) {
    const card = await generate([], { series, data, compareData });
    assertDrawOrder(card, series.flatMap(({ id }) => id === "source"
      ? ["source__fill_base--compare", "source__fill_area--compare", "source--compare", "source__fill_base", "source__fill_area", "source"]
      : [`${id}--compare`, id!]
    ));
  }
});

test("compare-only bars retain their configured position when main data is missing", async () => {
  const missing = chartSeries("missing", "bar", { statistic_id: "sensor.missing" });
  const line = chartSeries("line", "line");
  const compareStart = START - 24 * HOUR;
  const compareData = {
    ...statistics([6, 7, 8], compareStart),
    "sensor.missing": statistics([2, 3, 4], compareStart)["sensor.test"],
  };
  for (const series of [[missing, line], [line, missing]]) {
    const card = await generate([3, 4, 5], { series, compareData });
    assertDrawOrder(card, series.flatMap(({ id }) => id === "missing"
      ? ["missing--compare"]
      : ["line--compare", "line"]
    ));
    assert.ok(!card._chartData.some((item) => item.id === "missing"));
  }
});

test("fit to data preserves explicit Y axis bounds", async () => {
  const card = await generate([0, 0.21, 12.57], { axis: { min: 0, max: 10 } });
  const [axis] = card._chartOptions!.yAxis as Array<Record<string, unknown>>;
  assert.equal(axis.min, 0);
  assert.equal(axis.max, 10);
  assert.equal(axis.scale, true);
});

const resolveTimespan = async (
  timespan: EnergyCustomGraphTimespanConfig,
  now: Date,
  energyRange?: { start: Date; end: Date }
) => {
  const { EnergyCustomGraphCard } = await import("../src/energy-custom-graph-card");
  const card = new EnergyCustomGraphCard() as unknown as CardState;
  card._config = { type: "custom:energy-custom-graph-card", series: [], timespan };
  card._getRoundedNow = () => new Date(now);
  card._energyStart = energyRange?.start;
  card._energyEnd = energyRange?.end;
  const range = card._resolvePeriod();
  assert.ok(range?.end);
  return { start: range.start, end: range.end };
};

const renderTimespan = async (
  range: { start: Date; end: Date },
  period: StatisticsPeriod | "raw",
  chartType: EnergyCustomGraphChartType,
  lastPoint: Date
) => {
  const card = await generate([], {
    range,
    period,
    chartType,
    data: {
      "sensor.test": [range.start.getTime(), lastPoint.getTime()].map((start) => ({
        start,
        end: start + HOUR,
        change: 3.14,
      })),
    },
  });
  const axis = (card._chartOptions!.xAxis as XAxisOption[])[0];
  const max = Number(axis.max);
  const series = card._chartData.find((item) => item.id === "main")!;
  const points = series.data!.map((point) => Array.isArray(point) ? point : point.value);
  assert.ok(points.some(([timestamp, value]) => timestamp === lastPoint.getTime() && value === 3.14));
  assert.ok(max >= lastPoint.getTime(), "the last loaded value must be inside the X axis");
  return max;
};

test("rolling last 12 months with daily aggregation includes the final days", async () => {
  for (const day of [1, 2, 3]) {
    const now = new Date(2026, 10, day);
    const range = await resolveTimespan({ mode: "relative", period: "last_12_months" }, now);
    assert.equal(range.start.getTime(), new Date(2025, 10, day).getTime());
    assert.equal(range.end.getTime(), now.getTime());
    const lastPoint = new Date(2026, 10, day - 1);
    const max = await renderTimespan(range, "day", "line", lastPoint);
    assert.equal(max, range.end.getTime());
  }
});

test("energy date picker includes the final hours of a multi-day timespan", async () => {
  const selected = { start: new Date(2026, 9, 10), end: new Date(2026, 9, 13, 23, 59, 59, 999) };
  const range = await resolveTimespan({ mode: "energy" }, selected.end, selected);
  for (const chartType of ["line", "step", "bar"] as const) {
    const max = await renderTimespan(range, "hour", chartType, new Date(2026, 9, 13, 23));
    assert.equal(max, selected.end.getTime());
  }
});

test("daily aggregation over multiple months includes the final selected day", async () => {
  const selected = { start: new Date(2026, 8, 1), end: new Date(2026, 9, 31, 23, 59, 59, 999) };
  const range = await resolveTimespan({ mode: "energy" }, selected.end, selected);
  for (const chartType of ["line", "step", "bar"] as const) {
    const max = await renderTimespan(range, "day", chartType, new Date(2026, 9, 31));
    assert.equal(max, selected.end.getTime());
  }
});

test("fixed timespans preserve the exact end for raw history and 5-minute statistics", async () => {
  const start = new Date(2026, 9, 10);
  const end = new Date(2026, 9, 13, 23, 58, 37);
  const range = await resolveTimespan({ mode: "fixed", start: start.toISOString(), end: end.toISOString() }, end);
  for (const period of ["raw", "5minute"] as const) {
    const lastPoint = period === "raw" ? new Date(2026, 9, 13, 23, 58) : new Date(2026, 9, 13, 23, 55);
    const max = await renderTimespan(range, period, "line", lastPoint);
    assert.equal(max, end.getTime());
  }
});

test("monthly and yearly aggregation keep the final calendar bucket visible", async () => {
  for (const period of ["month", "year"] as const) {
    const range = { start: new Date(2023, 0, 1), end: new Date(2026, 9, 31, 23, 59, 59, 999) };
    const lastPoint = period === "month" ? new Date(2026, 9, 1) : new Date(2026, 0, 1);
    const max = await renderTimespan(range, period, "bar", lastPoint);
    assert.equal(max, lastPoint.getTime());
  }
});


test("tooltip headers use the bucket precision in the configured time zone", async () => {
  const card = await generate([1]);
  Object.assign(card, {
    hass: { locale: { language: "en-US", time_zone: "server" }, config: { time_zone: "America/New_York" }, states: {} },
  });
  const at = new Date("2026-01-01T00:30:00Z");
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { ...options, timeZone: "America/New_York" }).format(at);
  const date = { year: "numeric", month: "short", day: "numeric" } as const;
  for (const period of ["raw", "5minute", "hour"] as const) {
    assert.equal(card._formatDateTime(at, period), format({ ...date, hour: "numeric", minute: "2-digit" }));
  }
  for (const period of ["day", "week"] as const) {
    assert.equal(card._formatDateTime(at, period), format(date));
  }
  assert.equal(card._formatDateTime(at, "month"), format({ month: "long", year: "numeric" }));
  assert.equal(card._formatDateTime(at, "year"), format({ year: "numeric" }));
});
