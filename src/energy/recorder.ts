import type { HomeAssistant } from "custom-card-helpers";
import type {
  Statistics,
  StatisticsMetaData,
  StatisticsUnitConfiguration,
} from "./types";

export type StatisticsPeriod = "5minute" | "hour" | "day" | "week" | "month";

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

