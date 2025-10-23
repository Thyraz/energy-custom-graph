import type { HomeAssistant } from "custom-card-helpers";

export type StatisticsPeriod = "5minute" | "hour" | "day" | "week" | "month";

export interface StatisticValue {
  start: number;
  end: number;
  change?: number | null;
  last_reset?: number | null;
  max?: number | null;
  mean?: number | null;
  min?: number | null;
  sum?: number | null;
  state?: number | null;
}

export type Statistics = Record<string, StatisticValue[]>;

export interface StatisticsMetaData {
  statistics_unit_of_measurement: string | null;
  statistic_id: string;
  source: string;
  name?: string | null;
  has_sum: boolean;
  mean_type: number;
  unit_class: string | null;
}

export interface StatisticsUnitConfiguration {
  energy?: "Wh" | "kWh" | "MWh" | "GJ";
  power?: "W" | "kW";
  pressure?:
    | "Pa"
    | "hPa"
    | "kPa"
    | "bar"
    | "cbar"
    | "mbar"
    | "inHg"
    | "psi"
    | "mmHg";
  temperature?: "°C" | "°F" | "K";
  volume?: string;
}

export const getStatisticMetadata = (
  hass: HomeAssistant,
  statisticIds?: string[]
) =>
  hass.callWS<StatisticsMetaData[]>({
    type: "recorder/get_statistics_metadata",
    statistic_ids: statisticIds,
  });

export const fetchStatistics = (
  hass: HomeAssistant,
  startTime: Date,
  endTime?: Date,
  statisticIds?: string[],
  period: StatisticsPeriod = "hour",
  units?: StatisticsUnitConfiguration,
  types?: Array<"change" | "state" | "sum" | "min" | "max" | "mean">
) =>
  hass.callWS<Statistics>({
    type: "recorder/statistics_during_period",
    start_time: startTime.toISOString(),
    end_time: endTime?.toISOString(),
    statistic_ids: statisticIds,
    period,
    units,
    types,
  });

export const getDisplayUnit = (
  hass: HomeAssistant,
  statisticsId: string | undefined,
  statisticsMetaData: StatisticsMetaData | undefined
): string | null | undefined => {
  let unit: string | undefined;
  if (statisticsId) {
    unit = hass.states[statisticsId]?.attributes.unit_of_measurement;
  }
  return unit === undefined
    ? statisticsMetaData?.statistics_unit_of_measurement
    : unit;
};

export const getStatisticLabel = (
  hass: HomeAssistant,
  statisticsId: string,
  statisticsMetaData: StatisticsMetaData | undefined
): string => {
  const entity = hass.states?.[statisticsId];
  const friendlyName =
    entity?.attributes?.friendly_name ?? statisticsMetaData?.name;
  return friendlyName || statisticsId;
};

