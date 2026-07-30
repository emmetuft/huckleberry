# Plan: Datasource-Driven AI Context for Metric Generation

## Problem

The "Try with AI" and per-field magic buttons in `SaveMetricModal` currently pass only a flat column name list to the model. Without the datasource selected, generation is meaningless — the model can't suggest an aggregation column, date column, dimensions, or even a good name without knowing what data exists. Even with a datasource selected, column names alone underserve the model; knowing a column is `DECIMAL` vs `STRING` vs `DATE` and seeing a few representative values is the difference between useful suggestions and plausible-sounding noise.

---

## Goals

1. **Require datasource before any AI generation** — gate "Try with AI" and per-field magic behind datasource selection with a clear hint.
2. **Load schema with types** — capture `Column.type` (DataType enum) when the datasource is chosen; surface types in column dropdowns for the user too.
3. **Load sample rows** — fetch 5 rows in the background after schema loads; use them in AI context.
4. **Enrich both AI call paths** — "Try with AI" (fill-all) and per-field generation both receive a schema block and sample rows.
5. **Update the system prompt** — `METRIC_AI_FILL_SYSTEM` should tell the model to expect typed schema + sample data.

---

## Data available today

| Source | What it gives us |
|---|---|
| `DataService.getDataSource(id)` | `{ columns: Column[] }` where `Column = { id, name, type: DataType }` |
| `DataService.getDataSourceRows({ dataSourceId, schema, page, pageSize })` | `Record<string, string>[]` — rows with column name keys |
| `DataType` enum | `DATE`, `DATETIME`, `DECIMAL`, `DOUBLE`, `LONG`, `STRING` |

---

## State changes (`SaveMetricModal`)

Add three new pieces of state alongside `columnOptions`:

```ts
const [schema, setSchema] = useState<Column[]>([]);
const [sampleRows, setSampleRows] = useState<Record<string, string>[]>([]);
const [schemaLoading, setSchemaLoading] = useState(false);
```

---

## Datasource useEffect (replace existing)

Current behavior: on datasource change, fetch schema, map columns to `{ label: name, value: name }`, store in `columnOptions`.

New behavior:

1. Clear `schema`, `sampleRows`, set `schemaLoading = true`.
2. Call `getDataSource` → store full `Column[]` in `schema`; build column options with type labels (`"revenue_amount (DECIMAL)"`).
3. Set `schemaLoading = false` once schema resolves — column dropdowns are usable immediately.
4. Fire `getDataSourceRows({ page: 1, pageSize: 5 })` in the background (non-blocking). On success set `sampleRows`. On failure, silently ignore — sample data is best-effort.

The stale-response guard (`let active = true`) already exists and covers both calls.

---

## AI readiness gate

```ts
const aiReady = !!values.datasourceId && !schemaLoading;
```

- **"Try with AI" button**: disabled when `!aiReady`. Tooltip: `"Select a datasource first"` (no datasource) or `"Loading schema…"` (loading). Button text stays "Try with AI".
- **Per-field magic icons**: hidden (`showMagic && aiReady`) when datasource not yet chosen or schema still loading. Hidden rather than disabled to avoid cluttering the form with greyed-out buttons before context is available.

---

## AI context builder

A `buildDatasourceContext()` helper (local to the component):

```ts
const buildDatasourceContext = () => {
  const schemaLines = schema
    .map(c => `${c.name} (${c.type})`)
    .join(', ');

  const schemaBlock = `Dataset schema: ${schemaLines}`;

  if (!sampleRows.length) return schemaBlock;

  // Cap values at 60 chars to avoid token bloat
  const trimmedRows = sampleRows.slice(0, 3).map(row =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, String(v).slice(0, 60)])
    )
  );
  return `${schemaBlock}\n\nSample rows:\n${trimmedRows.map(r => JSON.stringify(r)).join('\n')}`;
};
```

---

## "Try with AI" prompt update

Replace the current `columnList` approach:

```ts
// Before
const input = `User request: ${request}\nAvailable columns: ${columnList}`;

// After
const input = `User request: ${request}\n\n${buildDatasourceContext()}`;
```

---

## Per-field generation context update

Append datasource context to the existing field-context string:

```ts
// Before
const context = otherFilledFields.map(...).join('\n');

// After
const fieldContext = otherFilledFields.map(...).join('\n');
const context = [fieldContext, buildDatasourceContext()].filter(Boolean).join('\n\n');
```

---

## System prompt update (`METRIC_AI_FILL_SYSTEM`)

Update the preamble to tell the model what format to expect:

> "You help configure a Domo Metric — a saved, structured aggregation over a dataset (NOT a raw SQL query). You will be given the dataset schema (column names with their data types: DATE, DATETIME, DECIMAL, DOUBLE, LONG, STRING) and optionally a few sample rows. Use the schema and sample data to infer appropriate columns for aggregation, date, and dimensions. Only use column names that appear in the schema. Produce a JSON object with these optional keys: ..."

---

## Column dropdown label change

Currently: `{ label: c.name, value: c.name }`.
Proposed: `{ label: `${c.name} (${c.type.toLowerCase()})`, value: c.name }`.

This surfaces type information in the dropdowns for the user as well, making it easier to pick the right date column vs measure column manually.

**Open question for you**: Do you want the type shown in the dropdown options, or keep labels as plain column names? It adds useful information but can look noisy for wide schemas.

---

## Files changed

| File | Change |
|---|---|
| `src/components/modals/SaveMetricModal/SaveMetricModal.tsx` | State, effects, AI call paths, JSX gating |
| `src/constants/metric.ts` | `METRIC_AI_FILL_SYSTEM` prompt update |

No new files, no service changes (existing `getDataSource` + `getDataSourceRows` cover everything).
