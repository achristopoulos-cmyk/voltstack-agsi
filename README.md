# @voltstack/agsi

Zero-dependency TypeScript client for [GIE](https://www.gie.eu/)'s transparency APIs: **AGSI+** (EU gas storage) and **ALSI** (LNG terminals). One class, typed records, auto-pagination, Node 18+.

AGSI+ is the official daily source for European gas storage levels, the dataset behind most "EU storage is at X%" headlines. The API is free but under-used because every project rewrites the same thin wrapper. This is that wrapper, done once.

## Install

```sh
npm install @voltstack/agsi
```

## Auth

Register (free) at [agsi.gie.eu](https://agsi.gie.eu/account) to get an API key. The client sends it as the `x-key` header.

## Quickstart

```ts
import { GieClient, num } from '@voltstack/agsi';

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

## Things the API will surprise you with

- **Values are strings**, and `"-"` means unavailable (e.g. pre-Brexit UK rows). Use the exported `num()` helper, which returns `number | null`.
- **`data[0]` is the most recent gas day** in every response.
- **Rate limit is 60 requests/minute** per key. `records()` pages sequentially, but be considerate with long histories.
- A gas day starts at 05:00 UTC; daily data is published from 19:30 CE(S)T with late revisions at 23:00.

## Attribution (required)

GIE's terms make crediting mandatory: when you use or republish this data, credit **GIE (Gas Infrastructure Europe), AGSI or ALSI** as the source.

## Worked example

Voltstack's live [EU Gas Storage Tracker](https://voltstack.energy/insights/eu-gas-storage-tracker-winter-2026) is built on this data: current fill versus the year-ago base and the five-year band, by country, updated every gas day. More live European energy references at [voltstack.energy/insights](https://voltstack.energy/insights).

## License

MIT © [Voltstack](https://voltstack.energy). Not affiliated with or endorsed by GIE.
