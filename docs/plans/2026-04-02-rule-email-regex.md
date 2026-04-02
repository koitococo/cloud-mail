# ruleEmail 正则适配 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复 worker 测试基线，并将规则转发的 `ruleEmail` 设置改造成单个正则字符串输入，同时在保存边界校验非法正则。

**Architecture:** 先修正测试工具链配置，确保 worker 侧验证命令可运行；随后分别修改前端 UI/状态模型与后端保存校验，保持 `ruleEmail` 在系统中的真实类型为字符串，并把 regex 校验放在前后端两个边界。

**Tech Stack:** Vue 3、Element Plus、Pinia、Cloudflare Workers、Vitest、Wrangler

---

### Task 1: 修复 worker 测试配置基线

**Files:**
- Modify: `mail-worker/vitest.config.js`
- Reference: `mail-worker/wrangler.toml`, `mail-worker/wrangler-test.toml`

**Step 1: 运行失败命令确认现状**

Run: `pnpm exec vitest --run`
Expected: FAIL，报错读取不存在的 `./wrangler.jsonc`

**Step 2: 写最小修复**

将 `configPath` 从 `./wrangler.jsonc` 改为仓库内真实存在的 Wrangler 配置文件。

**Step 3: 重新运行验证**

Run: `pnpm exec vitest --run`
Expected: 不再因缺失 `wrangler.jsonc` 失败；若出现新错误，继续按系统化排障处理。

**Step 4: Commit**

```bash
git add mail-worker/vitest.config.js
git commit -m "test(worker): fix wrangler config path"
```

### Task 2: 前端改造规则输入组件

**Files:**
- Modify: `mail-vue/src/views/sys-setting/index.vue`
- Modify: `mail-vue/src/i18n/zh.js`
- Modify: `mail-vue/src/i18n/en.js`

**Step 1: 保留失败/空缺行为认知**

确认当前实现仍以数组和逗号串建模：`ref([])`、`split(',')`、`+ ''`。

**Step 2: 写最小实现**

- 将 `ruleEmail` 改为 `ref('')`
- 将 `el-input-tag` 替换为普通 `el-input`（必要时 `type="textarea"`）
- 删除 `ruleEmailAddTag`
- `openForwardRules()` 直接回显字符串
- `ruleEmailSave()` 提交 trim 后字符串
- 更新中英文 placeholder / 提示文案为“请输入正则表达式”语义

**Step 3: 增加前端保存前校验**

在 `ruleEmailSave()` 内对 `ruleType === 1` 且非空时执行 `new RegExp(ruleEmail.value)` 的 try/catch；失败时通过现有消息机制提示并阻止提交。

**Step 4: 运行前端验证**

Run: `pnpm build`
Expected: PASS

**Step 5: Commit**

```bash
git add mail-vue/src/views/sys-setting/index.vue mail-vue/src/i18n/zh.js mail-vue/src/i18n/en.js
git commit -m "fix(vue): use regex input for forwarding rules"
```

### Task 3: 后端保存边界校验

**Files:**
- Modify: `mail-worker/src/service/setting-service.js`

**Step 1: 写最小实现**

在 `set(c, params)` 中，当 `params.ruleEmail` 存在且规则模式为 `RULE` 时，执行 try/catch 校验；非法时抛出业务错误，阻止持久化。

**Step 2: 运行 worker 验证**

Run: `pnpm exec vitest --run`
Expected: PASS 或至少进入真实测试执行阶段，不再因错误配置路径失败。

**Step 3: 再运行前端构建**

Run: `pnpm build`
Expected: PASS

**Step 4: Commit**

```bash
git add mail-worker/src/service/setting-service.js
git commit -m "fix(worker): validate forwarding rule regex"
```
