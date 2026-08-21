# PRD: Card editor UX redesign

## Problem Statement

The Card editor is technically complete, but it has become hard to scan as the card gained options. Users see many similarly weighted controls, long labels, and nested option groups. Important workflows such as Series editing, finding the right Entity/Statistic type, duplicating a Series, understanding RAW history, and deleting a Series require too much background knowledge or YAML editing.

Support questions often come from users selecting an Entity whose aggregated statistics do not support the default Statistic type, or selecting a Raw-only entity without understanding when RAW history is needed. The editor should explain these states in-place without making users read the README.

## Solution

Redesign the Card editor around HA-native editor controls, compact layouts, Editor summaries, and severity-aware Editor help hints.

The editor should keep the Home Assistant preview behavior unchanged. It should preserve YAML compatibility, keep existing config keys, and avoid removing or renaming options. The change is primarily a UX restructuring of the existing configuration surface.

Top-level order:

1. Card header
2. Chart settings
3. Series

The editor should use collapsible Editor sections with summaries. Collapsible controls are used for orientation levels and repeated objects, not every small option group. Compact field grids and grouped toggles should reduce vertical noise where options are related and equal in type.

## User Stories

1. As a dashboard user, I want the Card editor organized into clear sections, so that I can find settings without reading the README.
2. As a Home Assistant user, I want the editor to look and behave like Home Assistant, so that it feels familiar.
3. As a user with many Series, I want each collapsed Series row to summarize its Entity, source type, chart type, axis, and warnings, so that I can scan the list quickly.
4. As a user with renamed Series, I want the Series summary to still show the underlying Entity or statistic name, so that I do not lose track of the source.
5. As a user, I want Card preview behavior preserved, so that I can keep seeing the card while editing.
6. As a user, I want Card header settings at the top, so that title and chip configuration are easy to find.
7. As a user, I want Chart settings to contain Timespan, Aggregation, Axes, Legend, and Tooltip, so that global chart behavior is grouped together.
8. As a user, I want Series editing to be the main open section, so that the primary card content is immediately accessible.
9. As a user, I want short labels with help icons, so that the UI can be compact without becoming cryptic.
10. As a user, I want real warnings to use a warning icon and color, so that I can distinguish help from problems.
11. As a user, I want error states to be visible inline, so that hard configuration problems are not hidden behind hover.
12. As a screen reader user, I want severity icons to have accessible labels, so that severity is not color-only.
13. As a user, I want Summary warnings to show cause and action, so that I know what to fix.
14. As a user, I want Raw only to appear as neutral text when RAW is supported, so that valid RAW setups do not look broken.
15. As a user, I want a warning when an Entity has no aggregated statistics and RAW history is not enabled, so that I understand why the chart may be empty.
16. As a user, I want Unknown entity to warn even if RAW is enabled, so that typos are visible.
17. As a user, I want External statistic to be identified separately from Entity, so that statistics without entity state are not mislabeled.
18. As a user, I want the Source field to be Entity-first, so that I can choose Entities before deciding whether I need RAW history.
19. As a user, I want the Source field to allow custom Entity IDs, so that advanced and newly created Entities remain possible.
20. As a user, I want Statistic type to be disabled for Raw-only entities, so that I do not think it affects RAW history.
21. As a user, I want Statistic type auto-selected after choosing an Entity with metadata, so that the chart works without knowing Recorder internals.
22. As a user, I want unsupported Statistic type options disabled, so that I can see what exists but avoid invalid choices.
23. As a YAML user, I want existing stat_type values preserved on editor open, so that the editor does not silently rewrite my config.
24. As an editor user, I want changing Entity to trigger fresh Statistic type detection, so that old values do not carry to a new Entity.
25. As a user, I want Entity-to-Calculation conversion to preserve the selected Entity as the first Calculation term, so that exploration does not destroy work.
26. As a user, I want Calculation-to-Entity conversion to restore the only Entity term when possible, so that I can switch back safely.
27. As a user, I want Forecast changes to clean Forecast-only fields when changing source type, so that unrelated config does not linger.
28. As a user, I want Duplicate series, so that I do not need YAML copy/paste for similar Series.
29. As a user, I want Duplicate series to insert below the original and open the copy in Source, so that I can immediately change the Entity.
30. As a user, I want duplicated Series to get a new internal id, so that references remain unique.
31. As a user, I want duplicated Series to keep an empty Series name if the original had no explicit name, so that Entity names continue to be used.
32. As a user, I want Delete series in the Series row header, so that deletion is available while collapsed.
33. As a user, I want Delete series to require confirmation, so that I do not lose complex Series accidentally.
34. As a user, I want Calculation term delete actions in term rows, so that repeated objects are easier to manage.
35. As a user, I do not want confirmation for deleting individual Calculation terms, so that editing small terms stays fast.
36. As a user, I want Add series in the Series section header, so that it stays reachable with many Series.
37. As a first-time user, I want Add series also shown in the empty state, so that setup is obvious.
38. As a user, I want new Series to start without stat_type until Entity is chosen, so that the editor does not write the old change default prematurely.
39. As a user, I want Series name to be optional and above the Series option groups, so that it is clearly an identity field.
40. As a user, I want Series option groups Source, Style, Visibility, and Transform, so that options are grouped by intent without looking like mutually exclusive setting values.
41. As a user, I want Source to contain Entity, Calculation, and Forecast, so that source selection is explicit.
42. As a user, I want Style to contain chart type, axis, color, stack, fill, and line styling, so that appearance is separate from visibility.
43. As a user, I want Visibility to contain Chart, Legend, Tooltip, Hidden by default, and Value labels, so that visibility choices are grouped.
44. As a user, I want Transform to contain Multiply, Add, Clip min, and Clip max, so that value-changing options are clearly separated.
45. As a user, I want Smooth under Style More, so that visual interpolation is not confused with value transform.
46. As a user, I want Fill directly visible for line and step Series, so that common area display is easy to enable.
47. As a user, I want Gradient fill, Fill opacity, Fill to series, Line opacity, Line width, Line style, and Compare series color under Style More, so that fine tuning does not crowd the main view.
48. As a user, I want Stack group directly visible in Style, so that energy stacking remains discoverable.
49. As a user, I want Value label precision under Visibility More only when Value labels are enabled, so that precision appears only when relevant.
50. As a user, I want More sections to open automatically when they contain non-default values, so that active hidden config is not missed.
51. As a user, I want More summaries like More · 2 set, so that I can see hidden active settings.
52. As a user, I want More labeled More, not Advanced, so that the UI feels less expert-only.
53. As a user, I want Forecast summary to show all solar forecasts or the selected PV production sensor, so that Forecast setup is clear.
54. As a user, I want Card header to be collapsed when empty, so that it does not take space.
55. As a user, I want Card header summary to show none, title, and chip state, so that I can scan header setup.
56. As a user, I want Title in Card header, so that visible header options are grouped together.
57. As a user, I want Header chip options compact under Title, so that the header reads as one unit.
58. As a user, I want Header chip Label, Unit, and Precision visible when chip is enabled, so that visible chip text is easy to edit.
59. As a user, I want Header chip Metric as Series, Stack, Entity, or Calculation, so that metric source is clear.
60. As a user, I want Header metric Transform under More, so that advanced numeric adjustments do not crowd basic metric selection.
61. As a user, I want Header Calculation terms compact and summarized, so that chip calculations are manageable.
62. As a user, I want Timespan first in Chart settings, so that the data range is the first chart decision.
63. As a user, I want Timespan mode as Energy, Relative, Fixed, so that mode choice is compact.
64. As a user, I want Collection key under Timespan More, so that rare multi-picker setup does not distract.
65. As a user, I want Collection key hint to say it is usually not needed, so that I do not enter unnecessary values.
66. As a user, I want the card to follow HA's page-url energy collection default, so that collection_key is not required for normal dashboards.
67. As a user, I want a legacy fallback for old energy collection behavior, so that older dashboards keep working.
68. As a user, I want Allow compare directly visible in Energy mode, so that Energy date picker compare behavior is discoverable.
69. As a user, I want Allow compare disabled with warning when Series time offset makes it ineffective, so that I understand why compare is ignored.
70. As a user, I want Relative Timespan to separate Calendar and Rolling, so that Day and Last 24 hours are not confused.
71. As a user, I want Timespan count only for Relative Calendar periods, so that irrelevant controls disappear.
72. As a user, I want Offset visible for Relative Calendar periods, so that previous period workflows are easy.
73. As a user, I want Fixed Timespan Start and End side by side, so that fixed ranges are compact.
74. As a user, I want Aggregation after Timespan and initially open, so that data availability issues are easy to fix.
75. As a user, I want Energy Timespan Aggregation to show Energy picker range overrides, so that picker-specific aggregation is configurable.
76. As a user, I want Relative and Fixed Aggregation to show Manual and Fallback, so that non-picker modes are explicit.
77. As a user, I want RAW history as a normal Select option, not a separate competing toggle, so that Aggregation has one source of truth.
78. As a user, I want the label RAW history, so that the option is clear.
79. As a user, I want Fallback aggregation visible, so that RAW can be enabled as a rescue path for Raw-only entities.
80. As a user, I want default Manual aggregation shown as Automatic, so that empty config has a readable label.
81. As a user, I want default Fallback aggregation shown as None, so that optional fallback is clear.
82. As a user, I want Raw options visible only when RAW is configured, so that RAW-only options do not appear out of context.
83. As a user, I want Significant changes only visible when RAW is active, so that RAW behavior can be controlled.
84. As a user, I want Compute current hour value directly visible, so that a key card feature is discoverable.
85. As a user, I want Compute current hour value explained in a help hint, so that I understand Home Assistant only publishes hourly aggregates after the hour completes.
86. As a user, I want Compute current hour value contextual, so that it does not appear as useful where hourly aggregation cannot apply.
87. As a user, I want Aggregation summary to show Current hour estimate, so that active current-hour behavior is visible.
88. As a user, I want Axes after Aggregation and collapsed by default, so that chart structure is available but not noisy.
89. As a user, I want Axes summary to show left/right axis setup and unused right-axis config, so that axis problems are visible.
90. As a user, I want Right Y axis visible only when used or configured, so that the editor stays compact.
91. As a user, I want Center zero visible in Axes, so that axis behavior is easy to find.
92. As a user, I want Min value, Max value, and Unit in a compact grid per axis, so that axis configuration is dense and readable.
93. As a user, I want Grid, Name, and Values as a compact axis visibility toggle group, so that related toggles are easy to scan.
94. As a user, I want Legend collapsed by default with summary, so that common defaults do not take space.
95. As a user, I want Show legend as a positive toggle, so that checked means visible.
96. As a user, I want Legend sort visible when legend is active, so that ordering is easy.
97. As a user, I want Expand legend by default visible when legend is active, so that initial legend state is easy to configure.
98. As a user, I want Tooltip collapsed by default with summary, so that details stay available but compact.
99. As a user, I want Show tooltip visible, so that tooltip behavior is obvious.
100. As a user, I want Tooltip details as a compact toggle group, so that X pointer, Y pointer, Units, and Stack sums do not need four rows.
101. As a user, I want Tooltip precision visible when tooltip is active, so that value formatting is easy.

