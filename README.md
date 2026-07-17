# @voltstack.energy/agsi

[![CI](https://github.com/achristopoulos-cmyk/voltstack-agsi/actions/workflows/ci.yml/badge.svg)](https://github.com/achristopoulos-cmyk/voltstack-agsi/actions/workflows/ci.yml)

Zero-dependency TypeScript client for [GIE](https://www.gie.eu/)'s transparency APIs: **AGSI+** (EU gas storage) and **ALSI** (LNG terminals). One class, typed records, auto-pagination, Node 18+.

AGSI+ is the official daily source for European gas storage levels, the dataset behind most "EU storage is at X%" headlines. The API is free but under-used because every project rewrites the same thin wrapper. This is that wrapper, done once.

## Install

```sh
npm install @voltstack.energy/agsi
```

## Auth

Register (free) at [agsi.gie.eu/account](https://agsi.gie.eu/account) to get an API key. The same key works for both AGSI+ and ALSI. The client sends it as the `x-key` header.

## Quickstart

```ts
import { GieClient, num } from '@voltstack.energy/agsi';

const agsi = new GieClient({ apiKey: process.env.GIE_API_KEY! });

// Latest EU-wide storage level
const eu = await agsi.euAggregate();
console.log(`EU storage: ${eu?.full}% on gas day ${eu?.gasDayStart}`);

// One country, one month
const de = await agsi.country('DE', { from: '2026-06-01', to: '2026-06-30', size: 300 });

// Full history for a country, paginated for you
for await (const day of agsi.records({ country: 'NL', from: '2020-01-01' })) {
  console.log(day.gasDayStart, num(day.full));
}

// LNG terminals (ALSI) use the same client
const alsi = new GieClient({ apiKey: process.env.GIE_API_KEY!, dataset: 'alsi' });
const lng = await alsi.euAggregate();
```

More runnable examples in [`examples/`](./examples).

## API surface

- `new GieClient({ apiKey, dataset?, baseUrl?, fetch? })` - one client per dataset (`'agsi'` default, or `'alsi'`).
- `client.storage(query?)` - one page of records (`GiePage`), matching the raw API response shape.
- `client.records(query?)` - an async generator that pages through every record for a query automatically.
- `client.euAggregate(date?)` - the latest EU-wide aggregate record, or a specific gas day.
- `client.country(code, query?)` - records for one country.
- `num(value)` - parses a GIE value string into `number | null`, treating `"-"` and other non-numeric values as unavailable.
- `alsiFullness(record)` - ALSI only. Derives tank fullness as a percentage from `inventory.gwh` / `dtmi.gwh`, since ALSI has no vendor-computed `full` field the way AGSI does. See the caveats below for why this exists instead of a plain division.
- `GieApiError` - thrown for non-2xx responses; carries `status` and `url`.

Every value from the API arrives as a string (see below); the client does not coerce numbers for you except through `num()` and `alsiFullness()`, so you can decide how to handle missing data.

## API behavior notes

These are caveats about the upstream API itself, observed against the live endpoints with a real key. Dates below are when each behavior was confirmed; GIE does not publish a changelog, so treat these as current best knowledge rather than permanent guarantees.

- **Values are strings, and `"-"` means unavailable** (e.g. pre-Brexit UK rows in AGSI+). Use `num()`, which returns `number | null`.
- **`data[0]` is the most recent gas day** in every response, both for a single query and for each page for a paginated one.
- **A gas day starts at 05:00 UTC**; daily data is published from 19:30 CE(S)T with late revisions at 23:00.
- **Settlement lag**: the most recent gas day available is typically about 2 days behind the query date (observed 2026-07-15: latest data was for 2026-07-13). Do not build an SLO that expects same-day data.
- **Rate limit is 60 requests/minute** per key, shared across AGSI+ and ALSI if you query both with the same key. `records()` pages sequentially; be considerate with long histories, and space out concurrent AGSI+/ALSI polling if you run both on a schedule.
- **A missing or invalid API key does not return HTTP 401.** It returns a 200 response with no usable data. Check the shape of what came back, not just `res.ok`, if you suspect a bad key.
- **Pagination is 1-indexed, and `page=0` silently returns page 1 again** rather than erroring or returning page 2 (`records()` already starts at page 1, so this only matters if you call `storage()` directly with an explicit page number).
- **AGSI+'s UK entry ("United Kingdom (Pre-Brexit)") has real data only through gas day 2020-12-30.** Every gas day after that is the literal string `"-"`, a Brexit-transition cutover rather than a general historical-depth limit; `num()`'s existing "-" handling already produces the correct cutoff with no special-casing needed.
- **ALSI's field names differ from AGSI+'s and are nested**, not flat strings: `sendOut` (GWh/d, a flow), `dtrs` (declared max send-out capacity, GWh/d, a flow cap), `inventory.gwh` (LNG held now, a stock), `dtmi.gwh` (declared max tank capacity, a stock cap). There is no vendor-computed fullness percentage for ALSI the way AGSI+ ships `full`; use `alsiFullness()` or divide the two yourself.
- **Some ALSI rows use the literal string `"0"`, not `"-"`, for both `inventory.gwh` and `dtmi.gwh`** (observed for GB / "United Kingdom (Pre-Brexit)" on historical gas days that otherwise have a real `sendOut` value). A plain division would read as a real 0% fullness rather than an honest gap. `alsiFullness()` treats a zero or missing `dtmi.gwh` as no data and returns `null`; if you compute fullness yourself, add the same guard.
- **Occasional one-off empty `data[]` responses** have been observed on both AGSI+ and ALSI for a query window that has real data on either side of it, with no rate-limit response involved; a retry of the identical request seconds later returned the expected rows. This client does not retry automatically, so it doesn't mask a genuine error as a transient one; if you're doing bulk historical backfills, consider retrying a chunk once or twice before treating it as truly empty.

## Attribution (required)

GIE's terms make crediting mandatory: when you use or republish this data, credit **GIE (Gas Infrastructure Europe), AGSI or ALSI** as the source.

## Worked example

Voltstack's live [EU Gas Storage Tracker](https://voltstack.energy/insights/eu-gas-storage-tracker-winter-2026) is built on this data: current fill versus the year-ago base and the five-year band, by country, updated every gas day. This package is the client that powers those storage widgets at voltstack.energy. More live European energy references at [voltstack.energy/insights](https://voltstack.energy/insights).

## Contributing

Issues and pull requests are welcome. The project is intentionally small and zero-dependency; new runtime dependencies need a strong justification to be accepted. Run `npm install`, `npm run build`, and `npm test` before opening a PR. The live smoke test in `test/client.test.mjs` only runs when a `GIE_API_KEY` environment variable is set; it skips cleanly otherwise, including in CI.

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## License

MIT © [Voltstack](https://voltstack.energy). Not affiliated with or endorsed by GIE.
