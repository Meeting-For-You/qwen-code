#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fail, isMainModule, readOptionValue } from './release-script-utils.js';

const packageSpecs = [
  { id: 'sdk', directory: 'packages/sdk-typescript', name: '@qwen-code/sdk' },
  { id: 'webui', directory: 'packages/webui', name: '@qwen-code/webui' },
  {
    id: 'web-shell',
    directory: 'packages/web-shell',
    name: '@qwen-code/web-shell',
  },
];

if (isMainModule(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function main(argv) {
  const options = parseArgs(argv);
  if (options.help) {
    printUsage();
    return;
  }
  packageArtifacts(options);
}

function printUsage() {
  console.log(`Usage: node scripts/package-meeting-qwen-web-artifacts.js [options]

Builds a self-contained SDK, WebUI, and Web Shell package set for a fixed Qwen source commit.

Options:
  --out-dir PATH          New output directory for tarballs and manifest.json.
  --public-base-url URL   Public OSS origin without a path.
  --source-sha SHA        Full 40-character source commit SHA.
  -h, --help              Show this help message.
`);
}

function parseArgs(argv) {
  const options = { help: false, outDir: '', publicBaseUrl: '', sourceSha: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--help' || value === '-h') {
      options.help = true;
      continue;
    }
    if (value === '--out-dir') {
      options.outDir = readOptionValue(argv, index, value);
      index += 1;
      continue;
    }
    if (value === '--public-base-url') {
      options.publicBaseUrl = readOptionValue(argv, index, value);
      index += 1;
      continue;
    }
    if (value === '--source-sha') {
      options.sourceSha = readOptionValue(argv, index, value);
      index += 1;
      continue;
    }
    fail(`Unknown option: ${value}`);
  }
  if (options.help) return options;
  if (!options.outDir) fail('--out-dir requires a value');
  if (!options.publicBaseUrl) fail('--public-base-url requires a value');
  if (!options.sourceSha) fail('--source-sha requires a value');
  return normalizeOptions(options);
}

function normalizeOptions(options) {
  if (!/^[0-9a-f]{40}$/i.test(options.sourceSha)) {
    fail('--source-sha must be a full 40-character Git commit SHA');
  }
  let url;
  try {
    url = new URL(options.publicBaseUrl);
  } catch {
    fail('--public-base-url must be an HTTPS origin');
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    fail(
      '--public-base-url must be an HTTPS origin without path, credentials, port, query, or fragment',
    );
  }
  return {
    ...options,
    publicBaseUrl: url.origin,
    sourceSha: options.sourceSha.toLowerCase(),
  };
}

function artifactBaseUrl({ publicBaseUrl, sourceSha }) {
  return `${publicBaseUrl}/npm/qwen-code/${sourceSha}`;
}

function artifactFileName(packageName, version) {
  return `${packageName.replace('@', '').replace('/', '-')}-${version}.tgz`;
}

function buildArtifactPlan(options, manifests) {
  const baseUrl = artifactBaseUrl(options);
  const artifacts = packageSpecs.map((spec) => {
    const manifest = manifests.get(spec.id);
    if (
      !manifest ||
      manifest.name !== spec.name ||
      typeof manifest.version !== 'string'
    ) {
      fail(`Missing valid package manifest for ${spec.name}`);
    }
    const file = artifactFileName(manifest.name, manifest.version);
    return {
      ...spec,
      file,
      packageUrl: `${baseUrl}/${file}`,
      version: manifest.version,
    };
  });
  return { baseUrl, artifacts };
}

function rewritePackageManifest(manifest, artifact) {
  const rewritten = structuredClone(manifest);
  if (artifact.id === 'webui') {
    rewritten.dependencies = {
      ...rewritten.dependencies,
      '@qwen-code/sdk': artifact.sdkPackageUrl,
    };
  }
  return rewritten;
}

function packageArtifacts(
  options,
  { rootDir = process.cwd(), run = runCommand } = {},
) {
  const normalized = normalizeOptions(options);
  assertSourceRevision(rootDir, normalized.sourceSha, run);
  assertCleanSourceTree(rootDir, run);
  const outDir = path.resolve(rootDir, normalized.outDir);
  if (fs.existsSync(outDir)) fail(`Output directory already exists: ${outDir}`);

  const manifests = new Map();
  for (const spec of packageSpecs) {
    const packageDir = path.join(rootDir, spec.directory);
    const manifestPath = path.join(packageDir, 'package.json');
    if (!fs.existsSync(path.join(packageDir, 'dist')))
      fail(`Missing built dist directory: ${spec.directory}`);
    manifests.set(spec.id, JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
  }
  const plan = buildArtifactPlan(normalized, manifests);
  const byId = new Map(
    plan.artifacts.map((artifact) => [artifact.id, artifact]),
  );
  const stagingDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'meeting-qwen-pack-'),
  );

  try {
    fs.mkdirSync(outDir, { recursive: true });
    for (const artifact of plan.artifacts) {
      const stageDir = path.join(stagingDir, artifact.id);
      fs.cpSync(path.join(rootDir, artifact.directory), stageDir, {
        recursive: true,
      });
      const stagedManifestPath = path.join(stageDir, 'package.json');
      const stagedManifest = JSON.parse(
        fs.readFileSync(stagedManifestPath, 'utf8'),
      );
      fs.writeFileSync(
        stagedManifestPath,
        `${JSON.stringify(
          rewritePackageManifest(stagedManifest, {
            ...artifact,
            sdkPackageUrl: byId.get('sdk').packageUrl,
          }),
          null,
          2,
        )}\n`,
      );
      run(
        'npm',
        ['pack', '--ignore-scripts', '--pack-destination', outDir],
        stageDir,
      );
      const archivePath = path.join(outDir, artifact.file);
      if (!fs.existsSync(archivePath)) {
        fail(`npm pack did not create ${artifact.file}`);
      }
      verifyPackedManifest(
        archivePath,
        artifact,
        byId.get('sdk').packageUrl,
        run,
      );
    }
    const artifacts = plan.artifacts.map((artifact) => ({
      file: artifact.file,
      packageName: artifact.name,
      sha256: sha256File(path.join(outDir, artifact.file)),
      url: artifact.packageUrl,
      version: artifact.version,
    }));
    const manifest = { artifacts, sourceSha: normalized.sourceSha };
    fs.writeFileSync(
      path.join(outDir, 'manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    return manifest;
  } catch (error) {
    fs.rmSync(outDir, { recursive: true, force: true });
    throw error;
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
}

function assertSourceRevision(rootDir, sourceSha, run) {
  const revision = run('git', ['rev-parse', 'HEAD'], rootDir)
    .trim()
    .toLowerCase();
  if (revision !== sourceSha) {
    fail(`--source-sha does not match the checked-out source revision`);
  }
}

function assertCleanSourceTree(rootDir, run) {
  const changes = run(
    'git',
    ['status', '--porcelain', '--untracked-files=no'],
    rootDir,
  ).trim();
  if (changes) {
    fail(
      'source worktree must be clean after the build before packaging artifacts',
    );
  }
}

function verifyPackedManifest(archivePath, artifact, sdkPackageUrl, run) {
  const manifestText = run(
    'tar',
    ['-xOf', archivePath, 'package/package.json'],
    process.cwd(),
  );
  let manifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch {
    fail(`${artifact.file} does not contain a valid package/package.json`);
  }
  if (
    manifest.name !== artifact.name ||
    manifest.version !== artifact.version
  ) {
    fail(`${artifact.file} package identity does not match its artifact plan`);
  }
  assertNoLocalOrGitDependencies(manifest, artifact.file);
  if (
    artifact.id === 'webui' &&
    manifest.dependencies?.['@qwen-code/sdk'] !== sdkPackageUrl
  ) {
    fail(
      `${artifact.file} must depend on the SDK artifact from the same source revision`,
    );
  }
}

function assertNoLocalOrGitDependencies(manifest, file) {
  for (const field of [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
  ]) {
    for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
      if (typeof spec !== 'string') {
        fail(`${file} has an invalid ${field} entry for ${name}`);
      }
      if (/^(?:file:|git(?:\+|:)|github:)|github\.com/i.test(spec)) {
        fail(
          `${file} ${field}.${name} must not reference a local path or GitHub`,
        );
      }
    }
  }
}

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    fail(
      `${command} ${args.join(' ')} failed in ${cwd}: ${result.stderr || result.stdout}`,
    );
  }
  return result.stdout;
}

function sha256File(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

export {
  artifactBaseUrl,
  artifactFileName,
  assertCleanSourceTree,
  assertNoLocalOrGitDependencies,
  assertSourceRevision,
  buildArtifactPlan,
  normalizeOptions,
  packageArtifacts,
  parseArgs,
  rewritePackageManifest,
  verifyPackedManifest,
};
