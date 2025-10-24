import type {
  BarSeriesOption,
  LineSeriesOption,
} from "../types/echarts";
import type { HomeAssistant } from "custom-card-helpers";
import type {
  EnergyCustomGraphSeriesConfig,
} from "../types";
import type {
  Statistics,
  StatisticsMetaData,
  StatisticValue,
} from "../data/statistics";

interface SeriesBuildParams {
  hass: HomeAssistant;
  statistics: Statistics | undefined;
  metadata: Record<string, StatisticsMetaData> | undefined;
  configSeries: EnergyCustomGraphSeriesConfig[];
  colorPalette: string[];
  computedStyle: CSSStyleDeclaration;
}

export interface BuiltSeriesResult {
  series: (LineSeriesOption | BarSeriesOption)[];
  legend: {
    id: string;
    name: string;
    color?: string;
    borderColor?: string;
    hidden?: boolean;
  }[];
  unitBySeries: Map<string, string | null | undefined>;
  seriesById: Map<string, EnergyCustomGraphSeriesConfig>;
}

export const DEFAULT_COLORS = [
  "--energy-grid-consumption-color",
  "--energy-grid-return-color",
  "--energy-solar-color",
  "--energy-battery-in-color",
  "--energy-battery-out-color",
];

export const BAR_BORDER_WIDTH = 1.5;
export const BAR_MAX_WIDTH = 50;
const BAR_FILL_ALPHA = 0.6;
const LINE_AREA_ALPHA = 0.2;

const clampAlpha = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 1));

const hexToRgb = (value: string): { r: number; g: number; b: number } | null => {
  const hex = value.replace("#", "").trim();
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

const rgbStringToRgb = (value: string): { r: number; g: number; b: number } | null => {
  const match = value
    .trim()
    .match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)/i);
  if (!match) {
    return null;
  }
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  };
};

const applyAlpha = (color: string, alpha: number): string => {
  const trimmed = color.trim();
  const normalizedAlpha = clampAlpha(alpha);
  if (trimmed.startsWith("#")) {
    const rgb = hexToRgb(trimmed);
    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedAlpha})`;
    }
  } else if (trimmed.startsWith("rgb")) {
    const rgb = rgbStringToRgb(trimmed);
    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedAlpha})`;
    }
  }
  return trimmed;
};

export const buildSeries = ({
  hass,
  statistics,
  metadata,
  configSeries,
  colorPalette,
  computedStyle,
}: SeriesBuildParams): BuiltSeriesResult => {
  const palette = colorPalette.length ? colorPalette : DEFAULT_COLORS;

  const legend: BuiltSeriesResult["legend"] = [];
  const unitBySeries = new Map<string, string | null | undefined>();
  const seriesById = new Map<string, EnergyCustomGraphSeriesConfig>();
  const output: (LineSeriesOption | BarSeriesOption)[] = [];

  configSeries.forEach((seriesConfig, index) => {
    const raw = statistics?.[seriesConfig.statistic_id];
    if (!raw?.length) {
      return;
    }

    const meta = metadata?.[seriesConfig.statistic_id];
    const statType = seriesConfig.stat_type ?? "change";
    const chartType = seriesConfig.chart_type ?? "bar";
    const multiplier = seriesConfig.multiply ?? 1;
    const offset = seriesConfig.add ?? 0;
    const smoothValue =
      typeof seriesConfig.smooth === "number"
        ? Math.max(0, Math.min(1, seriesConfig.smooth))
        : seriesConfig.smooth;
    const name =
      seriesConfig.name ??
      meta?.name ??
      hass.states[seriesConfig.statistic_id]?.attributes.friendly_name ??
      seriesConfig.statistic_id;

    const colorToken =
      seriesConfig.color ??
      palette[index % palette.length] ??
      DEFAULT_COLORS[index % DEFAULT_COLORS.length];

    let colorValue = colorToken;
    if (colorToken.startsWith("#") || colorToken.startsWith("rgb")) {
      colorValue = colorToken;
    } else if (colorToken.startsWith("var(")) {
      const extracted = colorToken.slice(4, -1).trim();
      const resolved = computedStyle.getPropertyValue(extracted)?.trim();
      if (resolved) {
        colorValue = resolved;
      }
    } else {
      const resolved = computedStyle.getPropertyValue(colorToken)?.trim();
      if (resolved) {
        colorValue = resolved;
      }
    }
    colorValue = colorValue.trim();

    const fillColor = applyAlpha(colorValue, BAR_FILL_ALPHA);
    const hoverColor = applyAlpha(colorValue, Math.min(1, BAR_FILL_ALPHA + 0.2));

    const id = `${seriesConfig.statistic_id}:${statType}:${chartType}:${index}`;
    unitBySeries.set(id, meta?.statistics_unit_of_measurement);
    seriesById.set(id, seriesConfig);

    const dataPoints: [number, number | null][] = raw.map(
      (entry: StatisticValue) => {
        const statKey = statType as keyof StatisticValue;
        const value = entry[statKey];
        const date = entry.start ?? entry.end;
        if (typeof value !== "number" || Number.isNaN(value)) {
          return [date, null];
        }
        const transformed = value * multiplier + offset;
        return [date, transformed];
      }
    );

    if (chartType === "line") {
      const lineItemStyle = {
        color: colorValue,
        borderColor: colorValue,
      } as const;
      const lineSeries: LineSeriesOption = {
        id,
        name,
        type: "line",
        smooth: smoothValue ?? true,
        areaStyle: seriesConfig.area ? {} : undefined,
        data: dataPoints,
        stack: seriesConfig.stack,
        stackStrategy: seriesConfig.stack_strategy,
        yAxisIndex: seriesConfig.y_axis === "right" ? 1 : 0,
        emphasis: {
          focus: "series",
          itemStyle: {
            color: hoverColor,
          },
        },
        lineStyle: {
          width: 2,
          color: colorValue,
        },
        itemStyle: { ...lineItemStyle },
        color: colorValue,
      };
      if (seriesConfig.area) {
        lineSeries.areaStyle = {
          ...(lineSeries.areaStyle ?? {}),
          color: applyAlpha(colorValue, LINE_AREA_ALPHA),
        };
      }
      output.push(lineSeries);
    } else {
      const barSeries: BarSeriesOption = {
        id,
        name,
        type: "bar",
        stack: seriesConfig.stack,
        stackStrategy: seriesConfig.stack_strategy,
        data: dataPoints,
        yAxisIndex: seriesConfig.y_axis === "right" ? 1 : 0,
        emphasis: {
          focus: "series",
          itemStyle: {
            color: hoverColor,
            borderColor: colorValue,
          },
        },
        itemStyle: {
          color: fillColor,
          borderColor: colorValue,
          borderWidth: BAR_BORDER_WIDTH,
        },
        color: fillColor,
        barMaxWidth: BAR_MAX_WIDTH,
      };
      output.push(barSeries);
    }

    legend.push({
      id,
      name,
      color: colorValue,
      hidden: seriesConfig.show_legend === false,
    });
  });

  return {
    series: output,
    legend,
    unitBySeries,
    seriesById,
  };
};
