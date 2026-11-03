import type { StatisticValue } from "./statistics";

/**
 * Reads time series that integrations publish as a list inside one entity
 * attribute (e.g. Nord Pool `raw_today` / `raw_tomorrow`, battery schedules,
 * weather-like forecasts). Unlike recorder data these lists usually reach into
 * the future, so they are read from the current entity state.
 */

export const DEFAULT_ATTRIBUTE_FORECAST_TIME_KEYS = [
  "start",
  "time",
  "datetime",
  "period_start",
  "startsAt",
  "start_time",
];

export const DEFAULT_ATTRIBUTE_FORECAST_VALUE_KEYS = ["value", "price", "total"];

export interface AttributeForecastOptions {
  attributes: string[];
  time_key?: string;
  end_key?: string;
  value_key?: string;
  subtract_key?: string;
}

export interface AttributeForecastBucketing {
  align: (timestamp: number) => number;
  advance: (timestamp: number) => number;
}

export interface AttributeForecastPoint {
  start: number;
  end?: number;
  value: number;
}

type EntityStateLike = { attributes?: Record<string, unknown> } | undefined;

export const normalizeAttributeForecastAttributes = (
  value: string | string[] | undefined
): string[] => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((item) => String(item).trim()).filter((item) => item.length > 0);
};

const toTimestamp = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    // Seconds vs. milliseconds since epoch.
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value === "string" && value.trim()) {
    const ts = new Date(value).getTime();
    return Number.isFinite(ts) ? ts : undefined;
  }
  if (value instanceof Date) {
    const ts = value.getTime();
    return Number.isFinite(ts) ? ts : undefined;
  }
  return undefined;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.trim()) {
    const num = Number(value.replace(",", "."));
    return Number.isFinite(num) ? num : undefined;
  }
  return undefined;
};

const pickKey = (
  entry: Record<string, unknown>,
  configured: string | undefined,
  defaults: string[]
): string | undefined => {
  if (configured) {
    return configured;
  }
  return defaults.find((key) => entry[key] !== undefined && entry[key] !== null);
};

/**
 * Extracts sorted, de-duplicated points from the configured attributes.
 * Entries that cannot be parsed are skipped.
 */
export const extractAttributeForecastPoints = (
  stateObj: EntityStateLike,
  options: AttributeForecastOptions
): AttributeForecastPoint[] => {
  const attrs = stateObj?.attributes;
  if (!attrs) {
    return [];
  }
  const byStart = new Map<number, AttributeForecastPoint>();
  options.attributes.forEach((attribute) => {
    const list = attrs[attribute];
    if (!Array.isArray(list)) {
      return;
    }
    list.forEach((item) => {
      if (!item || typeof item !== "object") {
        return;
      }
      const entry = item as Record<string, unknown>;
      const timeKey = pickKey(entry, options.time_key, DEFAULT_ATTRIBUTE_FORECAST_TIME_KEYS);
      const valueKey = pickKey(entry, options.value_key, DEFAULT_ATTRIBUTE_FORECAST_VALUE_KEYS);
      if (!timeKey || !valueKey) {
        return;
      }
      const start = toTimestamp(entry[timeKey]);
      let value = toNumber(entry[valueKey]);
      if (start === undefined) {
        return;
      }
      if (options.subtract_key) {
        const sub = toNumber(entry[options.subtract_key]);
        if (value === undefined && sub === undefined) {
          return;
        }
        value = (value ?? 0) - (sub ?? 0);
      }
      if (value === undefined) {
        return;
      }
      const endKey = options.end_key ?? (entry.end !== undefined ? "end" : undefined);
      const end = endKey ? toTimestamp(entry[endKey]) : undefined;
      byStart.set(start, { start, end: end !== undefined && end > start ? end : undefined, value });
    });
  });

  const points = Array.from(byStart.values()).sort((a, b) => a.start - b.start);
  // Fill missing end times from the next point (or the typical spacing).
  let lastStep: number | undefined;
  points.forEach((point, idx) => {
    if (point.end !== undefined) {
      lastStep = point.end - point.start;
      return;
    }
    const next = points[idx + 1];
    if (next) {
      lastStep = next.start - point.start;
      point.end = next.start;
    } else if (lastStep !== undefined) {
      point.end = point.start + lastStep;
    }
  });
  return points;
};

const toStatisticValue = (
  start: number,
  end: number,
  values: { mean: number; sum: number; min: number; max: number; last: number }
): StatisticValue => ({
  start,
  end,
  change: values.sum,
  sum: values.sum,
  mean: values.mean,
  min: values.min,
  max: values.max,
  state: values.last,
});

/**
 * Converts points into statistic values for the requested range.
 * Without bucketing each point is kept as is. With bucketing points are grouped
 * per interval: `mean` is time-weighted, `sum`/`change` add up the values,
 * `min`/`max` are extremes and `state` is the last value.
 */
export const buildAttributeForecastStatistics = (
  points: AttributeForecastPoint[],
  rangeStart: number,
  rangeEnd: number | null,
  bucketing?: AttributeForecastBucketing
): StatisticValue[] => {
  const inRange = points.filter((point) => {
    const end = point.end ?? point.start;
    if (end <= rangeStart && point.start < rangeStart) {
      return false;
    }
    if (rangeEnd !== null && point.start >= rangeEnd) {
      return false;
    }
    return true;
  });
  if (!inRange.length) {
    return [];
  }

  if (!bucketing) {
    return inRange.map((point) =>
      toStatisticValue(point.start, point.end ?? point.start, {
        mean: point.value,
        sum: point.value,
        min: point.value,
        max: point.value,
        last: point.value,
      })
    );
  }

  type Acc = {
    end: number;
    weighted: number;
    weight: number;
    sum: number;
    min: number;
    max: number;
    last: number;
    count: number;
  };
  const buckets = new Map<number, Acc>();
  inRange.forEach((point) => {
    const bucketStart = bucketing.align(point.start);
    let acc = buckets.get(bucketStart);
    if (!acc) {
      acc = {
        end: bucketing.advance(bucketStart),
        weighted: 0,
        weight: 0,
        sum: 0,
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        last: point.value,
        count: 0,
      };
      buckets.set(bucketStart, acc);
    }
    const duration = Math.max((point.end ?? point.start) - point.start, 0) || 1;
    acc.weighted += point.value * duration;
    acc.weight += duration;
    acc.sum += point.value;
    acc.min = Math.min(acc.min, point.value);
    acc.max = Math.max(acc.max, point.value);
    acc.last = point.value;
    acc.count++;
  });

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([start, acc]) =>
      toStatisticValue(start, acc.end, {
        mean: acc.weight ? acc.weighted / acc.weight : acc.sum / acc.count,
        sum: acc.sum,
        min: acc.min,
        max: acc.max,
        last: acc.last,
      })
    );
};
