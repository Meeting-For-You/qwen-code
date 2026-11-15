/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  DEFAULTS,
  KINDS,
  assumeRoleArgs,
  classifyPrefix,
  findForbiddenLockEntries,
  parseArgs,
  renderOssutilConfig,
} from '../publish-meeting-qwen-artifacts-local.js';

const SHA = 'a'.repeat(40);

describe('parseArgs', () => {
  it('defaults to a web publish with the local release operator profile', () => {
    expect(parseArgs(['--source-sha', SHA.toUpperCase()])).toMatchObject({
      sourceSha: SHA,
      kind: 'web',
      profile: DEFAULTS.profile,
      roleArn: DEFAULTS.roleArn,
      dryRun: false,
    });
  });

  it('accepts runtime kind, dry run and overrides', () => {
    expect(
      parseArgs([
        '--source-sha',
        SHA,
        '--kind',
        'runtime',
        '--dry-run',
        '--profile',
        'p',
        '--role-arn',
        'r',
      ]),
    ).toMatchObject({
      kind: 'runtime',
      dryRun: true,
      profile: 'p',
      roleArn: 'r',
    });
  });

  it('rejects a missing or short SHA, unknown kind and unknown options', () => {
    expect(() => parseArgs([])).toThrow(/40-character/);
    expect(() => parseArgs(['--source-sha', 'abc123'])).toThrow(/40-character/);
    expect(() => parseArgs(['--source-sha', SHA, '--kind', 'x'])).toThrow(
      /kind/,
    );
    expect(() => parseArgs(['--source-sha', SHA, '--force'])).toThrow(
      /Unknown/,
    );
  });

  it('returns early for --help without requiring a SHA', () => {
    expect(parseArgs(['--help']).help).toBe(true);
  });
});

describe('classifyPrefix', () => {
  it('uploads into an empty prefix, verifies a complete one, refuses a partial one', () => {
    expect(classifyPrefix([false, false, false, false])).toBe('empty');
    expect(classifyPrefix([true, true, true, true])).toBe('complete');
    expect(classifyPrefix([true, false, false, false])).toBe('partial');
    expect(classifyPrefix([true, true, true, false])).toBe('partial');
  });
});

describe('findForbiddenLockEntries', () => {
  it('flags local-path and GitHub-sourced dependencies', () => {
    expect(findForbiddenLockEntries('"resolved": "https://oss/x.tgz"')).toEqual(
      [],
    );
    expect(findForbiddenLockEntries('"version": "file:../core"')).toHaveLength(
      1,
    );
    expect(
      findForbiddenLockEntries(
        '"resolved": "git+https://github.com/Meeting-For-You/qwen-code.git"',
      ),
    ).toHaveLength(1);
  });
});

describe('assumeRoleArgs', () => {
  it('assumes only the given role with a short session', () => {
    const args = assumeRoleArgs({ profile: 'p', roleArn: 'acs:ram::1:role/r' });

    expect(args).toEqual(
      expect.arrayContaining([
        '--profile',
        'p',
        'AssumeRole',
        '--RoleArn',
        'acs:ram::1:role/r',
      ]),
    );
    expect(args[args.indexOf('--DurationSeconds') + 1]).toBe('900');
  });
});

describe('renderOssutilConfig', () => {
  it('writes the STS session into an ossutil [Credentials] section', () => {
    const text = renderOssutilConfig({
      accessKeyId: 'STS.id',
      accessKeySecret: 'secret',
      securityToken: 'token',
    });

    expect(text).toBe(
      [
        '[Credentials]',
        'language=EN',
        `endpoint=${DEFAULTS.endpoint}`,
        'accessKeyID=STS.id',
        'accessKeySecret=secret',
        'stsToken=token',
        '',
      ].join('\n'),
    );
  });
});

describe('defaults', () => {
  it('target the dedicated artifact bucket and the least-privilege local role', () => {
    expect(DEFAULTS.bucket).toBe('meeting-qwen-artifacts-bj-1012659032087746');
    expect(DEFAULTS.roleArn).toBe(
      'acs:ram::1012659032087746:role/qwenlocalartifactpublisherrole',
    );
    expect(DEFAULTS.publicBaseUrl).toContain(DEFAULTS.bucket);
  });
});

describe('parity with the GitHub Actions publisher', () => {
  const workflow = fs.readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../.github/workflows/publish-meeting-qwen-oss-artifacts.yml',
    ),
    'utf8',
  );

  it('uses the same bucket, endpoint and public URL', () => {
    expect(workflow).toContain(`OSS_BUCKET: '${DEFAULTS.bucket}'`);
    expect(workflow).toContain(`OSS_ENDPOINT: '${DEFAULTS.endpoint}'`);
    expect(workflow).toContain(
      `OSS_PUBLIC_BASE_URL: '${DEFAULTS.publicBaseUrl}'`,
    );
  });

  it('packs with the same packagers and expects the same asset counts', () => {
    for (const config of Object.values(KINDS)) {
      expect(workflow).toContain(`scripts/${config.packager}`);
    }
    expect(workflow).toContain(
      `if [ "$ARTIFACT_KIND" = 'web' ]; then expected_assets=${KINDS.web.assetCount}; else expected_assets=${KINDS.runtime.assetCount}; fi`,
    );
  });

  it('uploads without overwrite and inheriting the bucket ACL, like the workflow', () => {
    expect(workflow).toContain('--inherit-bucket-acl --no-overwrite');
  });
});
