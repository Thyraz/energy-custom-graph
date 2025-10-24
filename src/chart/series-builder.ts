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

const hexToRgb = (
  value: string
): { r: number; g: number; b: number } | null => {
  const hex = value.replace("#", "").trim();
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }
  if (hex.length === 4) {
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
  if (hex.length === 8) {
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

  type LineSeriesMeta = {
    id: string;
    name: string;
    config: EnergyCustomGraphSeriesConfig;
    dataPoints: [number, number | null][];
    lineColor: string;
    fillColor: string;
    fillOpacity: number;
    series: LineSeriesOption;
  };

  const lineSeriesByName = new Map<string, LineSeriesMeta>();
  const fillRequests: Array<{
    sourceName: string;
    targetName: string;
  }> = [];
  const warned = new Set<string>();
  const warnOnce = (key: string, message: string) => {
    if (warned.has(key)) {
      return;
    }
    warned.add(key);
    console.warn(`[energy-custom-graph] ${message}`);
  };

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
    const shouldFill = seriesConfig.fill === true;
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

    const lineOpacityOverride =
      typeof seriesConfig.line_opacity === "number"
        ? clampAlpha(seriesConfig.line_opacity)
        : undefined;
    const lineColor =
      lineOpacityOverride !== undefined
        ? applyAlpha(colorValue, lineOpacityOverride)
        : colorValue;
    const lineHoverAlpha = Math.min(1, (lineOpacityOverride ?? 1) + 0.2);
    let lineHoverColor = applyAlpha(colorValue, lineHoverAlpha);
    if (lineHoverColor === colorValue) {
      lineHoverColor = lineColor;
    }
    const defaultBarFillOpacity = BAR_FILL_ALPHA;
    const defaultLineFillOpacity = LINE_AREA_ALPHA;

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
      const fillOpacity =
        typeof seriesConfig.fill_opacity === "number"
          ? clampAlpha(seriesConfig.fill_opacity)
          : defaultLineFillOpacity;
      const fillColor = applyAlpha(colorValue, fillOpacity);

      const lineItemStyle = {
        color: lineColor,
        borderColor: lineColor,
      } as const;
      const lineSeries: LineSeriesOption = {
        id,
        name,
        type: "line",
        smooth: smoothValue ?? true,
        areaStyle: shouldFill ? {} : undefined,
        data: dataPoints,
        stack: seriesConfig.stack,
        stackStrategy: seriesConfig.stack_strategy,
        yAxisIndex: seriesConfig.y_axis === "right" ? 1 : 0,
        emphasis: {
          focus: "series",
          itemStyle: {
            color: lineHoverColor,
            borderColor: lineHoverColor,
          },
        },
        lineStyle: {
          width: 2,
          color: lineColor,
        },
        itemStyle: { ...lineItemStyle },
        color: lineColor,
      };
      if (shouldFill) {
        lineSeries.areaStyle = {
          ...(lineSeries.areaStyle ?? {}),
          color: fillColor,
        };
      }
      output.push(lineSeries);

      const nameKey = name;
      if (lineSeriesByName.has(nameKey)) {
        warnOnce(
          `duplicate-name-${nameKey}`,
          `Multiple series share the name "${nameKey}". fill_to_series references will be ambiguous.`
        );
      } else {
        lineSeriesByName.set(nameKey, {
          id,
          name: nameKey,
          config: seriesConfig,
          dataPoints,
          lineColor,
          fillColor,
          fillOpacity,
          series: lineSeries,
        });
      }

      const targetName = seriesConfig.fill_to_series?.trim();
      if (targetName) {
        fillRequests.push({
          sourceName: nameKey,
          targetName,
        });
      }
    } else {
      const fillOpacity =
        typeof seriesConfig.fill_opacity === "number"
          ? clampAlpha(seriesConfig.fill_opacity)
          : defaultBarFillOpacity;
      const fillColor = applyAlpha(colorValue, fillOpacity);
      const hoverColor = applyAlpha(
        colorValue,
        Math.min(1, fillOpacity + 0.2)
      );

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

      if (seriesConfig.fill_to_series) {
        warnOnce(
          `fill-bar-${name}`,
          `Series "${name}" is configured as bar chart and cannot use fill_to_series.`
        );
      }
    }

    legend.push({
      id,
      name,
      color: chartType === "line" ? lineColor : colorValue,
      hidden: seriesConfig.show_legend === false,
    });
  });

  fillRequests.forEach(({ sourceName, targetName }) => {
    const sourceMeta = lineSeriesByName.get(sourceName);
    if (!sourceMeta) {
      warnOnce(
        `fill-source-missing-${sourceName}`,
        `Series "${sourceName}" could not be found for fill_to_series processing.`
      );
      return;
    }

    if (sourceMeta.config.stack) {
      warnOnce(
        `fill-source-stack-${sourceName}`,
        `Series "${sourceName}" uses stack together with fill_to_series. Stacking is not supported for fill areas.`
      );
      return;
    }

    const targetMeta = lineSeriesByName.get(targetName);
    if (!targetMeta) {
      warnOnce(
        `fill-target-missing-${sourceName}-${targetName}`,
        `fill_to_series for "${sourceName}" references "${targetName}", which does not exist or is not a line series.`
      );
      return;
    }

    if (targetMeta.config.stack) {
      warnOnce(
        `fill-target-stack-${sourceName}-${targetName}`,
        `Series "${targetName}" uses stack and cannot be used as fill target.`
      );
      return;
    }

    if (sourceMeta.name === targetMeta.name) {
      warnOnce(
        `fill-same-series-${sourceName}`,
        `Series "${sourceName}" references itself in fill_to_series.`
      );
      return;
    }

    const sourceMap = new Map<number, number | null>();
    sourceMeta.dataPoints.forEach(([timestamp, value]) => {
      sourceMap.set(
        timestamp,
        typeof value === "number" && !Number.isNaN(value) ? value : null
      );
    });

    const targetMap = new Map<number, number | null>();
    targetMeta.dataPoints.forEach(([timestamp, value]) => {
      targetMap.set(
        timestamp,
        typeof value === "number" && !Number.isNaN(value) ? value : null
      );
    });

    const buckets = new Set<number>();
    sourceMap.forEach((_value, key) => buckets.add(key));
    targetMap.forEach((_value, key) => buckets.add(key));
    const sortedBuckets = Array.from(buckets).sort((a, b) => a - b);

    const baselineData: [number, number | null][] = [];
    const fillData: [number, number | null][] = [];
    let clamped = false;

    sortedBuckets.forEach((bucket) => {
      const upper = sourceMap.get(bucket);
      const lower = targetMap.get(bucket);
      if (
        upper === undefined ||
        lower === undefined ||
        upper === null ||
        lower === null
      ) {
        baselineData.push([bucket, lower ?? null]);
        fillData.push([bucket, null]);
        return;
      }

      const diff = upper - lower;
      if (diff < 0) {
        clamped = true;
        baselineData.push([bucket, lower]);
        fillData.push([bucket, 0]);
        return;
      }

      baselineData.push([bucket, lower]);
      fillData.push([bucket, diff]);
    });

    if (!fillData.some(([, value]) => typeof value === "number" && value > 0)) {
      return;
    }

    if (clamped) {
      warnOnce(
        `fill-clamped-${sourceName}-${targetName}`,
        `fill_to_series for "${sourceName}" encountered values below "${targetName}". Negative differences were clamped to zero.`
      );
    }

    const stackId = `__energy_fill_${sourceMeta.id}`;
    const baseId = `${sourceMeta.id}__fill_base`;
    const fillId = `${sourceMeta.id}__fill_area`;

    const defaultLineZ = 2;
    const sourceLineZ =
      typeof sourceMeta.series.z === "number"
        ? sourceMeta.series.z
        : defaultLineZ;
    const targetLineZ =
      typeof targetMeta.series.z === "number"
        ? targetMeta.series.z
        : defaultLineZ;
    let areaZ = sourceLineZ - 0.1;
    if (areaZ < 0) {
      areaZ = sourceLineZ + 0.1;
    }
    let baseZ = Math.min(areaZ - 0.01, targetLineZ - 0.1);
    if (baseZ < 0) {
      baseZ = Math.max(areaZ - 0.02, 0);
    }

    const baseSeries: LineSeriesOption = {
      id: baseId,
      name: `${sourceName}__fill_base`,
      type: "line",
      data: baselineData,
      stack: stackId,
      stackStrategy: "all",
      smooth: targetMeta.series.smooth,
      lineStyle: {
        width: 0,
        color: targetMeta.lineColor,
      },
      areaStyle: {
        opacity: 0,
      },
      showSymbol: false,
      silent: true,
      tooltip: {
        show: false,
      },
      emphasis: {
        disabled: true,
      },
      xAxisIndex: targetMeta.series.xAxisIndex,
      yAxisIndex: targetMeta.series.yAxisIndex,
      z: baseZ,
      legendHoverLink: false,
    };

    const areaSeries: LineSeriesOption = {
      id: fillId,
      name: `${sourceName}__fill_area`,
      type: "line",
      data: fillData,
      stack: stackId,
      stackStrategy: "all",
      smooth: sourceMeta.series.smooth,
      lineStyle: {
        width: 0,
        color: sourceMeta.lineColor,
      },
      areaStyle: {
        color: sourceMeta.fillColor,
      },
      itemStyle: {
        color: sourceMeta.fillColor,
      },
      showSymbol: false,
      silent: true,
      tooltip: {
        show: false,
      },
      emphasis: {
        disabled: true,
      },
      xAxisIndex: sourceMeta.series.xAxisIndex,
      yAxisIndex: sourceMeta.series.yAxisIndex,
      z: areaZ,
      legendHoverLink: false,
    };

    output.push(baseSeries, areaSeries);
  });

  return {
    series: output,
    legend,
    unitBySeries,
    seriesById,
  };
};
