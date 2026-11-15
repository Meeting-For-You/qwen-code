#!/usr/bin/env node

/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

// Local counterpart of .github/workflows/publish-meeting-qwen-oss-artifacts.yml
// for when GitHub Actions is unavailable. It runs the same stages with the same
// guarantees (see docs/design/meeting-qwen-oss-artifact-publication.md):
//
//   checkout source SHA -> (web) npm ci + clean-tree check -> package
//     -> refuse a partially populated prefix -> upload without overwrite
//     -> clean install from the public OSS URLs
//
// Credentials: a short-lived STS session for QwenLocalArtifactPublisherRole,
// assumed through the local release operator's Aliyun CLI profile. That role
// carries the same QwenOssArtifactPublisherPolicy as the GitHub Actions role
// (list/read/write under npm/qwen-code/ only), so no account-level key is used.

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, isMainModule, readOptionValue } from './release-script-utils.js';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

export const DEFAULTS = {
  bucket: 'meeting-qwen-artifacts-bj-1012659032087746',
  endpoint: 'https://oss-cn-beijing.aliyuncs.com',
  publicBaseUrl:
    'https://meeting-qwen-artifacts-bj-1012659032087746.oss-cn-beijing.aliyuncs.com',
  profile: 'schedule-agent-local-release',
  roleArn: 'acs:ram::1012659032087746:role/qwenlocalartifactpublisherrole',
};

export const KINDS = {
  web: {
    packager: 'package-meeting-qwen-web-artifacts.js',
    assetCount: 4,
    install: true,
  },
  runtime: {
    packager: 'package-meeting-qwen-runtime-artifact.js',
    assetCount: 2,
    install: false,
  },
};

