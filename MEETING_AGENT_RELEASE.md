# 这是什么

这个分支不是源码，是 `meeting-agent/v0.22.2` 分支跑完 `npm run bundle && node scripts/prepare-package.js` 之后
`dist/` 目录的产物快照——内容和真实发到 npm 上的 `@qwen-code/qwen-code` 包结构完全一样（`cli.js`、`cli-entry.js`、
`chunks/`、`vendor/`、`web-shell/` 等在仓库根目录，不嵌套在 `dist/` 下）。

## 为什么要单独开一个分支

`schedule-agent` 把 `@qwen-code/qwen-code` 依赖指向了 git ref，而不是 npm registry。npm 装 git 依赖时只会
执行这个仓库根 `package.json` 的 `dependencies`（不会装 `devDependencies`），但源码分支自己的 `postinstall`/
`prepare` 要跑 `patch-package`/`husky`/`cross-env`/`tsx`/`vitest`/`vite` 等一整套构建工具——这些全都在
`devDependencies` 里，直接把源码分支当 git 依赖装会在 `postinstall` 那一步就失败（`patch-package: command not
found`）。

这个分支跳过了这个问题：它已经是构建产物，`package.json` 里 `dependencies` 是空的、没有 `postinstall`/
`prepare` 脚本，npm 装的时候不需要跑任何构建，行为和从 npm registry 装一样快、一样可靠。

## 怎么更新这个分支

每次 `meeting-agent/v0.22.2`（或以后新版本对应的源码分支）有新提交，重新生成这个分支：

```bash
# 在源码分支的 checkout 里
npm run bundle && node scripts/prepare-package.js

# 在这个产物分支的 checkout/worktree 里，清空后拷贝新的 dist/ 内容进来，提交
```

理想情况下这一步应该交给 CI（源码分支合并时自动跑，推到这个分支），不要长期靠手工执行。
