# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A promotional single-page website for **캐치킬러 (Catch Killer)**, a participatory mystery stage play by **세종극회** (Sejong Drama Club, 제 90회 정기공연). Visitors read a synopsis, browse cast/suspect card carousels, and vote on who they think the murderer is. The whole app is a Spring Boot server whose only real job is serving static assets and a tiny voting API — there is no build step, bundler, or frontend framework.

## Commands

All commands run from `backend/`.

```
./mvnw.cmd spring-boot:run     # run the dev server (Windows)
./mvnw spring-boot:run         # run the dev server (bash)
./mvnw.cmd test                # run tests
./mvnw.cmd clean package       # build a jar
```

The server listens on `http://localhost:8080`. Static files are served directly from `src/main/resources/static/` with no compilation step — editing HTML/CSS/JS and refreshing the browser is enough (`spring.web.resources.cache.cachecontrol.no-cache=true` is set in `application.properties` specifically so browsers, including mobile, never serve a stale cached copy during dev).

H2 console is available at `/h2-console` (JDBC URL `jdbc:h2:file:./data/catchkiller`, user `sa`, no password) for inspecting vote data directly.

There is no separate frontend package.json/npm toolchain — do not introduce one. If a background `spring-boot:run` process appears to have died (e.g. after a session interruption), find it via `Get-NetTCPConnection -LocalPort 8080 -State Listen` in PowerShell, kill it, and restart.

## Architecture

**Backend is minimal on purpose.** Its only job is: serve `static/`, and expose a two-endpoint REST API for the suspect vote tally, backed by an H2 file DB.

- `com.sejong.catchkiller.vote` — the entire backend logic lives here:
  - `SuspectVote` (JPA entity: `suspectId`, `voteCount`) / `SuspectVoteRepository`
  - `VoteDataSeeder` — seeds the three suspect rows (`CommandLineRunner`) so the table always has exactly the known suspect IDs
  - `VoteController` — `GET /api/votes` returns the current tally; `POST /api/votes` takes `{suspectId, previousSuspectId}`, decrements the previous vote (vote-changing, not vote-stacking) and increments the new one, returns the updated tally
  - `VoteRequest` / `VoteTallyResponse` — request/response records

**Frontend is plain HTML/CSS/JS**, all in `backend/src/main/resources/static/`:
- `index.html` — the whole page, top to bottom: fixed rain/vignette overlays → splash screen (logo, hamburger dropdown nav, "NEW DRAMA" title, poster row linking to linktr.ee) → hero section → `#synopsis` → CAST carousel (등장인물, no photos) → SUSPECTS carousel (용의자, real cast photos) → real-time vote stats block → `#vote` section (voting UI) → `#info` → troupe section. No footer.
- `범인찾기.html` / `hunt.css` — a secondary, simplified "find the culprit" page.
- `style.css` — one stylesheet for everything. Uses CSS custom properties on `:root` for the noir/gold theme (`--bg`, `--accent`, `--ink`, etc.), several `@font-face` declarations for Korean display fonts (loaded from external CDNs), and `clamp()` throughout for fluid type sizing instead of media-query breakpoints. Mobile overrides live in a single `@media` block near the bottom rather than being scattered inline.
- `script.js` — two independent pieces of client logic:
  1. `setupCardCarousel(root, autoMs)` — a hand-rolled coverflow-style carousel (grid-stack layering with `data-offset` driving CSS transforms, click-to-flip on the center card, prev/next arrows, swipe via Pointer Events, auto-rotate on a timer). Applied to every `.suspect-carousel` root on the page (both CAST and SUSPECTS sections reuse the same CSS/JS, only the DOM content differs).
  2. Vote UI logic — fetches `/api/votes` on load, renders per-suspect bars/percentages, POSTs on vote/re-vote, persists the user's own choice in `localStorage` (`catchkiller_myvote`) so their client remembers who they voted for even though the tally itself is server-side and shared across visitors.
- `cast/`, `posters/`, `fonts/` — image and font assets referenced by the CSS/HTML above.

## Conventions and gotchas specific to this codebase

- **iOS Safari fixed-position bug**: any element using `transform-style: preserve-3d` (used for the card flip effect) can break `position: fixed` elsewhere on the page. The fixed splash topbar works around this with `transform: translateZ(0); will-change: transform;` to force its own compositing layer — don't remove this without re-testing on an actual iPhone.
- **`left`/`top` on `position: relative` is an offset from the element's own static position**, not the containing block — it is not a substitute for `position: absolute` centering. This has bitten centering attempts in the carousel before.
- **`.suspects` has a hand-tuned `transform: translateX(-28px)`** to visually center the carousel between its arrow buttons after CSS-only centering attempts failed empirically. This value was deliberately hand-set — don't "fix" or recompute it without the user's explicit go-ahead.
- Carousels distinguish drag-swipe from tap-click via Pointer Events (`pointerdown`/`pointerup`/`pointercancel` + `setPointerCapture`) and `touch-action: pan-y` so mobile vertical scroll still works.
- No ImageMagick/ffmpeg in this environment — cast photos were resized/rotated/compressed using PowerShell + .NET `System.Drawing` (`Add-Type -AssemblyName System.Drawing`), not a CLI image tool.
- The verification loop this project has used throughout: after any static asset edit, confirm the change is actually being served with `curl -s http://localhost:8080/<file> | grep -c "<marker>"` before telling the user it's done, since the dev server can silently die between turns.
