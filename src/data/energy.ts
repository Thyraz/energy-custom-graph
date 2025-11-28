import type { HomeAssistant } from "custom-card-helpers";

export interface SolarSourceTypeEnergyPreference {
  type: "solar";
  stat_energy_from: string;
  config_entry_solar_forecast: string[] | null;
}

export interface EnergyPreferences {
  energy_sources: Array<
    | SolarSourceTypeEnergyPreference
    | { type: string; stat_energy_from?: string; config_entry_solar_forecast?: string[] | null }
  >;
}

export interface EnergySolarForecastEntry {
  wh_hours: Record<string, number>;
}

export type EnergySolarForecasts = Record<string, EnergySolarForecastEntry>;

export const fetchEnergyPreferences = (hass: HomeAssistant) =>
  hass.callWS<EnergyPreferences>({
    type: "energy/get_prefs",
  });

export const fetchEnergySolarForecasts = (hass: HomeAssistant) =>
  hass.callWS<EnergySolarForecasts>({
    type: "energy/solar_forecast",
  });
