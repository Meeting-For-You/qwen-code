import { describe, expect, it } from 'vitest';
import {
  artifactBaseUrl,
  artifactFileName,
  assertNoLocalOrGitDependencies,
  normalizeOptions,
  parseArgs,
  verifyRuntimeArtifact,
} from '../package-meeting-qwen-runtime-artifact.js';

const sourceSha = 'a52f330bd7c0528fd55cda9cdb70b486a80f0639';
const options = normalizeOptions({
  outDir: 'dist/meeting-qwen-runtime',
  publicBaseUrl:
    'https://meeting-qwen-artifacts-bj-1012659032087746.oss-cn-beijing.aliyuncs.com',
  sourceDir: 'source',
  sourceSha,
});

describe('Meeting Qwen runtime artifact', () => {
  it('uses a source-SHA-scoped immutable object prefix', () => {
    expect(artifactBaseUrl(options)).toBe(
      `${options.publicBaseUrl}/npm/qwen-code/${sourceSha}`,
    );
    expect(artifactFileName('0.22.2')).toBe('qwen-code-qwen-code-0.22.2.tgz');
  });

  it('rejects local and GitHub dependency sources', () => {
    for (const spec of ['file:../qwen', 'github:Meeting-For-You/qwen-code']) {
      expect(() =>
        assertNoLocalOrGitDependencies(
          { optionalDependencies: { dependency: spec } },
          'qwen.tgz',
        ),
      ).toThrow();
    }
  });

  it('accepts registry dependencies and parses source directory', () => {
    expect(() =>
      assertNoLocalOrGitDependencies(
        { optionalDependencies: { sharp: '0.35.3' } },
        'qwen.tgz',
      ),
    ).not.toThrow();
    expect(
      parseArgs([
        '--out-dir',
        'dist/out',
        '--public-base-url',
        'https://example.com',
        '--source-dir',
        'source',
        '--source-sha',
        sourceSha,
      ]),
    ).toMatchObject({ outDir: 'dist/out', sourceSha });
  });

  it('requires every executable runtime entry and validates package identity', () => {
    const archiveEntries = [
      'package/cli-entry.js',
      'package/cli.js',
      'package/fzfWorker.js',
      'package/web-shell/index.html',
    ];
    const run = (_command, args) => {
      if (args[0] === '-tzf') return `${archiveEntries.join('\n')}\n`;
      return JSON.stringify({
        name: '@qwen-code/qwen-code',
        version: '0.22.2',
      });
    };

    expect(() =>
      verifyRuntimeArtifact('qwen.tgz', '0.22.2', run),
    ).not.toThrow();
    archiveEntries.pop();
    expect(() => verifyRuntimeArtifact('qwen.tgz', '0.22.2', run)).toThrow(
      'package/web-shell/index.html',
    );
  });
});
