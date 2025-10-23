declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

import "./energy-custom-graph-card";

window.customCards = window.customCards || [];
window.customCards.push({
  type: "energy-custom-graph-card",
  name: "Energy Custom Graph",
  description:
    "Flexible energy statistics chart with custom stacking, axes, and colors.",
});

