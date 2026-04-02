import { describe, expect, it, vi } from 'vitest';
import { settingConst } from '../src/const/entity-const';
import BizError from '../src/error/biz-error';
import { t } from '../src/i18n/i18n';
import { assertValidRuleEmail, getCompiledRuleEmailRegex, shouldForwardByRuleEmail } from '../src/email/rule-email';

describe('rule email helpers', () => {
	it('throws BizError for invalid regex at save boundary', () => {
		expect(() => assertValidRuleEmail('[')).toThrowError(BizError);
		expect(() => assertValidRuleEmail('[')).toThrowError(t('invalidRuleEmail'));
	});

	it('allows empty ruleEmail when ruleType is RULE', () => {
		expect(() => assertValidRuleEmail('')).not.toThrow();
	});

	it('treats empty ruleEmail as do not forward for RULE type', () => {
		expect(shouldForwardByRuleEmail(settingConst.ruleType.RULE, '', 'user@example.com')).toBe(false);
	});

	it('matches recipient with valid regex for RULE type', () => {
		expect(shouldForwardByRuleEmail(settingConst.ruleType.RULE, '^user@example\\.com$', 'user@example.com')).toBe(true);
	});

	it('does not forward when valid regex does not match recipient', () => {
		expect(shouldForwardByRuleEmail(settingConst.ruleType.RULE, '^user@example\\.com$', 'other@example.com')).toBe(false);
	});

	it('falls back to no forward when persisted regex is invalid', () => {
		expect(shouldForwardByRuleEmail(settingConst.ruleType.RULE, '[', 'user@example.com')).toBe(false);
	});

	it('reuses compiled regex for the same ruleEmail', () => {
		const first = getCompiledRuleEmailRegex('^user@example\\.com$');
		const second = getCompiledRuleEmailRegex('^user@example\\.com$');

		expect(first).toBe(second);
	});

	it('caches invalid regex results to avoid recompiling dirty data', () => {
		const compileRuleEmailRegex = vi.fn(() => {
			throw new SyntaxError('Invalid regular expression');
		});

		expect(getCompiledRuleEmailRegex('[cache-test', compileRuleEmailRegex)).toBeNull();
		expect(getCompiledRuleEmailRegex('[cache-test', compileRuleEmailRegex)).toBeNull();

		expect(compileRuleEmailRegex).toHaveBeenCalledTimes(1);
	});
});