if (isMainModule(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) printUsage();
    else await publish(options);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function printUsage() {
  console.log(`Usage: node scripts/publish-meeting-qwen-artifacts-local.js --source-sha SHA [options]

Publishes an immutable, source-SHA-scoped Qwen artifact closure to OSS from this
machine. Mirrors the publish-meeting-qwen-oss-artifacts workflow.

Options:
  --source-sha SHA    Full 40-character source commit SHA (must be pushed).
  --kind KIND         web (default) or runtime.
  --profile NAME      Aliyun CLI profile allowed to assume the publisher role
                      (default ${DEFAULTS.profile}).
  --role-arn ARN      Publisher role to assume (default ${DEFAULTS.roleArn}).
  --dry-run           Build, package and check the OSS prefix, but upload nothing.
  -h, --help          Show this help message.

Requires git, node, npm, aliyun (Aliyun CLI) and ossutil 1.7.x on PATH.
`);
}

export function parseArgs(argv) {
  const options = {
    help: false,
    sourceSha: '',
    kind: 'web',
    profile: DEFAULTS.profile,
    roleArn: DEFAULTS.roleArn,
    dryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--source-sha')
      options.sourceSha = readOptionValue(argv, index++, arg);
    else if (arg === '--kind')
      options.kind = readOptionValue(argv, index++, arg);
    else if (arg === '--profile')
      options.profile = readOptionValue(argv, index++, arg);
    else if (arg === '--role-arn')
      options.roleArn = readOptionValue(argv, index++, arg);
    else fail(`Unknown option: ${arg}`);
  }
  if (options.help) return options;
  if (!/^[0-9a-f]{40}$/i.test(options.sourceSha)) {
    fail('--source-sha must be a full 40-character Git commit SHA');
  }
  if (!Object.hasOwn(KINDS, options.kind)) {
    fail(`--kind must be one of: ${Object.keys(KINDS).join(', ')}`);
  }
  return { ...options, sourceSha: options.sourceSha.toLowerCase() };
}

/**
 * Decide what to do with an OSS prefix from per-asset existence flags, exactly
 * like the workflow: all absent -> upload, all present -> verify, else refuse.
 */
export function classifyPrefix(existing) {
  const present = existing.filter(Boolean).length;
  if (present === 0) return 'empty';
  if (present === existing.length) return 'complete';
  return 'partial';
}

/** Reasons a consumer lockfile must be rejected (local path or GitHub source). */
export function findForbiddenLockEntries(lockText) {
  const reasons = [];
  if (lockText.includes('file:')) reasons.push('file: dependency');
  if (lockText.includes('github.com/Meeting-For-You/qwen-code'))
    reasons.push('github.com/Meeting-For-You/qwen-code reference');
  return reasons;
}

export function assumeRoleArgs({ profile, roleArn }) {
  return [
    '--profile',
    profile,
    'sts',
    'AssumeRole',
    '--RoleArn',
    roleArn,
    '--RoleSessionName',
    'qwen-local-publish',
    '--DurationSeconds',
    '900',
  ];
}

function run(command, args, { cwd, env, secrets = [], quiet = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: env ?? process.env,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  const mask = (text) =>
    secrets
      .filter(Boolean)
      .reduce((acc, secret) => acc.split(secret).join('<masked>'), text ?? '');
  if (!quiet) {
    process.stdout.write(mask(result.stdout));
    process.stderr.write(mask(result.stderr));
  }
  if (result.error) throw result.error;
  if (result.status !== 0) {
    // Quiet calls still surface the (masked) cause; a bare exit code is useless.
    if (quiet) process.stderr.write(mask(result.stderr));
    fail(`${command} ${args[0] ?? ''} failed (exit ${result.status})`);
  }
  return result.stdout;
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: { 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) fail(`HTTP ${response.status} while fetching ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function verifyPublishedPrefix(baseUrl, outDir) {
  const localManifest = fs.readFileSync(path.join(outDir, 'manifest.json'));
  const remoteManifest = await fetchBuffer(`${baseUrl}/manifest.json`);
  if (!localManifest.equals(remoteManifest)) {
    fail('Published manifest differs from the locally built one; refusing.');
  }
  for (const artifact of JSON.parse(remoteManifest.toString('utf8'))
    .artifacts) {
    if (sha256(await fetchBuffer(artifact.url)) !== artifact.sha256) {
      fail(`Checksum mismatch for published ${artifact.file}`);
    }
  }
}

/** ossutil 1.7 config file contents for a short-lived STS session. */
export function renderOssutilConfig({
  accessKeyId,
  accessKeySecret,
  securityToken,
}) {
  return [
    '[Credentials]',
    'language=EN',
    `endpoint=${DEFAULTS.endpoint}`,
    `accessKeyID=${accessKeyId}`,
    `accessKeySecret=${accessKeySecret}`,
    `stsToken=${securityToken}`,
    '',
  ].join('\n');
}

/** Short-lived credentials for the publisher role, written to a 0600 ossutil config. */
function createOssutilConfig(options, workDir) {
  const output = run('aliyun', assumeRoleArgs(options), { quiet: true });
  const { Credentials: c } = JSON.parse(output);
  const config = path.join(workDir, 'ossutilconfig');
  fs.writeFileSync(
    config,
    renderOssutilConfig({
      accessKeyId: c.AccessKeyId,
      accessKeySecret: c.AccessKeySecret,
      securityToken: c.SecurityToken,
    }),
    { mode: 0o600 },
  );
  return { config, secrets: [c.AccessKeySecret, c.SecurityToken] };
}

/**
 * Existence check through the public URL (the bucket policy grants anonymous
 * GetObject under npm/qwen-code/*). A HEAD signed with the publisher role is
 * denied for this bucket and `ossutil stat` hangs on the denial, so the public
 * URL is the only usable probe. It is cache-busted and time-limited, and any
 * answer other than 200/404 aborts. Overwrite protection does not depend on
 * it: the upload sends `x-oss-forbid-overwrite`, and the whole prefix is
 * verified again after the upload.
 */
async function objectExists(url) {
  const response = await fetch(`${url}?nocache=${Date.now()}`, {
    method: 'HEAD',
    headers: { 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 200) return true;
  if (response.status === 404) return false;
  fail(`Unexpected HTTP ${response.status} while checking ${url}`);
}

function uploadAssets({ credentials, prefix, assets }) {
  run(
    process.execPath,
    [
      path.join(REPO_ROOT, 'scripts/upload-aliyun-oss-assets.js'),
      '--bucket',
      DEFAULTS.bucket,
      '--config',
      credentials.config,
      '--inherit-bucket-acl',
      '--no-overwrite',
      '--prefix',
      prefix,
      ...assets,
    ],
    { cwd: REPO_ROOT, secrets: credentials.secrets },
  );
}

function installFromPublicUrls(workDir, manifestPath) {
  const consumer = path.join(workDir, 'consumer');
  fs.rmSync(consumer, { recursive: true, force: true });
  fs.mkdirSync(consumer);
  run('npm', ['init', '--yes'], { cwd: consumer, quiet: true });
  const urls = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).artifacts.map(
    (artifact) => artifact.url,
  );
  run('npm', ['install', '--no-audit', '--no-fund', ...urls], {
    cwd: consumer,
  });
  const reasons = findForbiddenLockEntries(
    fs.readFileSync(path.join(consumer, 'package-lock.json'), 'utf8'),
  );
  if (reasons.length) fail(`Consumer lockfile rejected: ${reasons.join(', ')}`);
}

function git(args, cwd = REPO_ROOT) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' });
}

/** The commit must be pushed: a mistyped or private-only SHA would be published forever. */
function assertSourcePushed(sourceSha) {
  // A clone may track only some branches; refresh all of origin's heads so
  // "contained in a remote branch" is judged against what is really pushed.
  run(
    'git',
    ['fetch', '--quiet', 'origin', '+refs/heads/*:refs/remotes/origin/*'],
    { cwd: REPO_ROOT },
  );
  if (git(['cat-file', '-e', `${sourceSha}^{commit}`]).status !== 0) {
    fail(`${sourceSha} is not a commit known to origin.`);
  }
  const remotes = git(['branch', '-r', '--contains', sourceSha]).stdout.trim();
  if (!remotes) {
    fail(
      `${sourceSha} is not on any origin branch; push it before publishing (published prefixes are immutable).`,
    );
  }
}

/**
 * Uploads must come from reviewed publisher code, like the workflow that always
 * ran the publisher scripts from `main`.
 */
function assertReviewedPublisher() {
  run('git', ['fetch', '--quiet', 'origin', 'main'], { cwd: REPO_ROOT });
  if (git(['status', '--porcelain', '--untracked-files=no']).stdout.trim()) {
    fail('The publisher checkout has uncommitted changes; refusing to upload.');
  }
  if (
    git(['merge-base', '--is-ancestor', 'HEAD', 'origin/main']).status !== 0
  ) {
    fail(
      'The publisher checkout is not contained in origin/main; run it from a merged main checkout.',
    );
  }
}

export async function publish(options) {
  const kindConfig = KINDS[options.kind];
  const { sourceSha } = options;
  const prefix = `npm/qwen-code/${sourceSha}`;
  const baseUrl = `${DEFAULTS.publicBaseUrl}/${prefix}`;

  assertSourcePushed(sourceSha);
  if (!options.dryRun) assertReviewedPublisher();

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qwen-local-publish-'));
  const sourceDir = path.join(workDir, 'source');
  const outDir = path.join(workDir, 'out');
  try {
    console.log(`==> checkout ${sourceSha} (${options.kind})`);
    run('git', ['worktree', 'add', '--detach', sourceDir, sourceSha], {
      cwd: REPO_ROOT,
    });

    if (kindConfig.install) {
      console.log(
        '==> npm ci (applies patches, builds every workspace package)',
      );
      // The source tree's install scripts run as this user. Give them an empty
      // HOME so they do not see ~/.aliyun, keeping the real npm cache.
      const home = path.join(workDir, 'home');
      fs.mkdirSync(home);
      const npmCache = run('npm', ['config', 'get', 'cache'], {
        quiet: true,
      }).trim();
      run(
        'npm',
        ['--prefix', sourceDir, 'ci', '--no-audit', '--progress=false'],
        { env: { ...process.env, HOME: home, npm_config_cache: npmCache } },
      );
      if (
        run(
          'git',
          ['-C', sourceDir, 'status', '--porcelain', '--untracked-files=no'],
          { quiet: true },
        ).trim()
      ) {
        fail(
          'The build changed tracked files; commit a refreshed bundle first.',
        );
      }
    }

    console.log('==> package');
    run(process.execPath, [
      path.join(REPO_ROOT, 'scripts', kindConfig.packager),
      '--out-dir',
      outDir,
      '--public-base-url',
      DEFAULTS.publicBaseUrl,
      '--source-dir',
      sourceDir,
      '--source-sha',
      sourceSha,
    ]);

    const assets = fs
      .readdirSync(outDir)
      .filter((file) => file.endsWith('.tgz') || file === 'manifest.json')
      .sort()
      .map((file) => path.join(outDir, file));
    if (assets.length !== kindConfig.assetCount) {
      fail(`Expected ${kindConfig.assetCount} assets, found ${assets.length}`);
    }

    console.log('==> check OSS prefix');
    const state = classifyPrefix(
      await Promise.all(
        assets.map((asset) =>
          objectExists(`${baseUrl}/${path.basename(asset)}`),
        ),
      ),
    );
    if (state === 'partial') {
      fail(
        'Artifact prefix is partially populated; refusing to overwrite or complete it.',
      );
    }
    const manifestPath = path.join(outDir, 'manifest.json');
    if (state === 'complete') {
      console.log('==> prefix already published; verifying it is identical');
      await verifyPublishedPrefix(baseUrl, outDir);
      if (kindConfig.install) installFromPublicUrls(workDir, manifestPath);
      console.log(
        `OK: ${baseUrl}/manifest.json is already published and identical.`,
      );
      return;
    }
    if (options.dryRun) {
      console.log(
        `DRY RUN: would upload ${assets.length} assets to ${baseUrl}/`,
      );
      return;
    }

    console.log('==> upload (no overwrite)');
    // Assumed right before use so the 900 s session is not spent on the build.
    uploadAssets({
      credentials: createOssutilConfig(options, workDir),
      prefix,
      assets,
    });

    // Catches a concurrent publisher having won some objects of this prefix.
    console.log('==> verify the published prefix');
    await verifyPublishedPrefix(baseUrl, outDir);
    if (kindConfig.install) {
      console.log('==> clean install from public OSS URLs');
      installFromPublicUrls(workDir, manifestPath);
    }
    console.log(`OK: published ${baseUrl}/manifest.json`);
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', sourceDir], {
      cwd: REPO_ROOT,
    });
    spawnSync('git', ['worktree', 'prune'], { cwd: REPO_ROOT });
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}
