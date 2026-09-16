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

  it('uses reviewed publisher scripts to package the exact requested source revision', () => {
    expect(workflow).toContain("path: 'publisher'");
    expect(workflow).toContain("ref: 'main'");
    expect(workflow).toContain("path: 'source'");
    expect(workflow).toContain(
      'test "$(git -C source rev-parse HEAD)" = "$SOURCE_SHA"',
    );
    expect(workflow).toContain("ARTIFACT_KIND: '${{ inputs.artifact_kind }}'");
    expect(workflow).toContain(
      'npm --prefix publisher ci --ignore-scripts --no-audit --progress=false',
    );
    expect(workflow).toContain(
      'npm --prefix source ci --no-audit --progress=false',
    );
    expect(workflow).toContain(
      'node publisher/scripts/package-meeting-qwen-web-artifacts.js',
    );
    expect(workflow).toContain(
      'node publisher/scripts/package-meeting-qwen-runtime-artifact.js',
    );
    expect(workflow).toContain('--source-dir source');
    expect(workflow).toContain(
      "artifact_dir='publisher/dist/meeting-qwen-oss-artifacts'",
    );
    expect(workflow).toContain('expected_assets=4');
    expect(workflow).toContain('expected_assets=2');
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
    expect(workflow).not.toContain(
      'node source/scripts/upload-aliyun-oss-assets.js',
    );
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
