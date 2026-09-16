#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fail, isMainModule, readOptionValue } from './release-script-utils.js';

const PACKAGE_NAME = '@qwen-code/qwen-code';
const REQUIRED_ENTRIES = [
  'package/cli-entry.js',
  'package/cli.js',
  'package/fzfWorker.js',
  'package/web-shell/index.html',
];

if (isMainModule(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) printUsage();
    else packageRuntimeArtifact(options);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function printUsage() {
  console.log(`Usage: node scripts/package-meeting-qwen-runtime-artifact.js [options]

Builds a self-contained Qwen CLI runtime package for one fixed release source commit.

Options:
  --out-dir PATH          New output directory for the tarball and manifest.json.
  --public-base-url URL   Public OSS origin without a path.
  --source-dir PATH       Checked-out Qwen CLI release source directory.
  --source-sha SHA        Full 40-character source commit SHA.
  -h, --help              Show this help message.
`);
}

function parseArgs(argv) {
  const options = {
    help: false,
    outDir: '',
    publicBaseUrl: '',
    sourceDir: process.cwd(),
    sourceSha: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--out-dir') {
      options.outDir = readOptionValue(argv, index++, arg);
    } else if (arg === '--public-base-url') {
      options.publicBaseUrl = readOptionValue(argv, index++, arg);
    } else if (arg === '--source-dir') {
      options.sourceDir = readOptionValue(argv, index++, arg);
    } else if (arg === '--source-sha') {
      options.sourceSha = readOptionValue(argv, index++, arg);
    } else {
      fail(`Unknown option: ${arg}`);
    }
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
    sourceDir: path.resolve(options.sourceDir),
    sourceSha: options.sourceSha.toLowerCase(),
  };
}

function artifactBaseUrl({ publicBaseUrl, sourceSha }) {
  return `${publicBaseUrl}/npm/qwen-code/${sourceSha}`;
}

function artifactFileName(version) {
  return `qwen-code-qwen-code-${version}.tgz`;
}

function packageRuntimeArtifact(options, { run = runCommand } = {}) {
  const normalized = normalizeOptions(options);
  assertSourceRevision(normalized.sourceDir, normalized.sourceSha, run);
  assertCleanSourceTree(normalized.sourceDir, run);
  const sourceManifest = JSON.parse(
    fs.readFileSync(path.join(normalized.sourceDir, 'package.json'), 'utf8'),
  );
  if (
    sourceManifest.name !== PACKAGE_NAME ||
    typeof sourceManifest.version !== 'string'
  ) {
    fail('source is not a valid prebuilt @qwen-code/qwen-code release package');
  }
  const outDir = path.resolve(normalized.outDir);
  if (fs.existsSync(outDir)) fail(`Output directory already exists: ${outDir}`);

  try {
    fs.mkdirSync(outDir, { recursive: true });
    run(
      'npm',
      ['pack', '--ignore-scripts', '--pack-destination', outDir],
      normalized.sourceDir,
    );
    const file = artifactFileName(sourceManifest.version);
    const archivePath = path.join(outDir, file);
    if (!fs.existsSync(archivePath)) fail(`npm pack did not create ${file}`);
    verifyRuntimeArtifact(archivePath, sourceManifest.version, run);
    const manifest = {
      artifacts: [
        {
          file,
          packageName: PACKAGE_NAME,
          sha256: sha256File(archivePath),
          url: `${artifactBaseUrl(normalized)}/${file}`,
          version: sourceManifest.version,
        },
      ],
      sourceSha: normalized.sourceSha,
    };
    fs.writeFileSync(
      path.join(outDir, 'manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    return manifest;
  } catch (error) {
    fs.rmSync(outDir, { recursive: true, force: true });
    throw error;
  }
}

function assertSourceRevision(rootDir, sourceSha, run) {
  if (
    run('git', ['rev-parse', 'HEAD'], rootDir).trim().toLowerCase() !==
    sourceSha
  ) {
    fail('--source-sha does not match the checked-out source revision');
  }
}

function assertCleanSourceTree(rootDir, run) {
  if (
    run(
      'git',
      ['status', '--porcelain', '--untracked-files=no'],
      rootDir,
    ).trim()
  ) {
    fail('source worktree must be clean before packaging artifacts');
  }
}

function verifyRuntimeArtifact(archivePath, version, run) {
  const entries = new Set(
    run('tar', ['-tzf', archivePath], process.cwd()).trim().split('\n'),
  );
  for (const entry of REQUIRED_ENTRIES) {
    if (!entries.has(entry))
      fail(`${path.basename(archivePath)} is missing ${entry}`);
  }
  const text = run(
    'tar',
    ['-xOf', archivePath, 'package/package.json'],
    process.cwd(),
  );
  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch {
    fail(
      `${path.basename(archivePath)} does not contain a valid package/package.json`,
    );
  }
  if (manifest.name !== PACKAGE_NAME || manifest.version !== version) {
    fail(
      `${path.basename(archivePath)} package identity does not match source`,
    );
  }
  assertNoLocalOrGitDependencies(manifest, path.basename(archivePath));
}

function assertNoLocalOrGitDependencies(manifest, file) {
  for (const field of [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
  ]) {
    for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
      if (typeof spec !== 'string')
        fail(`${file} has an invalid ${field} entry for ${name}`);
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
  if (result.status !== 0)
    fail(
      `${command} ${args.join(' ')} failed in ${cwd}: ${result.stderr || result.stdout}`,
    );
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
  assertNoLocalOrGitDependencies,
  normalizeOptions,
  packageRuntimeArtifact,
  parseArgs,
  verifyRuntimeArtifact,
};