## Implementation Decisions

- Preserve YAML compatibility. Do not remove, rename, or schema-break existing config options.
- Keep Home Assistant's card preview behavior unchanged. The editor only controls its own configuration UI.
- Prefer HA-native editor controls and styling. Use custom code only for layout density, summaries, badges, severity-aware hints, and glue logic.
- Top-level Editor sections are Card header, Chart settings, and Series.
- Use collapsible controls for top-level sections and repeated objects. Avoid making every small option group collapsible.
- Use Editor summaries for collapsed sections and Series rows.
- Use short captions when grouped context or Editor help hints make them unambiguous.
- Compact multi-toggle rows are allowed only for equal Boolean options in the same mental group.
- Implement a severity-aware Editor help hint renderer with info, warning, and error states. Info uses a help icon; warning/error use alert icons and HA warning/error colors.
- Summary severity uses icon plus colored cause/action text. Do not write Warning/Error as text in summaries. Provide accessible labels on severity icons.
- More options is the user-facing label for advanced contextual options. More appears only when it has applicable content and opens automatically when it contains non-default values.
- Metadata for configured Entity IDs and Calculation term Entity IDs is loaded in a deduplicated batch on editor open. Newly selected Entity IDs load metadata once and use a cache.
- Do not load a global statistic list for the editor.
- Source fields are Entity-first and use an entity-friendly picker with allow-custom-entity.
- The YAML key statistic_id remains unchanged even though the editor label is Entity.
- Entity source status resolves to Entity, Raw only, External statistic, or Unknown entity based on hass.states and statistic metadata.
- Statistic type is active only when statistic metadata exists. For Raw-only entities it is disabled and not newly written.
- Raw-only entities warn only when RAW history is not configured anywhere in the card.
- Unknown entity always warns.
- External statistic is shown separately from Entity and keeps Statistic type active.
- On Entity change, auto-select Statistic type from metadata. Prefer change when has_sum is true; otherwise mean when mean_type is available.
- On editor open, do not automatically rewrite existing YAML stat_type values.
- Unsupported Statistic type options are disabled, but existing unsupported configured values remain visible with warning context.
- Apply the same Entity/Statistic type rules to Calculation terms.
- Series source labels are Entity, Calculation, and Forecast.
- Series option groups are Source, Style, Visibility, and Transform.
- Series option groups are collapsible and multiple groups may be open at the same time.
- Series name is optional, rendered above Series option groups, and falls back to Entity/statistic name when empty.
- Add series creates an Entity Series without stat_type, opens it, and opens the Source option group.
- Duplicate series creates a new id, copies config, inserts below original, opens the Source option group, and only appends copy to Series name when the original had an explicit Series name.
- Delete series is a header icon action and always confirms.
- Move up/down remain reliable buttons. Drag-and-drop is out of scope for this PRD.
- Calculation term delete actions move into term headers and do not confirm.
- Duplicate Calculation term is out of scope.
- Entity to Calculation preserves the selected Entity and Statistic type as the first term when present.
- Calculation to Entity restores the sole Entity term when exactly one Entity term exists.
- Forecast source changes clean Forecast-only fields without cross-source carryover.
- Card header contains Title and Header chip.
- Header chip is compact under Title; Label, Unit, and Precision are visible when chip is enabled.
- Header chip Metric remains a flat segmented control: Series, Stack, Entity, Calculation.
- Header metric Transform fields live in More.
- Chart settings contains Timespan, Aggregation, Axes, Legend, and Tooltip.
- Chart height moves to Chart settings More.
- Timespan mode is Energy, Relative, Fixed.
- Collection key moves to Timespan More with a hint that it is usually only needed for multiple independent Energy date pickers on one dashboard page.
- Energy collection lookup should follow HA's page-url default when collection_key is absent, with legacy fallback.
- Allow compare stays visible in Energy mode and disables with warning when Series time offset makes compare ineffective.
- Relative Timespan separates Calendar and Rolling. Count and Offset apply only to Calendar.
- Fixed Timespan shows Start and End as a compact two-field layout.
- Aggregation is directly after Timespan and initially open.
- Aggregation remains the only place to configure RAW history. Do not add a separate RAW toggle.
- RAW label is RAW history.
- Manual aggregation default label is Automatic. Fallback aggregation default label is None.
- Fallback aggregation stays directly visible.
- Raw options appear only when RAW is configured. Significant changes only is visible when RAW is configured.
- Compute current hour value stays directly visible, contextual, and explained by an Editor help hint.
- Axes is collapsed by default and shows summary. Right Y axis is visible only when used or configured.
- Legend and Tooltip are collapsed by default and show summaries.
- Legend toggle is positive: Show legend.
- Tooltip details use compact toggles for X pointer, Y pointer, Units, and Stack sums.

