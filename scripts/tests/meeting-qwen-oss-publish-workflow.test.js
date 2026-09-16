import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Meeting Qwen OSS publication workflow', () => {
  const workflow = readFileSync(
    '.github/workflows/publish-meeting-qwen-oss-artifacts.yml',
    'utf8',
  );

  it('is manually dispatched, OIDC-only, and browser-free', () => {
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain("id-token: 'write'");
    expect(workflow).toContain("name: 'qwen-oss-artifacts'");
    expect(workflow).toContain('aliyun/configure-aliyun-credentials-action@');
    expect(workflow).not.toMatch(/playwright|chromium/i);
  });

  it('builds the exact source revision and checks the packed OSS closure', () => {
    expect(workflow).toContain('test "$(git rev-parse HEAD)" = "$SOURCE_SHA"');
    expect(workflow).toContain('npm ci --no-audit --progress=false');
    expect(workflow).toContain('git diff --exit-code');
    expect(workflow).toContain('package:meeting-qwen-web-artifacts');
    expect(workflow).toContain('--no-overwrite');
    expect(workflow).toContain('--inherit-bucket-acl');
    expect(workflow).toContain(
      "OSS_BUCKET: 'meeting-qwen-artifacts-bj-1012659032087746'",
    );
    expect(workflow).toContain(
      'Artifact prefix is partially populated; refusing to overwrite or complete it.',
    );
    expect(workflow).toContain('npm --prefix "$consumer_dir" init --yes');
    expect(workflow).toContain('Install closure from public OSS URLs');
  });

  it('limits anonymous OSS reads to the published artifact prefix', () => {
    const policy = JSON.parse(
      readFileSync(
        'deploy/meeting-qwen-oss-artifact-public-read-policy.json',
        'utf8',
      ),
    );

    expect(policy).toEqual({
      Version: '1',
      Statement: [
        {
          Sid: 'PublicReadOnlyPublishedQwenArtifacts',
          Effect: 'Allow',
          Principal: ['*'],
          Action: ['oss:GetObject'],
          Resource: [
            'acs:oss:*:*:meeting-qwen-artifacts-bj-1012659032087746/npm/qwen-code/*',
          ],
        },
      ],
    });
  });
});
