/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Packages @qwen-code/sdk, @qwen-code/webui and @qwen-code/web-shell as
 * standalone npm-installable git dependencies, mirroring the pattern
 * MEETING_AGENT_RELEASE.md already documents for the CLI: build each
 * package's dist/, write a trimmed package.json (no devDependencies/build
 * scripts, no file: workspace links), and stage it under
 * <rootDir>/.release-staging/<package>/ ready to be committed onto a
 * dedicated orphan branch.
 *
 * This does NOT run each package's own build step — run
 * `npm run build` inside packages/sdk-typescript, packages/webui and
 * packages/web-shell first (in that order; webui depends on sdk's dist
 * only for typechecking its own source, and web-shell's app/lib builds
 * don't need webui's dist path resolved beyond what workspace linking
 * already provides during the source build). This script only re-shapes
 * already-built dist/ output for publishing.
 *
 * Usage: node scripts/prepare-web-shell-release.js <sdkTarballUrl> <webuiTarballUrl>
 * The two tarball URLs are only needed to rewrite webui's/web-shell's
 * `file:../sdk-typescript` (and web-shell's `file:../webui`) dependency —
 * pass them once the sdk/webui release branches have been pushed and you
 * know the commit-pinned tarball URL. Omit both to only prepare sdk
 * (which has no workspace-local dependencies to rewrite).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const stagingRoot = path.join(rootDir, '.release-staging');

const [sdkTarballUrl, webuiTarballUrl] = process.argv.slice(2);

const packages = [
  {
    dir: 'sdk-typescript',
    rewriteDeps: {},
  },
  {
    dir: 'webui',
    rewriteDeps: sdkTarballUrl ? { '@qwen-code/sdk': sdkTarballUrl } : {},
  },
  {
    dir: 'web-shell',
    rewriteDeps: {
      ...(sdkTarballUrl ? { '@qwen-code/sdk': sdkTarballUrl } : {}),
      ...(webuiTarballUrl ? { '@qwen-code/webui': webuiTarballUrl } : {}),
    },
  },
];

for (const { dir, rewriteDeps } of packages) {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(rootDir, 'packages', dir, 'package.json'),
      'utf-8',
    ),
  );
  const unresolvedFileDeps = Object.entries(manifest.dependencies ?? {})
    .filter(([, value]) => value.startsWith('file:'))
    .map(([name]) => name)
    .filter((name) => !rewriteDeps[name]);
  if (unresolvedFileDeps.length > 0) {
    console.log(
      `Skipping ${dir}: waiting on tarball URL for ${unresolvedFileDeps.join(', ')} ` +
        `(pass it once that package's release branch is pushed)`,
    );
    continue;
  }
  preparePackage(dir, rewriteDeps);
}

function preparePackage(dir, rewriteDeps) {
  const packageDir = path.join(rootDir, 'packages', dir);
  const distDir = path.join(packageDir, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error(
      `${dir}: no dist/ found — run \`npm run build\` in packages/${dir} first`,
    );
  }
  const manifest = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
  );
  const dependencies = rewriteDependencies(manifest.dependencies, rewriteDeps, dir);

  const publishManifest = {
    name: manifest.name,
    version: manifest.version,
    type: manifest.type,
    main: manifest.main,
    module: manifest.module,
    types: manifest.types,
    exports: manifest.exports,
    files: manifest.files,
    ...(manifest.peerDependencies
      ? { peerDependencies: manifest.peerDependencies }
      : {}),
    ...(dependencies ? { dependencies } : {}),
  };

  const stageDir = path.join(stagingRoot, dir);
  fs.rmSync(stageDir, { recursive: true, force: true });
  fs.mkdirSync(stageDir, { recursive: true });
  copyOnlyDeclaredFiles(distDir, path.join(stageDir, 'dist'), manifest.files);
  for (const entry of manifest.files ?? []) {
    if (entry.startsWith('dist')) continue;
    const source = path.join(packageDir, entry);
    if (fs.existsSync(source)) {
      fs.cpSync(source, path.join(stageDir, entry), { recursive: true });
    }
  }
  fs.writeFileSync(
    path.join(stageDir, 'package.json'),
    JSON.stringify(publishManifest, null, 2) + '\n',
  );
  const licensePath = path.join(rootDir, 'LICENSE');
  if (fs.existsSync(licensePath)) {
    fs.copyFileSync(licensePath, path.join(stageDir, 'LICENSE'));
  }
  console.log(`Staged ${manifest.name}@${manifest.version} -> ${stageDir}`);
}

function rewriteDependencies(dependencies, rewriteDeps, dir) {
  if (!dependencies) return undefined;
  const result = {};
  for (const [name, value] of Object.entries(dependencies)) {
    if (value.startsWith('file:')) {
      const replacement = rewriteDeps[name];
      if (!replacement) {
        throw new Error(
          `${dir}: dependency "${name}" is a workspace file: link (${value}) ` +
            `but no replacement tarball URL was provided`,
        );
      }
      result[name] = replacement;
    } else {
      result[name] = value;
    }
  }
  return result;
}

function copyOnlyDeclaredFiles(distDir, destDistDir, files) {
  // package.json "files" entries are either the bare "dist" directory (copy
  // everything) or "dist/<subpath>" entries (copy just that subpath) —
  // handle both, relative to distDir itself.
  for (const entry of files ?? []) {
    if (entry === 'dist') {
      fs.mkdirSync(destDistDir, { recursive: true });
      fs.cpSync(distDir, destDistDir, { recursive: true });
      continue;
    }
    if (!entry.startsWith('dist/')) continue;
    const relative = entry.slice('dist/'.length);
    const source = path.join(distDir, relative);
    const destination = path.join(destDistDir, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
  }
}
