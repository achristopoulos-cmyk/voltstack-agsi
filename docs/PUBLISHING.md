# Publishing runbook

This package has never been published anywhere. Nothing in this document has been run. It is three separate, ordered stages: GitHub first, npm second (founder-gated), community submissions third. Do not skip ahead; several submission targets require GitHub or npm to be live first (each draft in `docs/submissions/` states its own prerequisite).

## Stage 1: GitHub publication

Prerequisite: none. This is the first step.

```sh
# from inside the voltstack-agsi repo, on feat/publication-prep or after merging it to main
gh repo create achristopoulos-cmyk/voltstack-agsi --public --source=. --remote=origin --description "Zero-dependency TypeScript client for GIE's AGSI+ and ALSI transparency APIs"

git push -u origin main

gh repo edit achristopoulos-cmyk/voltstack-agsi --add-topic energy --add-topic gas-storage --add-topic agsi --add-topic typescript --add-topic api-client

git tag v0.1.0
git push origin v0.1.0

gh release create v0.1.0 --title "v0.1.0" --notes-file CHANGELOG.md
```

After this stage: the repo is public, has topics for discovery, and a tagged v0.1.0 release. The CI badge in the README will go green on the first push once Actions runs. npm is not touched yet.

## Stage 2: npm publication

Prerequisite: Stage 1 complete (a public GitHub repo makes the `repository`/`homepage`/`bugs` links in package.json resolve, and gives reviewers on awesome-lists something to check before Stage 3).

This stage requires the founder's own npm account and a decision that hasn't been made yet:

- **Scoped as `@voltstack/agsi`** (current package.json) requires creating the `voltstack` npm organization first (`npm org create voltstack` from the founder's logged-in npm account, or via npmjs.com), then publishing into it. Scoped packages need `--access public` explicitly or they publish private by default (which fails on the free tier anyway).
- **Unscoped as `voltstack-agsi`** avoids creating an npm org at all. This means changing `name` in package.json from `@voltstack/agsi` to `voltstack-agsi` and updating the README install line and every reference to the package name (`import ... from '@voltstack/agsi'` becomes `from 'voltstack-agsi'`) before publishing. Simpler, but loses the `@voltstack/*` namespace for any future sibling packages.

Pick one before running anything below. This runbook assumes the scoped name is kept (matching the current package.json); if unscoped is chosen instead, do the rename first and rerun the pre-publish checklist against the new name.

Pre-publish checklist (all of this requires a real `GIE_API_KEY`, which was not available this session):

1. `GIE_API_KEY=<real key> npm test` and confirm the live smoke test passes (not skipped).
2. `npm run build` and `npm pack --dry-run`; diff the file list against the one recorded in this repo's publication-prep report (`dist/`, `README.md`, `LICENSE`, `package.json`, nothing else).
3. Confirm `npm whoami` is logged in as the founder's intended npm account, and that the `voltstack` org exists (scoped path) or the name rename is done (unscoped path).
4. Confirm `version` in package.json is the version being published (bump it if Stage 1's v0.1.0 tag and this publish are meant to diverge).

Publish commands:

```sh
npm login
# scoped path (voltstack org already created):
npm publish --access public

# unscoped path (after renaming to voltstack-agsi in package.json and README):
npm publish --access public
```

After this stage: `npm install @voltstack/agsi` (or `npm install voltstack-agsi`) works for anyone. This is irreversible in the sense that npm does not allow re-publishing the same version number, so get the pre-publish checklist right first.

## Stage 3: community submissions

Prerequisite: varies per target, stated in each draft in `docs/submissions/`. Some need GitHub live only; none need npm live as a hard requirement, but a live npm package strengthens every submission (it is the difference between "here is some code" and "here is something you can install").

Drafts are ready to fire in:

- `docs/submissions/opensustain-tech.md`
- `docs/submissions/awesome-energy-tools.md`
- `docs/submissions/rebase-energy-awesome-list.md`
- `docs/submissions/openmod-forum-post.md`
- `docs/submissions/show-hn.md`

Each draft states, at the top, whether GitHub and/or npm need to be live first, and an honest eligibility verdict as of 2026-07-17 based on that target's actual published criteria. Re-check eligibility at submission time if more than a few weeks pass, since these are community-maintained lists and their criteria can change.
