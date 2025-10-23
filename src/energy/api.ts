import {
  addDays,
  addMilliseconds,
  addMonths,
  addYears,
  differenceInDays,
  differenceInMonths,
  isFirstDayOfMonth,
  isLastDayOfMonth,
} from "date-fns";
import type { HomeAssistant } from "custom-card-helpers";
import type {
  EnergyData,
  EnergyInfo,
  EnergyPreferences,
  FossilEnergyConsumption,
  Statistics,
  StatisticsMetaData,
  StatisticsUnitConfiguration,
} from "./types";
import {
  energySourcesByType,
  getReferencedStatisticIds,
} from "./preferences";
import { fetchStatistics, getStatisticMetadata } from "./recorder";
import { getEnergyGasUnit, getEnergyWaterUnit } from "./units";
import { CompareMode, VOLUME_UNITS } from "./types";

export const getEnergyInfo = (hass: HomeAssistant) =>
  hass.callWS<EnergyInfo>({
    type: "energy/info",
  });

export const getEnergyPreferences = (hass: HomeAssistant) =>
  hass.callWS<EnergyPreferences>({
    type: "energy/get_prefs",
  });

export const getFossilEnergyConsumption = (
  hass: HomeAssistant,
  startTime: Date,
  energyStatisticIds: string[],
  co2StatisticId: string,
  endTime?: Date,
  period: "5minute" | "hour" | "day" | "month" = "hour"
) =>
  hass.callWS<FossilEnergyConsumption>({
    type: "energy/fossil_energy_consumption",
    start_time: startTime.toISOString(),
    end_time: endTime?.toISOString(),
    energy_statistic_ids: energyStatisticIds,
    co2_statistic_id: co2StatisticId,
    period,
  });

interface EnergyDataFetchParams {
  hass: HomeAssistant;
  prefs: EnergyPreferences;
  start: Date;
  end?: Date;
  compare?: CompareMode;
}

