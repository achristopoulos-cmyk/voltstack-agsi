# github.com/rebase-energy/awesome-energy-datasets

**Prerequisite:** GitHub repo live and public (Stage 1 of PUBLISHING.md). npm is not required.

## Eligibility verdict: eligible, with a framing caveat

This list (confirmed by name via search; the actual repo is `awesome-energy-datasets`, not a differently-named list) catalogs *datasets*, not client libraries. Its own contribution instructions are mechanical and unambiguous:

> "To add a new dataset, add an entry to `data.json` and run `python main.py` to regenerate the README."

Checked the current `data.json` directly: there is no existing entry for GIE, AGSI, ALSI, gas storage, or LNG data. So there's a real gap to fill, but the entry being added is properly the *GIE AGSI+/ALSI dataset itself*, not this npm package. The package belongs in the entry's `links.code` field as a suggested access method, not as the headline of the entry. Submitting `voltstack-agsi` as if it were the dataset would be a category mismatch against their own schema.

Their taxonomy also has no clean "gas storage" energy_sector value (options are solar, wind, hydro, demand, price, weather, grid, fossil, nuclear, building, battery, transport) - `fossil` is the nearest fit, imperfectly, and worth flagging in the PR rather than silently picking it.

## Submission process

1. Fork https://github.com/rebase-energy/awesome-energy-datasets
2. Add an entry to `data.json`
3. Run `python main.py` to regenerate `README.md`
4. Open a PR with both the `data.json` change and the regenerated README

## Ready-to-fire data.json entry

```json
{
  "name": "GIE AGSI+ / ALSI",
  "description": "Daily European gas storage inventory (AGSI+) and LNG terminal send-out/inventory (ALSI) data, published by Gas Infrastructure Europe. The official source behind most public 'EU gas storage is at X%' reporting, with country- and facility-level detail back to roughly 2011 (AGSI+) and 2012 (ALSI). Free API key required.",
  "data_type": ["timeseries", "tabular"],
  "energy_sector": ["fossil"],
  "format": ["api"],
  "coverage": ["continental", "country"],
  "links": {
    "url": "https://agsi.gie.eu/",
    "api": "https://agsi.gie.eu/api",
    "code": "https://github.com/achristopoulos-cmyk/voltstack-agsi",
    "docs": "https://www.gie.eu/transparency-platform/"
  }
}
```

PR description:

> Adding GIE's AGSI+ (EU gas storage) and ALSI (LNG terminal) transparency data, which doesn't currently appear in data.json. Both are free (API key required, registration at agsi.gie.eu), cover essentially all of Europe at country and facility level, and go back roughly a decade. `energy_sector` doesn't have a great fit here since there's no "gas" or "storage" value in the current taxonomy; I used `fossil` as the closest match, open to a better tag if you have one in mind. Linked a small zero-dependency TypeScript client (`code`) that handles the API's pagination and string-typed fields, for anyone who wants to consume this without writing their own wrapper; happy to drop that link if you'd rather keep entries dataset-only.
