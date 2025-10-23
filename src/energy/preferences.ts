import type {
  EnergyInfo,
  EnergyPreferences,
  EnergySource,
  EnergySourceType,
  GridSourceTypeEnergyPreference,
  SolarSourceTypeEnergyPreference,
  BatterySourceTypeEnergyPreference,
  GasSourceTypeEnergyPreference,
  WaterSourceTypeEnergyPreference,
} from "./types";

export interface EnergySourceByType {
  grid?: GridSourceTypeEnergyPreference[];
  solar?: SolarSourceTypeEnergyPreference[];
  battery?: BatterySourceTypeEnergyPreference[];
  gas?: GasSourceTypeEnergyPreference[];
  water?: WaterSourceTypeEnergyPreference[];
}

export const energySourcesByType = (
  prefs: EnergyPreferences
): EnergySourceByType => {
  const byType: EnergySourceByType = {};
  prefs.energy_sources.forEach((source) => {
    const type = source.type as EnergySourceType;
    if (!byType[type]) {
      (byType as Record<string, EnergySource[]>)[type] = [];
    }
    (byType as Record<string, EnergySource[]>)[type].push(
      source as EnergySource
    );
  });
  return byType;
};

export const getReferencedStatisticIds = (
  prefs: EnergyPreferences,
  info: EnergyInfo,
  includeTypes?: Array<EnergySourceType | "device">
): string[] => {
  const statIds: string[] = [];

  prefs.energy_sources.forEach((source) => {
    const include = !includeTypes || includeTypes.includes(source.type);
    if (!include && source.type !== "grid") {
      return;
    }

    if (source.type === "solar") {
      if (!include) {
        return;
      }
      statIds.push(source.stat_energy_from);
      return;
    }

    if (source.type === "gas" || source.type === "water") {
      if (!include) {
        return;
      }
      statIds.push(source.stat_energy_from);
      if (source.stat_cost) {
        statIds.push(source.stat_cost);
      }
      const costStatId = info.cost_sensors[source.stat_energy_from];
      if (costStatId) {
        statIds.push(costStatId);
      }
      return;
    }

    if (source.type === "battery") {
      if (!include) {
        return;
      }
      statIds.push(source.stat_energy_from);
      statIds.push(source.stat_energy_to);
      return;
    }

    if (source.type !== "grid") {
      return;
    }

    source.flow_from.forEach((flow) => {
      if (includeTypes && !includeTypes.includes("grid")) {
        return;
      }
      statIds.push(flow.stat_energy_from);
      if (flow.stat_cost) {
        statIds.push(flow.stat_cost);
      }
      const costStatId = info.cost_sensors[flow.stat_energy_from];
      if (costStatId) {
        statIds.push(costStatId);
      }
    });

    source.flow_to.forEach((flow) => {
      if (includeTypes && !includeTypes.includes("grid")) {
        return;
      }
      statIds.push(flow.stat_energy_to);
      if (flow.stat_compensation) {
        statIds.push(flow.stat_compensation);
      }
      const costStatId = info.cost_sensors[flow.stat_energy_to];
      if (costStatId) {
        statIds.push(costStatId);
      }
    });
  });

  if (!includeTypes || includeTypes.includes("device")) {
    statIds.push(...prefs.device_consumption.map((d) => d.stat_consumption));
  }

  return statIds;
};