export const getEnergyData = async ({
  hass,
  prefs,
  start,
  end,
  compare,
}: EnergyDataFetchParams): Promise<EnergyData> => {
  const info = await getEnergyInfo(hass);

  let co2SignalEntity: string | undefined;
  const hassEntities = (hass as any)?.entities;
  if (hassEntities) {
    for (const entity of Object.values(hassEntities) as Array<{
      platform?: string;
      entity_id: string;
    }>) {
      if (!entity || entity.platform !== "co2signal") {
        continue;
      }
      const co2State = hass.states[entity.entity_id];
      if (!co2State || co2State.attributes.unit_of_measurement !== "%") {
        continue;
      }
      co2SignalEntity = co2State.entity_id;
      break;
    }
  }

  const consumptionStatisticIds: string[] = [];
  const sourcesByType = energySourcesByType(prefs);
  sourcesByType.grid?.forEach((source) => {
    source.flow_from.forEach((flow) => {
      consumptionStatisticIds.push(flow.stat_energy_from);
    });
  });

  const energyStatisticIds = getReferencedStatisticIds(prefs, info, [
    "grid",
    "solar",
    "battery",
    "gas",
    "device",
  ]);
  const waterStatisticIds = getReferencedStatisticIds(prefs, info, ["water"]);
  const allStatisticIds = [...energyStatisticIds, ...waterStatisticIds];

  const dayDifference = differenceInDays(end || new Date(), start);
  const period =
    isFirstDayOfMonth(start) &&
    (!end || isLastDayOfMonth(end)) &&
    dayDifference > 35
      ? "month"
      : dayDifference > 2
        ? "day"
        : "hour";

  const statsMetadataArray = allStatisticIds.length
    ? await getStatisticMetadata(hass, allStatisticIds)
    : [];

  const statsMetadata: Record<string, StatisticsMetaData> = {};
  statsMetadataArray.forEach((metadata) => {
    statsMetadata[metadata.statistic_id] = metadata;
  });

  const gasUnit = getEnergyGasUnit(hass, prefs, statsMetadata);
  const gasIsVolume = VOLUME_UNITS.includes(gasUnit as any);

  const energyUnits: StatisticsUnitConfiguration = {
    energy: "kWh",
    volume: gasIsVolume ? (gasUnit as (typeof VOLUME_UNITS)[number]) : undefined,
  };

  const waterUnit = getEnergyWaterUnit(hass, prefs, statsMetadata);
  const waterUnits: StatisticsUnitConfiguration = {
    volume: waterUnit,
  };

  const _energyStats: Promise<Statistics> | Statistics =
    energyStatisticIds.length
      ? fetchStatistics(hass, start, end, energyStatisticIds, period, energyUnits, [
          "change",
        ])
      : {};

  const _waterStats: Promise<Statistics> | Statistics = waterStatisticIds.length
    ? fetchStatistics(hass, start, end, waterStatisticIds, period, waterUnits, [
        "change",
      ])
    : {};

  let startCompare: Date | undefined;
  let endCompare: Date | undefined;
  let _energyStatsCompare: Promise<Statistics> | Statistics = {};
  let _waterStatsCompare: Promise<Statistics> | Statistics = {};

  if (compare) {
    if (compare === CompareMode.PREVIOUS) {
      if (isFirstDayOfMonth(start) && (!end || isLastDayOfMonth(end))) {
        const months = differenceInMonths(end || new Date(), start) + 1;
        startCompare = addMonths(start, -months);
      } else {
        startCompare = addDays(start, (dayDifference + 1) * -1);
      }
      endCompare = addMilliseconds(start, -1);
    } else if (compare === CompareMode.YOY) {
      startCompare = addYears(start, -1);
      endCompare = end ? addYears(end, -1) : addYears(new Date(), -1);
    }
    if (energyStatisticIds.length) {
      _energyStatsCompare = fetchStatistics(
        hass,
        startCompare!,
        endCompare,
        energyStatisticIds,
        period,
        energyUnits,
        ["change"]
      );
    }
    if (waterStatisticIds.length) {
      _waterStatsCompare = fetchStatistics(
        hass,
        startCompare!,
        endCompare,
        waterStatisticIds,
        period,
        waterUnits,
        ["change"]
      );
    }
  }

  let _fossilEnergyConsumption: Promise<FossilEnergyConsumption> | undefined;
  let _fossilEnergyConsumptionCompare:
    | Promise<FossilEnergyConsumption>
    | undefined;

  if (co2SignalEntity) {
    _fossilEnergyConsumption = getFossilEnergyConsumption(
      hass,
      start,
      consumptionStatisticIds,
      co2SignalEntity,
      end,
      period
    );
    if (compare && startCompare) {
      _fossilEnergyConsumptionCompare = getFossilEnergyConsumption(
        hass,
        startCompare,
        consumptionStatisticIds,
        co2SignalEntity,
        endCompare,
        period
      );
    }
  }

  const [energyStats, waterStats, energyStatsCompare, waterStatsCompare, fossilEnergyConsumption, fossilEnergyConsumptionCompare] =
    await Promise.all([
      _energyStats,
      _waterStats,
      _energyStatsCompare,
      _waterStatsCompare,
      _fossilEnergyConsumption,
      _fossilEnergyConsumptionCompare,
    ]);

  const stats: Statistics = { ...energyStats };
  Object.assign(stats, waterStats);

  const combinedStatsCompare: Statistics | undefined = energyStatsCompare
    ? { ...energyStatsCompare, ...waterStatsCompare }
    : undefined;

  return {
    start,
    end,
    startCompare,
    endCompare,
    compareMode: compare,
    prefs,
    info,
    stats,
    statsMetadata,
    statsCompare: combinedStatsCompare,
    waterUnit: waterUnit ?? (hass.config.unit_system.length === "km" ? "L" : "gal"),
    gasUnit: gasUnit ?? (hass.config.unit_system.length === "km" ? "m³" : "ft³"),
    co2SignalEntity,
    fossilEnergyConsumption: fossilEnergyConsumption ?? undefined,
    fossilEnergyConsumptionCompare: fossilEnergyConsumptionCompare ?? undefined,
  };
};
