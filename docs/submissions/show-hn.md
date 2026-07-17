# Show HN (news.ycombinator.com)

**Prerequisite:** GitHub repo live is the minimum. npm publication (Stage 2) is strongly recommended before posting, not just optional: HN's own guidance says to "make it easy for users to try your thing out, ideally without barriers such as signups." A `git clone` + `npm run build` is a real barrier compared to `npm install @voltstack/agsi`; the GIE API key requirement is an unavoidable barrier (it's the upstream vendor's, not ours) but the package itself should be a one-line install by the time this posts.

## Eligibility verdict: eligible, ordinary Show HN post

HN's Show HN guidelines (news.ycombinator.com/showhn.html) require "something you've made that other people can play with," excluding "blog posts, sign-up pages, newsletters, lists, and other reading material... because they can't be tried out." A working npm package with a quickstart people can run is squarely inside that definition, not on the excluded list. The guidelines also explicitly warn against asking for upvotes and favor plain, unpolished framing over slick pitches ("A Show HN needn't be complicated or look slick"), which the draft below follows: it states what the thing is, why it exists, and what it cost to build, without adjectives doing the selling.

## Ready-to-fire post

**Title:** Show HN: A zero-dependency TypeScript client for the EU's gas storage API

**Text:**

> I built this because every project that touches European gas storage data (AGSI+) or LNG terminal data (ALSI) ends up writing the same wrapper around GIE's transparency API: handle pagination, parse their string-typed fields, treat "-" as missing. I'd done it twice across two of my own projects, so I pulled it out into a standalone package.
>
> It's one class, no runtime dependencies, works with Node's built-in fetch. `records()` is an async generator that pages through a whole history for you; `num()` handles the string-vs-null parsing.
>
> The API itself has a few undocumented behaviors worth knowing if you're building on it directly: values come back as strings even when they're numbers, a bad API key returns HTTP 200 with no data instead of a 401, and the ALSI (LNG) side has no computed "fullness" field the way the gas storage side does, so you derive it yourself from two nested fields, which turns out to matter because a few historical rows publish a literal "0" for both instead of the usual "-" for missing data. Documented all of that in the README so it doesn't need re-discovering.
>
> You need a free API key from GIE to actually call the API (registration link is in the README); the package itself just handles the plumbing.
>
> https://github.com/achristopoulos-cmyk/voltstack-agsi
