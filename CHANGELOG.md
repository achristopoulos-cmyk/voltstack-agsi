# Changelog

All notable changes to this project are documented in this file.

## 0.1.0

Initial release.

- `GieClient`: zero-dependency TypeScript client for GIE's AGSI+ (EU gas storage) and ALSI (LNG terminal) transparency APIs.
- `storage()`, `records()` (auto-paginating), `euAggregate()`, `country()`.
- `num()` helper to parse GIE's string values, treating `"-"` as unavailable.
- `alsiFullness()` helper to derive ALSI tank fullness from `inventory.gwh` / `dtmi.gwh`, guarding against rows that publish a literal `"0"` instead of `"-"` for missing data.
- `GieApiError` for non-2xx responses.
- Documented API behavior notes: settlement lag, rate limit, pagination quirks, and dataset-specific gaps (AGSI+ UK post-Brexit cutoff, ALSI zero-row quirk).
