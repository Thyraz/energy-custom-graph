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

const DEFAULT_COLORS = [
  "--energy-grid-consumption-color",
  "--energy-grid-return-color",
  "--energy-solar-color",
  "--energy-battery-in-color",
  "--energy-battery-out-color",
];

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
    const name =
      seriesConfig.name ??
      meta?.name ??
      hass.states[seriesConfig.statistic_id]?.attributes.friendly_name ??
      seriesConfig.statistic_id;

    const colorToken =
      seriesConfig.color ??
      palette[index % palette.length] ??
      DEFAULT_COLORS[index % DEFAULT_COLORS.length];

    let colorValue: string | undefined;
    if (colorToken.startsWith("#") || colorToken.startsWith("rgb")) {
      colorValue = colorToken;
    } else if (colorToken.startsWith("var(")) {
      const extracted = colorToken.slice(4, -1).trim();
      colorValue = computedStyle.getPropertyValue(extracted)?.trim() || colorToken;
    } else {
      colorValue = computedStyle.getPropertyValue(colorToken)?.trim() || colorToken;
    }

    const id = `${seriesConfig.statistic_id}:${statType}:${chartType}:${index}`;
    unitBySeries.set(id, meta?.statistics_unit_of_measurement);
    seriesById.set(id, seriesConfig);

    const dataPoints: [number, number | null][] = raw.map((entry: StatisticValue) => {
      const statKey = statType as keyof StatisticValue;
      const value = entry[statKey];
      const date = entry.end ?? entry.start;
      return [date, typeof value === "number" ? value : null];
    });

    if (chartType === "line") {
      const lineSeries: LineSeriesOption = {
        id,
        name,
        type: "line",
        smooth: true,
        areaStyle: seriesConfig.area ? {} : undefined,
        data: dataPoints,
        stack: seriesConfig.stack,
        stackStrategy: seriesConfig.stack_strategy,
        yAxisIndex: seriesConfig.y_axis === "right" ? 1 : 0,
        emphasis: {
          focus: "series",
        },
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          color: colorValue,
        },
      };
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
        },
        itemStyle: {
          color: colorValue,
        },
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
