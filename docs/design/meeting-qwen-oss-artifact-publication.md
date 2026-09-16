# Meeting Qwen OSS Artifact Publication

## Goal

Publish the SDK, WebUI, and Web Shell consumed by Meeting For You as one
source-SHA-scoped OSS artifact closure. Frontend builds must not fetch a GitHub
archive or a local `file:` package.

## Publication Boundary

The manually dispatched publisher checks out one immutable source commit. The
source worktree runs its normal `npm ci`, which applies the committed Ink patch
and builds every workspace package. The build must leave the tracked source
tree clean before the publisher packs the three frontend packages.

```text
reviewed workflow + source SHA
  -> npm ci (patch + full build)
  -> SDK / WebUI / Web Shell tarballs
  -> package manifest closure check
  -> OSS npm/qwen-code/<source SHA>/
  -> clean consumer install from OSS URLs
```

WebUI's local SDK dependency is replaced inside the packed archive with the
SDK tarball URL for the same source SHA. Packed dependency metadata rejects
`file:` and GitHub dependency specifications.

## Access Boundary

The publisher uses a dedicated GitHub Environment and a dedicated Alibaba
Cloud OIDC RAM role. Its policy permits only list, read, and write operations
under `meeting-qwen-artifacts-bj-1012659032087746/npm/qwen-code/`; it cannot
delete objects, change ACLs, access runtime snapshots, or deploy ACS resources.
The dedicated Bucket remains private. Its versioned Bucket Policy grants
anonymous `GetObject` only under `npm/qwen-code/*`, so npm can consume
immutable tarballs without exposing unrelated objects. Artifact uploads
inherit the private Bucket ACL and never change an object ACL.

## Immutability

Artifact URLs include the complete source SHA. The publisher uses a
single-concurrency group and refuses a partially populated prefix or an
existing prefix whose checksums differ. After confirming an empty prefix, it
uploads without ossutil's force-overwrite flag and supplies the server-side
`x-oss-forbid-overwrite` control. The target is a dedicated non-versioned
artifact Bucket, so the service rejects any later overwrite of a published
object.

## Out of Scope

This release workflow does not invoke Playwright, a GitHub-hosted browser, or
an ECS-hosted browser. Browser E2E remains a local-development-machine-only
activity until the DNS and filing prerequisites are complete.
