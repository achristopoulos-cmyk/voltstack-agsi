# opensustain.tech

**Prerequisite:** GitHub repo live and public (Stage 1 of PUBLISHING.md). npm is not required by their process.

## Eligibility verdict: not yet eligible for a full listing, but submittable as "Under Observation"

Their contribution guide (https://opensustain.tech/how-to-contribute/) states two criteria this package fails today:

> "The projects must be actively used or in active development at the time of listing."

> "You need to show that others beyond the project's main developers are using the project. Good indicators include issues or pull requests from external users."

A day-old repo with a single author and zero external issues or PRs fails the external-usage bar outright. The same page has an explicit fallback for this:

> Projects not yet meeting community or usage criteria can still be submitted; reviewers will label them "Under Observation" for later evaluation.

So the honest options are: (a) submit now and accept the "Under Observation" label, or (b) wait until there is at least one external issue, PR, or a dependent project, then submit as a normal listing. Given the goal here is a backlink and credibility signal, submitting now for "Under Observation" is still worth doing, since the listing (and its link) exists either way; it just won't be the top-tier "actively used" tier until real external usage shows up.

## What unlocks full eligibility later

- At least one issue or PR from someone who is not the repo owner.
- Evidence of the package being depended on (an npm download count, a project that lists it as a dependency, or a citation).
- Re-submit or ask for re-review once either of the above exists.

## Submission process (from their contributing guide)

1. Fork https://github.com/protontypes/open-sustainable-technology
2. Add an entry to the data source (their listing is maintained in a Grist spreadsheet, https://docs.getgrist.com/doc/gSscJkc5Rb1Rw45gh1o1Yc, referenced from the GitHub repo's CONTRIBUTING.md)
3. Open a pull request, or contact the maintainers directly with the entry ("Create a pull request to add a new project or send an email to give feedback, tips and ideas")

## Ready-to-fire entry text

Project name: `voltstack-agsi`

Description (one line, matching their list's style):

> Zero-dependency TypeScript client for GIE's AGSI+ and ALSI transparency APIs, the official source for European gas storage and LNG terminal data.

Category fit: closest existing category is open climate/energy data tooling. If their taxonomy asks for a specific sustainability angle, use: "gives any project programmatic access to the same European gas storage data that underlies public reporting on energy security and winter supply risk, without every consumer re-implementing pagination and the API's string-typed fields."

Repo link: https://github.com/achristopoulos-cmyk/voltstack-agsi

Note for the PR/email itself: mention plainly that this is a new (2026-07) project and that it is fine to list it as "Under Observation" pending external usage, rather than overstating traction it doesn't have yet.
