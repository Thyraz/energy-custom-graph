import type { HomeAssistant } from "custom-card-helpers";
import { getDisplayUnit } from "./recorder";
import type {
  EnergyPreferences,
  StatisticsMetaData,
} from "./types";
import { VOLUME_UNITS } from "./types";

const energyGasUnitClass = ["volume", "energy"] as const;
export type EnergyGasUnitClass = (typeof energyGasUnitClass)[number];

export const getEnergyGasUnitClass = (
  prefs: EnergyPreferences,
  excludeSource?: string,
  statisticsMetaData: Record<string, StatisticsMetaData> = {}
): EnergyGasUnitClass | undefined => {
  for (const source of prefs.energy_sources) {
    if (source.type !== "gas") {
      continue;
    }
    if (excludeSource && excludeSource === source.stat_energy_from) {
      continue;
    }
    const metadata = statisticsMetaData[source.stat_energy_from];
    if (
      metadata?.unit_class &&
      energyGasUnitClass.includes(metadata.unit_class as EnergyGasUnitClass)
    ) {
      return metadata.unit_class as EnergyGasUnitClass;
    }
  }
  return undefined;
};

export const getEnergyGasUnit = (
  hass: HomeAssistant,
  prefs: EnergyPreferences,
  statisticsMetaData: Record<string, StatisticsMetaData> = {}
): string => {
  const unitClass = getEnergyGasUnitClass(
    prefs,
    undefined,
    statisticsMetaData
  );
  if (unitClass === "energy") {
    return "kWh";
  }

  const units = prefs.energy_sources
    .filter((source) => source.type === "gas")
    .map((source) =>
      getDisplayUnit(
        hass,
        source.stat_energy_from,
        statisticsMetaData[source.stat_energy_from]
      )
    )
    .filter((unit): unit is string => Boolean(unit));

  if (units.length) {
    const first = units[0];
    if (
      VOLUME_UNITS.includes(first as (typeof VOLUME_UNITS)[number]) &&
      units.every((unit) => unit === first)
    ) {
      return first;
    }
  }

  return hass.config.unit_system.length === "km" ? "m³" : "ft³";
};

export const getEnergyWaterUnit = (
  hass: HomeAssistant,
  prefs: EnergyPreferences,
  statisticsMetaData: Record<string, StatisticsMetaData>
): (typeof VOLUME_UNITS)[number] => {
  const units = prefs.energy_sources
    .filter((source) => source.type === "water")
    .map((source) =>
      getDisplayUnit(
        hass,
        source.stat_energy_from,
        statisticsMetaData[source.stat_energy_from]
      )
    )
    .filter((unit): unit is string => Boolean(unit));

  if (units.length) {
    const first = units[0];
    if (
      VOLUME_UNITS.includes(first as (typeof VOLUME_UNITS)[number]) &&
      units.every((unit) => unit === first)
    ) {
      return first as (typeof VOLUME_UNITS)[number];
    }
  }

  return hass.config.unit_system.length === "km" ? "L" : "gal";
};

