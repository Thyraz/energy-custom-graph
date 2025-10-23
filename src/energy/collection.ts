import { addHours, endOfDay, startOfDay } from "date-fns";
import type { HomeAssistant } from "custom-card-helpers";
import { getEnergyData, getEnergyPreferences } from "./api";
import type {
  CompareMode,
  EnergyData,
  EnergyPreferences,
} from "./types";

export interface EnergyCollection {
  refresh(): Promise<void> | void;
  unsubscribe(): void;
  setPeriod(start: Date, end?: Date): void;
  setCompare(compare: CompareMode): void;
}

export interface EnergyCollectionOptions {
  prefs?: EnergyPreferences;
  key?: string;
  start?: Date;
  end?: Date;
  compare?: CompareMode;
}

type EnergySubscriber = (data: EnergyData) => void;

interface SharedCollection {
  subscribe(subscriber: EnergySubscriber): () => void;
  refresh(): Promise<void>;
  setPeriod(start: Date, end?: Date): void;
  setCompare(compare: CompareMode): void;
  clearPrefs(): void;
  prefs?: EnergyPreferences;
  start: Date;
  end?: Date;
  compare?: CompareMode;
}

const LOCAL_COLLECTIONS = new WeakMap<HomeAssistant, Map<string, EnergyCollectionImpl>>();

const getLocalMap = (hass: HomeAssistant) => {
  let map = LOCAL_COLLECTIONS.get(hass);
  if (!map) {
    map = new Map();
    LOCAL_COLLECTIONS.set(hass, map);
  }
  return map;
};

class EnergyCollectionImpl implements SharedCollection {
  public prefs?: EnergyPreferences;
  public start: Date;
  public end?: Date;
  public compare?: CompareMode;

  private refreshTimeout?: number;
  private updatePeriodTimeout?: number;
  private initialized = false;
  private data?: EnergyData;
  private subscribers = new Set<EnergySubscriber>();

  constructor(
    private hass: HomeAssistant,
    private key: string,
    options: EnergyCollectionOptions
  ) {
    this.start = options.start ?? startOfDay(new Date());
    this.end = options.end ?? endOfDay(new Date());
    this.compare = options.compare;
    this.prefs = options.prefs;
    void this.initialize();
  }

  private async initialize() {
    try {
      if (!this.prefs) {
        this.prefs = await getEnergyPreferences(this.hass);
      }
      this.initialized = true;
      await this.fetchAndEmit();
      this.scheduleHourlyRefresh();
      this.scheduleUpdatePeriod();
    } catch (error) {
      console.error(
        "[energy-custom-graph] Failed to initialize energy collection",
        error
      );
    }
  }

  private scheduleHourlyRefresh() {
    if (this.refreshTimeout) {
      window.clearTimeout(this.refreshTimeout);
    }
    if (!this.subscribers.size) {
      return;
    }
    const nextFetch = new Date();
    if (nextFetch.getMinutes() >= 20) {
      nextFetch.setHours(nextFetch.getHours() + 1);
    }
    nextFetch.setMinutes(20, 0, 0);
    this.refreshTimeout = window.setTimeout(() => {
      void this.refresh();
    }, nextFetch.getTime() - Date.now());
  }

  private scheduleUpdatePeriod() {
    if (this.updatePeriodTimeout) {
      window.clearTimeout(this.updatePeriodTimeout);
      this.updatePeriodTimeout = undefined;
    }
    if (!this.subscribers.size) {
      return;
    }
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    if (
      this.start.getTime() === todayStart.getTime() &&
      this.end?.getTime() === todayEnd.getTime()
    ) {
      const nextUpdate = addHours(todayEnd, 1).getTime() - Date.now();
      this.updatePeriodTimeout = window.setTimeout(() => {
        this.start = startOfDay(new Date());
        this.end = endOfDay(new Date());
        void this.refresh();
        this.scheduleUpdatePeriod();
      }, Math.max(nextUpdate, 0));
    }
  }

  private clearTimers() {
    if (this.refreshTimeout) {
      window.clearTimeout(this.refreshTimeout);
      this.refreshTimeout = undefined;
    }
    if (this.updatePeriodTimeout) {
      window.clearTimeout(this.updatePeriodTimeout);
      this.updatePeriodTimeout = undefined;
    }
  }

  private async fetchAndEmit() {
    if (!this.prefs) {
      return;
    }
    try {
      const data = await getEnergyData({
        hass: this.hass,
        prefs: this.prefs,
        start: this.start,
        end: this.end,
        compare: this.compare,
      });
      this.data = data;
      this.subscribers.forEach((subscriber) => subscriber(data));
    } catch (error) {
      console.error(
        "[energy-custom-graph] Failed to fetch energy data",
        error
      );
    }
  }

  public subscribe(subscriber: EnergySubscriber): () => void {
    this.subscribers.add(subscriber);
    if (this.data) {
      subscriber(this.data);
    }
    this.scheduleHourlyRefresh();
    this.scheduleUpdatePeriod();
    return () => {
      this.subscribers.delete(subscriber);
      if (!this.subscribers.size) {
        this.clearTimers();
      }
    };
  }

  public async refresh(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
      return;
    }
    await this.fetchAndEmit();
    this.scheduleHourlyRefresh();
  }

  public setPeriod(start: Date, end?: Date): void {
    this.start = start;
    this.end = end;
    this.scheduleUpdatePeriod();
    void this.refresh();
  }

  public setCompare(compare: CompareMode): void {
    this.compare = compare;
    void this.refresh();
  }

  public clearPrefs(): void {
    this.prefs = undefined;
  }
}

const ensureKey = (optionsKey?: string) => {
  if (!optionsKey) {
    return "_energy";
  }
  if (!optionsKey.startsWith("energy_")) {
    console.warn(
      "[energy-custom-graph] collection_key should start with energy_"
    );
  }
  return `_${optionsKey}`;
};

const getSharedCollection = (
  hass: HomeAssistant,
  key: string,
  options: EnergyCollectionOptions
) => {
  const existing = (hass.connection as any)[key] as SharedCollection | undefined;
  if (existing && typeof existing.subscribe === "function") {
    return existing;
  }

  const map = getLocalMap(hass);
  let collection = map.get(key);
  if (!collection) {
    collection = new EnergyCollectionImpl(hass, key, options);
    map.set(key, collection);
    (hass.connection as any)[key] = collection;
  } else if (options.prefs && !collection.prefs) {
    collection.prefs = options.prefs;
  }
  return collection;
};

export const subscribeEnergyCollection = (
  hass: HomeAssistant,
  subscriber: EnergySubscriber,
  options: EnergyCollectionOptions = {}
): EnergyCollection => {
  const key = ensureKey(options.key);
  const shared = getSharedCollection(hass, key, options);
  const unsubscribe = shared.subscribe(subscriber);

  return {
    refresh: () => shared.refresh(),
    setPeriod: (start, end) => shared.setPeriod(start, end),
    setCompare: (compare) => shared.setCompare(compare),
    unsubscribe: () => unsubscribe(),
  };
};

export const setEnergyCollectionPeriod = (
  collection: EnergyCollection,
  start: Date,
  end?: Date
) => collection.setPeriod(start, end);

export const setEnergyCollectionCompare = (
  collection: EnergyCollection,
  compare: CompareMode
) => collection.setCompare(compare);

