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
    expect(workflow).toContain(
      'Artifact prefix is partially populated; refusing to overwrite or complete it.',
    );
    expect(workflow).toContain('--no-overwrite');
    expect(workflow).toContain('Install closure from public OSS URLs');
  });

  it('requires an explicit repository variable before any cloud browser job runs', () => {
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
    const e2e = readFileSync('.github/workflows/e2e.yml', 'utf8');

    expect(ci).toContain("vars.QWEN_ENABLE_CLOUD_BROWSER_E2E == 'true'");
    expect(e2e).toMatch(
      /web-shell-browser-regression:[\s\S]*?vars\.QWEN_ENABLE_CLOUD_BROWSER_E2E == 'true'/,
    );
  });
});
