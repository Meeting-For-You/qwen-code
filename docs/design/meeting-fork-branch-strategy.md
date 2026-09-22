# Meeting Fork Branch Strategy

## Problem

This repo is a GitHub fork of `QwenLM/qwen-code`. `main` looks like it should
be "our main line," but it is not where the product customizations Meeting
For You depends on live. Branching a product fix from `main` produces a
package that does not typecheck against frontend-web, because `main` does not
contain the product's own commits at all.

## What `main` actually is

`main` tracks upstream `QwenLM/qwen-code`'s own `main`. It is kept in sync
with upstream (fast-forwarded/rebased onto upstream commits) and additionally
carries a handful of fork-only infra PRs that are deliberately
upstream-agnostic — e.g. the OSS artifact publisher
([`meeting-qwen-oss-artifact-publication.md`](./meeting-qwen-oss-artifact-publication.md))
and its later fixes.

Verify at any time:

```bash
git merge-base main meeting-agent/v0.22.2   # the fork point
git log <fork-point>..main --format='%an <%ae>' | sort | uniq -c | sort -rn
```

As of 2026-09-22 the fork point is `5e9c24c` ("fix(channels): Make
same-chat delivery session-aware (#10145)", 2026-08-26 — this exact commit
also exists in `QwenLM/qwen-code`). From there, `main` picked up **497**
more commits touching **~2400 files**; only 5 of those are our own PRs
(`#2 #4 #5 #6 #7`, all OSS-publisher infra). The rest are upstream's own
three weeks of development, authored by upstream contributors
(`@alibaba-inc.com`, `qwen-code-dev-bot`, community contributors) — not
Meeting For You code.

## Where the product actually lives

`meeting-agent/v0.22.2` forked from that same commit — the very next commit
on that line is `github-actions[bot]`'s `chore(release): v0.22.2`, i.e. this
is exactly the point the fork cut its own release line. Every commit on that
line since (currently 12) is Meeting For You's own product work: `meeting_*`
MCP wiring, the `addMenu` composer toolbar, vision-bridge attachment
handling, web-shell session/UI fixes, etc. This is what frontend-web's
`@qwen-code/{sdk,web-shell,webui}` dependencies are actually built from —
see frontend-web's `package.json`, which pins an exact commit SHA (not a
branch name) on this line.

## Rule for new product work

1. Find the commit frontend-web currently pins (the SHA embedded in the OSS
   tarball URLs in frontend-web's `package.json`). Branch from that commit,
   not from `main`.
2. Publish with the `publish-meeting-qwen-oss-artifacts.yml` workflow using
   `--ref main` (the publisher tooling lives on `main` and always builds the
   latest publisher scripts) with `-f source_sha=<your commit>` pointing at
   your fix branch's tip (the workflow checks out the publisher from `main`
   and the product source separately — the two do not need to be the same
   ref). Do not dispatch with `--ref <your branch>`: an older product-line
   branch carries a stale copy of this workflow file itself and will use
   whatever bucket/inputs were current when that branch's tip predates a
   publisher change.
3. There is no requirement to ever merge a product fix branch into `main`.
   `main` merging in a product PR (see qwen-code#9) is a call for whoever
   owns branch strategy here, not something to do reflexively — it would mean
   `main` starts diverging from upstream in ways that make future upstream
   syncs harder.

## Open question (not resolved by this doc)

`main`'s name suggests it is the primary line, which it is not for this
fork's actual purpose. Whether to rename the product line to `main` and move
the upstream mirror to something like `upstream-sync`, or leave the current
naming and rely on this doc, is an intentional decision for whoever owns this
repo — this doc exists so that decision doesn't have to be rediscovered from
git archaeology every time.
