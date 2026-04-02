# 项目状态

## 结构
- `mail-vue/`: Vue 3 + Element Plus 前端
- `mail-worker/`: Cloudflare Worker 后端与测试

## 当前约定
- 规则转发中的 `ruleEmail` 已从“逗号分隔邮箱列表”切换为“单个正则表达式字符串”
- `ruleType = RULE` 且 `ruleEmail = ''` 时，语义为“不转发”
- worker 保存边界会校验非法 `ruleEmail`，运行期也会对历史脏数据安全兜底

## 验证命令
- 前端构建：`cd mail-vue && pnpm build`
- worker 测试：`cd mail-worker && pnpm exec vitest --run`
