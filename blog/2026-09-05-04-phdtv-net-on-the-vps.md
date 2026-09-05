---
type: "Devlog Entry"
title: "phdtv.net on the user's own server"
date: 2026-09-05
timestamp: 2026-09-05T20:47:54
tags: [infrastructure, architecture]
description: "GitHub stays the repository and review queue, but the site moves from GitHub Pages to the user's VPS at phdtv.net: DNS added through Squarespace, an rsync-only deploy user behind nginx and certbot, and the deploy workflow rewritten to push the build there."
---

## What changed

Hours after the [first Pages deployment](2026-09-05-03-repo-and-first-deploy.md), the user drew a line: GitHub as the repository and database, yes; GitHub as the host, no. The project should live on their own virtual server, the same one that already serves two other sites. They own `phdtv.net`, registered at Squarespace with DNS at Google Cloud DNS and, until this afternoon, no records at all.

## The design

Approved in chat after two clarifying rounds (which server, which hostname).

*Approach.* Build in GitHub Actions, rsync the static output to the server. The alternatives, having the server pull and build (it runs Node 20, too old for this project) or proxying GitHub Pages behind nginx (the site would still live on GitHub), were rejected.

*DNS.* `phdtv.net` is canonical, `www` redirects to it. Four records: A and AAAA for the apex and for `www`, pointing at the VPS's IPv4 and IPv6 addresses. Added through the Squarespace domain panel.

*Server.* A system user `phdtv` with no sudo owning `/home/phdtv/site`. Its only authorized key is the deploy key, restricted with `rrsync` to that directory. An nginx vhost serving the directory: immutable year-long caching for the hashed `assets/`, `no-cache` for pages, feeds and the export, UTF-8 charset on text types including `text/calendar`. Certbot issues and renews the certificate and installs the HTTP to HTTPS redirect.

*Workflow.* The Pages jobs go; one job validates, builds with `SITE_URL=https://phdtv.net` and `SITE_BASE=/`, and rsyncs with delayed updates and deletes so the swap is near-atomic, then curls the live feed. Same triggers (push to `main`, daily rebuild, manual); pushes touching only `blog/` or `.devlog/` no longer deploy. The private key is a repository secret; the server's host key is pinned in the repository.

*Code.* Build and dev scripts default to `https://phdtv.net` at base `/`. Tests pass their base explicitly and do not change. GitHub Pages is switched off afterwards so there is one canonical URL.

## How it went

Everything in the design landed the same afternoon, in this order, with the site never down because it had not been announced anywhere yet.

**DNS through the Squarespace panel.** Screenshots and the accessibility tree both time out on that dashboard, so the four records were added by driving the React form with short JavaScript snippets: open the row, pick the type from its listbox, set name and data through React's native value setter, save. Squarespace demanded a password re-authentication twice, which the user typed. The records were answering from the authoritative nameservers within a minute.

**Server.** A `phdtv` system user, `/home/phdtv/site`, and one authorized key whose forced command is `rrsync /home/phdtv/site`. A shell login with that key is refused with "SSH_ORIGINAL_COMMAND does not run rsync", which is the point. The nginx vhost went in over plain HTTP, certbot turned it into HTTPS with the redirect, and two follow-up edits fixed what the first probes showed: Ubuntu's nginx has no MIME mapping for `.ics`, so feeds came out as `application/octet-stream` until the vhost re-included `mime.types` and added `text/calendar ics`; and certbot's own `http://www` redirect went to `https://www` before the apex, so it now goes straight there.

**Workflow.** The Pages jobs are gone; the deploy job builds and rsyncs. The first run after the push took thirteen seconds end to end. Verification of the live site from the terminal:

```
200 text/html; charset=utf-8      /
200 text/html; charset=utf-8      /archive/
200 text/calendar; charset=utf-8  /feeds/all.ics
200 text/calendar; charset=utf-8  /feeds/law.ics
200 application/json; charset=utf-8  /api/defenses.json
200 text/html; charset=utf-8      /defenses/2026/2026-09-15-utrecht-chris-ten-dam/

301 http://phdtv.net/              -> https://phdtv.net/
301 http://www.phdtv.net/archive/  -> https://phdtv.net/archive/
Cache-Control on a hashed asset:   public, max-age=31536000, immutable
Cache-Control on a page:           no-cache
feed: 17 events, URL:https://phdtv.net/defenses/...   export: 22 defenses
certificate: CN=phdtv.net, Let's Encrypt, until 2026-12-04; IPv6 answers too
```

GitHub Pages was then switched off; `b3008.github.io/phdtv` returns 404.

## What's next

- Subscribe to `https://phdtv.net/feeds/all.ics` from a calendar app and confirm an edited event updates in place. The earlier attempt through Calendar.app's subscription sheet was never completed.
- The validate workflow has still not run on a real pull request, the path that exercises the curator-ownership rule.
- `phdtv.net` renews on 2026-11-23; the certificate renews itself.
- Then the work the site exists for: scrapers and a submission path.

## Surprises

- **Apple's rsync is not rsync.** macOS ships `openrsync`, which lacks `--chmod` and sends a server command line that `rrsync` rejects outright. The proof that the restricted key works had to come from a Linux rsync, which a throwaway Alpine container provided; the GitHub runner has the real thing anyway.
- **A stock Ubuntu nginx does not know what an `.ics` file is.** The Pages deployment had hidden this because GitHub's servers do.
- **Certbot's redirect block is per hostname**, so a `www` block that already redirected to the apex gained a second hop. One line fixes it, but it is worth probing `http://www` after every certbot run.
- **The Squarespace dashboard defeats the browser tooling's idle detection** but not plain script execution. Short synchronous snippets, one per step, were reliable; one long snippet with several awaits hit the 45-second evaluation timeout even though its clicks had gone through.
