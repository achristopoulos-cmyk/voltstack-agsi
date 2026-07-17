# github.com/BiaPri/awesome-energy-tools

**Prerequisite:** GitHub repo live and public (Stage 1 of PUBLISHING.md). npm is not required to submit, though it makes the "Install" line in the PR entry actually usable, so ideally do this after Stage 2 too.

## Eligibility verdict: eligible now, no gate to clear

This repository has no CONTRIBUTING.md and no contribution guidelines section anywhere in its README. The README's own structure (Research Gaps, Todo, Important to Mention, Missing Data, Contents, Datasets, Tools-Models, Visualization, Forecasting, Papers) makes clear it is a manually curated, informally maintained list with no stated review bar, maturity requirement, or star/activity threshold. There is nothing to be ineligible against; the only real gate is whether the maintainer merges the PR, which cannot be verified in advance.

The closest fit in their existing taxonomy is the "Tools-Models" section, which already has a "Storage" subsection (for storage modeling tools, not raw data access, but it is the nearest match to a gas-storage-data client). Their format legend already recognizes APIs as a format type in the sibling list, so a client-library entry is not a structural mismatch.

## Submission process

Standard unmoderated awesome-list convention, inferred from the repo's structure (no explicit instructions given): fork, add one line under the best-fit category, open a PR.

## Ready-to-fire PR

Target section: `Tools-Models > Storage` (add a new line; if the maintainer prefers a new "API Clients" subsection instead, that's a reasonable alternative given the entry is a client library rather than a storage model).

Entry line (matching the list's link-plus-description style):

```markdown
- [voltstack-agsi](https://github.com/achristopoulos-cmyk/voltstack-agsi) - Zero-dependency TypeScript client for GIE's AGSI+ (EU gas storage) and ALSI (LNG terminal) transparency APIs. Typed records, auto-pagination, Node 18+.
```

PR description:

> Adding a client library for GIE's AGSI+ and ALSI transparency APIs (European gas storage and LNG terminal data, the source behind most "EU storage is at X%" reporting). It's a thin, zero-dependency wrapper: typed records, string-vs-number handling for the API's quirks, and auto-pagination for history queries. Placed it under Tools-Models > Storage since that was the closest existing category; happy to move it if there's a better fit or if you'd rather keep that section to storage-modeling tools specifically.
