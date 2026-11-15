# Meeting Qwen OSS Artifact Publication

## Goal

Publish the Qwen dependencies consumed by Meeting For You as immutable,
source-SHA-scoped OSS artifact closures. Frontend builds and daemon image
builds must not fetch a GitHub archive or a local `file:` package.

## Publication Boundary

The manually dispatched publisher checks out two isolated directories: the
reviewed publisher code from the workflow revision and the requested immutable
Qwen source. Only scripts in the reviewed publisher directory receive the
Alibaba Cloud OIDC credentials or upload capability.

`web` sources run their normal `npm ci`, which applies the committed Ink patch
and builds every workspace package. The build must leave the tracked source
tree clean before the publisher packs the three frontend packages. `runtime`
sources are already-built CLI release commits, so they are never installed or
executed: the publisher validates and packages their committed files directly.

```text
reviewed publisher + source SHA
  -> web: npm ci (patch + full build) / runtime: no source execution
  -> SDK / WebUI / Web Shell tarballs or one CLI runtime tarball
  -> package manifest closure check
  -> OSS npm/qwen-code/<source SHA>/
  -> clean consumer install from OSS URLs
```

WebUI's local SDK dependency is replaced inside the packed archive with the
SDK tarball URL for the same source SHA. The runtime closure verifies its
command entry points, worker and Web Shell asset. Packed dependency metadata
rejects `file:` and GitHub dependency specifications.

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

## Local Publication

When GitHub Actions is unavailable for this repository, the same publication can
run from a maintainer machine:

```bash
node scripts/publish-meeting-qwen-artifacts-local.js --source-sha <40-char SHA> [--kind web|runtime] [--dry-run]
```

It performs the workflow's stages with the same guarantees: checkout of the
exact source SHA in a temporary worktree, `npm ci` plus the clean-tree check for
`web`, packaging with the same packagers, refusal of a partially populated
prefix, an upload through `upload-aliyun-oss-assets.js --no-overwrite`, and a
clean install from the public URLs. A prefix that is already fully published is
only verified (manifest and checksums), never rewritten, so the command is safe
to repeat.

Credentials are never an account key. The operator's Aliyun CLI profile
(`schedule-agent-local-release`) assumes `QwenLocalArtifactPublisherRole` for a
900 second STS session. That role carries `QwenOssArtifactPublisherPolicy`, the
same list/read/write-under-`npm/qwen-code/` policy as the GitHub Actions role,
and only `ScheduleAgentLocalReleaseOperator` may assume it (allow-listed in
`ScheduleAgentLocalReleaseAssumerPolicy`). The machine needs `aliyun` and
`ossutil` 1.7.x on `PATH`.

## Out of Scope

This release workflow does not invoke Playwright, a GitHub-hosted browser, or
an ECS-hosted browser. Browser E2E remains a local-development-machine-only
activity until the DNS and filing prerequisites are complete.
