# openmod forum, "Open data" category

**Prerequisite:** GitHub repo live and public (Stage 1 of PUBLISHING.md). Mention npm install if Stage 2 is also done by the time this posts; otherwise point to the GitHub repo for `npm install` from source or a git dependency.

## Eligibility verdict: eligible, ordinary community post

The forum (forum.openmod.org) has an "Open data" category described as being for "discussing open data issues as data publishing (where and how), data acquisition (from where and how), data processing, and data management." A new open-data client library announcement fits that description directly. There's no membership gate, review process, or minimum-maturity bar found for posting in this category; it's a discussion forum, not a curated list. The main norm to respect is the community's general tone: informational, not marketing-voice, and specific about what the tool actually does.

## Ready-to-fire post

**Category:** Open data

**Title:** A small TypeScript client for GIE's AGSI+/ALSI gas storage and LNG data

**Body:**

> I put together a zero-dependency TypeScript client for GIE's AGSI+ (EU gas storage) and ALSI (LNG terminal) transparency APIs, since I couldn't find one and ended up writing the same pagination/error-handling wrapper twice across two projects.
>
> What it does: typed records for both datasets, an async generator that pages through full history automatically, and a `num()` helper for the API's quirk of returning every value as a string with `"-"` for unavailable data. No runtime dependencies, works with any Node 18+ fetch.
>
> A couple of things I found useful to document while building it, in case they save someone else the trouble of re-discovering them: the settlement lag is about 2 days (the most recent gas day is rarely "today"), a missing or wrong API key returns 200 with no data rather than a 401, and ALSI has no vendor-computed fullness percentage the way AGSI+ does, so you have to derive it from `inventory.gwh` / `dtmi.gwh` yourself (a few historical GB rows publish literal `"0"` for both fields rather than `"-"`, which reads as a fake 0% if you don't guard for it).
>
> Repo: https://github.com/achristopoulos-cmyk/voltstack-agsi
>
> Happy to hear if anyone's hit different quirks with this API, or has an existing wrapper I should have found first.
