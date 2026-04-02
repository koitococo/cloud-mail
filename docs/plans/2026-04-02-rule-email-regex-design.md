# ruleEmail 正则适配 Design

**What**: 将规则转发中的 `ruleEmail` 从“多个邮箱列表”调整为“单个正则表达式字符串”，并补齐保存边界校验。

**Why**: 后端接收逻辑已改为 `new RegExp(ruleEmail).test(message.to)`；如果前端仍按邮箱数组建模，会导致 UI 语义错误、旧保存逻辑不匹配，且非法正则可能在运行时打断收信链路。

## Components
- Worker 测试配置基线
- 前端规则转发弹窗
- 后端设置保存边界校验

## Recommended Approach
采用方案 B：
1. 先修复 `mail-worker/vitest.config.js` 中错误的 Wrangler 配置路径；
2. 前端将 `ruleEmail` 改为 `ref('')`，使用普通输入组件承载 regex 字符串；
3. 保存前增加前端基础正则校验；
4. 后端 `setting-service.set()` 对 `ruleEmail` 做最终 try/catch 校验并返回业务错误。

## Risks
- 旧库中若已有逗号邮箱串配置，切换后可能需要管理员手动改写为 regex
- 仅做前端校验不足以阻止非法数据通过其他入口写入

## Validation
- `mail-vue`: `pnpm build`
- `mail-worker`: `pnpm exec vitest --run`（先修复配置路径后重跑）