## Testing Decisions

- Test external behavior and state transitions, not private rendering details.
- Build must pass with the existing build command.
- Extract pure helper seams for summary generation, source status resolution, Statistic type support, auto Statistic type selection, and RAW warning detection where practical.
- Unit-test helper behavior for Entity with metadata, Raw-only entity, External statistic, Unknown entity, Raw-only without RAW, Raw-only with RAW, existing unsupported stat_type, and Entity change auto-selection.
- Test source conversion helpers for Entity to Calculation, Calculation to Entity, Forecast cleanup, Duplicate series, and Delete series confirmation behavior.
- Manually verify editor UX in Home Assistant or a local editor harness across desktop and narrow layouts.
- Verify that Home Assistant card preview remains beside the editor on wide layouts and below on narrow layouts.
- Verify text does not overflow compact controls and summary rows.
- Verify existing YAML configs remain loadable and are not rewritten merely by opening the editor.
- Verify no /dist update is required unless a release/build task explicitly asks for generated output.

## Repo Notes For Implementation

- Main editor file: `src/energy-custom-graph-card-editor.ts`.
- Runtime card file: `src/energy-custom-graph-card.ts`.
- Statistics helpers already exist in `src/data/statistics.ts`.
- RAW history helpers already exist in `src/data/history.ts`.
- Config types live in `src/types.ts`.
- Home Assistant frontend reference snapshot lives outside the package in `../frontend-20260624.6/`.
- HA `ha-help-tooltip` has a fixed help icon; severity-aware hints likely need a small local renderer around `ha-svg-icon` and `ha-tooltip`.
- HA energy collection default behavior is implemented in the frontend snapshot by deriving a default key from `hass.panelUrl` when `collection_key` is absent. The card currently has custom fallback logic that should be made robust without version-string comparison.
- There is currently no project test suite. Prefer extracting pure helpers before adding tests. If adding test tooling is too much for the first implementation slice, at minimum run `npm run build` and manually verify the editor.
- Do not update `dist/` or `docs/img/` unless explicitly requested.

## Out of Scope

- No YAML schema breaking changes.
- No removal or renaming of existing config keys.
- No search/filter in the first iteration.
- No drag-and-drop Series reordering in the first iteration.
- No Duplicate Calculation term in the first iteration.
- No redesign of the rendered card/chart look.
- No custom editor font or copied visual style from reference cards.
- No screenshot updates.
- No global statistic list loading.

## Further Notes

- The reference Statistics Graph Chart Card editor informed the UX direction: compact rows, grouped options, hover hints, and category icons. The visual style should remain Home Assistant-like rather than copying that card.
- The Editor should reduce README dependency by placing concise Editor help hints next to options.
- `Raw only` is a neutral state. Warning appears only when the selected Raw-only entity cannot be shown because RAW history is not enabled anywhere in the card configuration.
- The wording in summaries should be concise and action-oriented, for example: Entity has no aggregated statistics · Enable RAW history.
