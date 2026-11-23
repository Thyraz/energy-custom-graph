import assert from "node:assert/strict";
import { test } from "node:test";
import type { PropertyValues } from "lit";
import type { HomeAssistant } from "custom-card-helpers";
import type {
  EnergyCustomGraphCardConfig,
  EnergyCustomGraphHeaderMetricConfig,
} from "../src/types";
import type { Statistics } from "../src/data/statistics";

if (typeof customElements === "undefined") {
  Object.defineProperty(globalThis, "customElements", {
    value: { define() {}, get() {} },
    configurable: true,
  });
}

interface HeaderChipCardState {
  hass: HomeAssistant;
  renderedChip?: string;
  renderCount: number;
  updateComplete: Promise<boolean>;
  isUpdatePending: boolean;
  enableUpdating(requested: boolean): void;
  _config: EnergyCustomGraphCardConfig;
  _statistics: Statistics;
  _headerChip?: { text: string };
  _scheduleLoad(key: string): void;
}

const START = Date.UTC(2026, 0, 1);
const END = START + 3 * 60 * 60 * 1000 - 1;
const entityMetric = {
  source: "entity_state",
  entity_id: "sensor.current",
} as const;
const calculationMetric = {
  calculation: {
    terms: [
      { source: "constant", constant: 2 },
      { ...entityMetric, operation: "multiply" },
    ],
  },
} as const satisfies EnergyCustomGraphHeaderMetricConfig;

const entity = (state: number | string, unit = "W") => ({
  state: String(state),
  attributes: { unit_of_measurement: unit },
}) as HomeAssistant["states"][string];

const settle = async (card: HeaderChipCardState): Promise<void> => {
  for (let pass = 0; pass < 10; pass++) {
    await card.updateComplete;
    if (!card.isUpdatePending) {
      return;
    }
  }
  throw new Error("Header chip update did not settle");
};

const createCard = async (metric: EnergyCustomGraphHeaderMetricConfig) => {
  const { EnergyCustomGraphCard } = await import("../src/energy-custom-graph-card");
  const { LitElement } = await import("lit");
  const reactiveUpdate = Object.getPrototypeOf(LitElement.prototype).update;

  // Run Lit's actual update lifecycle; replace only browser DOM painting.
  class HeadlessCard extends EnergyCustomGraphCard {
    renderedChip?: string;
    renderCount = 0;

    protected createRenderRoot(): HTMLElement {
      return {} as HTMLElement;
    }

    protected update(changes: PropertyValues): void {
      this.renderCount += 1;
      this.renderedChip = (this as unknown as HeaderChipCardState)._headerChip?.text;
      reactiveUpdate.call(this, changes);
    }
  }

  Object.defineProperty(globalThis, "document", {
    value: { documentElement: {}, body: {}, visibilityState: "visible" },
    configurable: true,
  });
  Object.defineProperty(globalThis, "getComputedStyle", {
    value: () => ({ getPropertyValue: () => "#555555" }),
    configurable: true,
  });

  const card = new HeadlessCard() as unknown as HeaderChipCardState;
  const scheduledLoads: string[] = [];
  card._scheduleLoad = (key) => scheduledLoads.push(key);
  Object.assign(card, {
    hass: {
      states: { "sensor.current": entity(10), "sensor.other": entity(1) },
      connected: true,
      locale: { language: "en-US" },
      config: { time_zone: "UTC", state: "RUNNING" },
    },
    _config: {
      type: "custom:energy-custom-graph-card",
      timespan: {
        mode: "fixed",
        start: new Date(START).toISOString(),
        end: new Date(END).toISOString(),
      },
      allow_compare: false,
      series: [{ id: "main", statistic_id: "sensor.test", chart_type: "line" }],
      header: { chip: { metric } },
      show_tooltip: false,
      show_x_axis_pointer: false,
    },
    _statistics: { "sensor.test": [{ start: START, end: END, change: 3 }] },
    _metadata: {},
    _periodStart: new Date(START),
    _periodEnd: new Date(END),
    _statisticsRange: { start: START, end: END },
    _statisticsPeriod: "hour",
    _lastRenderedRange: { start: START, end: END },
    _chartData: [{ type: "line", data: [] }],
  });
  card.enableUpdating(true);
  await settle(card);
  scheduledLoads.length = 0;
  return { card, scheduledLoads };
};

const setEntity = async (
  card: HeaderChipCardState,
  entityId: string,
  state: number | string,
  unit = "W"
): Promise<void> => {
  card.hass = {
    ...card.hass,
    states: { ...card.hass.states, [entityId]: entity(state, unit) },
  };
  await settle(card);
};

const scenarios: Array<{
  name: string;
  metric: EnergyCustomGraphHeaderMetricConfig;
  before: string;
  after: string;
}> = [
  { name: "entity-state", metric: entityMetric, before: "10 W", after: "20 W" },
  { name: "entity calculation", metric: calculationMetric, before: "20", after: "40" },
  {
    name: "mixed series/entity calculation",
    metric: {
      calculation: {
        terms: [
          { source: "series", series_id: "main", reducer: "sum" },
          entityMetric,
        ],
      },
    },
    before: "13",
    after: "23",
  },
];

for (const { name, metric, before, after } of scenarios) {
  test(`${name} header chip updates without waiting for recorder statistics`, async () => {
    const { card, scheduledLoads } = await createCard(metric);
    assert.equal(card.renderedChip, before);
    const statistics = card._statistics;
    await setEntity(card, "sensor.current", 20);
    assert.equal(card.renderedChip, after);
    assert.strictEqual(card._statistics, statistics);
    assert.deepEqual(scheduledLoads, []);
  });
}

test("unrelated entity updates do not render entity-state header chips", async () => {
  for (const metric of [entityMetric, calculationMetric]) {
    const { card, scheduledLoads } = await createCard(metric);
    const renders = card.renderCount;
    await setEntity(card, "sensor.other", 2);
    assert.equal(card.renderCount, renders);
    assert.deepEqual(scheduledLoads, []);
  }
});

test("series-only header chips keep ignoring entity-state changes", async () => {
  const { card } = await createCard({ source: "series", series_id: "main" });
  const renders = card.renderCount;
  await setEntity(card, "sensor.current", 20);
  assert.equal(card.renderedChip, "3");
  assert.equal(card.renderCount, renders);
});

test("unavailable header entities hide the chip and recover with a valid zero", async () => {
  const { card } = await createCard(entityMetric);
  await setEntity(card, "sensor.current", "unavailable");
  assert.equal(card.renderedChip, undefined);
  await setEntity(card, "sensor.current", 0);
  assert.equal(card.renderedChip, "0 W");
});

test("entity unit changes update header chips even when the numeric state is unchanged", async () => {
  const { card } = await createCard(entityMetric);
  await setEntity(card, "sensor.current", 10, "kW");
  assert.equal(card.renderedChip, "10 kW");
});

test("changing the configured header entity switches the live dependency", async () => {
  const { card } = await createCard(entityMetric);
  card._config = {
    ...card._config,
    header: { chip: { metric: { source: "entity_state", entity_id: "sensor.other" } } },
  };
  await settle(card);
  assert.equal(card.renderedChip, "1 W");
  const renders = card.renderCount;
  await setEntity(card, "sensor.current", 20);
  assert.equal(card.renderCount, renders);
  await setEntity(card, "sensor.other", 2);
  assert.equal(card.renderedChip, "2 W");
});
