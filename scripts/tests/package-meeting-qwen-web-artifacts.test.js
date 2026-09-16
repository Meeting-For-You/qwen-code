import { describe, expect, it } from 'vitest';
import {
  artifactBaseUrl,
  artifactFileName,
  assertCleanSourceTree,
  assertNoLocalOrGitDependencies,
  assertSourceRevision,
  buildArtifactPlan,
  normalizeOptions,
  parseArgs,
  rewritePackageManifest,
} from '../package-meeting-qwen-web-artifacts.js';

const sourceSha = '6e025d3b5fac2b0db6f1da2174f5609f500f6e11';
const options = normalizeOptions({
  outDir: 'dist/meeting-qwen',
  publicBaseUrl:
    'https://schedule-agent-staging-bj.oss-cn-beijing.aliyuncs.com',
  sourceSha,
});

describe('Meeting Qwen OSS package artifacts', () => {
  it('uses a source-SHA-scoped immutable object prefix', () => {
    expect(artifactBaseUrl(options)).toBe(
      `https://schedule-agent-staging-bj.oss-cn-beijing.aliyuncs.com/npm/qwen-code/${sourceSha}`,
    );
    expect(artifactFileName('@qwen-code/web-shell', '0.22.2')).toBe(
      'qwen-code-web-shell-0.22.2.tgz',
    );
  });

  it('builds the SDK, WebUI, and Web Shell closure from one source revision', () => {
    const plan = buildArtifactPlan(
      options,
      new Map([
        ['sdk', { name: '@qwen-code/sdk', version: '0.1.8' }],
        ['webui', { name: '@qwen-code/webui', version: '0.22.2' }],
        ['web-shell', { name: '@qwen-code/web-shell', version: '0.22.2' }],
      ]),
    );

    expect(plan.artifacts.map((artifact) => artifact.file)).toEqual([
      'qwen-code-sdk-0.1.8.tgz',
      'qwen-code-webui-0.22.2.tgz',
      'qwen-code-web-shell-0.22.2.tgz',
    ]);
  });

  it('rewrites the WebUI local SDK dependency to the versioned OSS artifact', () => {
    const rewritten = rewritePackageManifest(
      {
        name: '@qwen-code/webui',
        dependencies: { '@qwen-code/sdk': 'file:../sdk-typescript' },
      },
      {
        id: 'webui',
        sdkPackageUrl: `${artifactBaseUrl(options)}/qwen-code-sdk-0.1.8.tgz`,
      },
    );

    expect(rewritten.dependencies['@qwen-code/sdk']).toBe(
      `${artifactBaseUrl(options)}/qwen-code-sdk-0.1.8.tgz`,
    );
  });

  it.each([
    ['local path', 'file:../sdk-typescript'],
    ['GitHub shorthand', 'github:Meeting-For-You/qwen-code'],
    [
      'GitHub URL',
      'https://github.com/Meeting-For-You/qwen-code/archive/main.tar.gz',
    ],
  ])('rejects a %s dependency in a packed manifest', (_, spec) => {
    expect(() =>
      assertNoLocalOrGitDependencies(
        {
          dependencies: { '@qwen-code/sdk': spec },
        },
        'qwen-code-webui-0.22.2.tgz',
      ),
    ).toThrow();
  });

  it('allows registry and immutable OSS dependencies in a packed manifest', () => {
    expect(() =>
      assertNoLocalOrGitDependencies(
        {
          dependencies: { 'markdown-it': '^14.1.0' },
          peerDependencies: { '@qwen-code/sdk': '>=0.1.8' },
          optionalDependencies: {
            '@qwen-code/sdk': `${artifactBaseUrl(options)}/qwen-code-sdk-0.1.8.tgz`,
          },
        },
        'qwen-code-webui-0.22.2.tgz',
      ),
    ).not.toThrow();
  });

  it('requires the requested source SHA to be checked out', () => {
    expect(() =>
      assertSourceRevision('.', sourceSha, () => `${sourceSha}\n`),
    ).not.toThrow();
    expect(() =>
      assertSourceRevision('.', sourceSha, () => 'f'.repeat(40)),
    ).toThrow();
  });

  it('requires the source tree to be clean after the build', () => {
    expect(() => assertCleanSourceTree('.', () => '')).not.toThrow();
    expect(() =>
      assertCleanSourceTree('.', () => ' M packages/web-shell/dist/index.js\n'),
    ).toThrow();
  });

  it.each([
    ['short SHA', { ...options, sourceSha: '6e025d3' }],
    ['non-HTTPS URL', { ...options, publicBaseUrl: 'http://example.com' }],
    ['URL path', { ...options, publicBaseUrl: 'https://example.com/prefix' }],
  ])('rejects %s', (_, invalid) => {
    expect(() => normalizeOptions(invalid)).toThrow();
  });

  it('parses the required CLI inputs', () => {
    expect(
      parseArgs([
        '--out-dir',
        'dist/out',
        '--public-base-url',
        'https://example.com',
        '--source-sha',
        sourceSha,
      ]),
    ).toMatchObject({ outDir: 'dist/out', sourceSha });
  });
});
