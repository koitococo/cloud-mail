import { settingConst } from '../const/entity-const';
import BizError from '../error/biz-error';
import { t } from '../i18n/i18n';

const compiledRuleEmailRegexCache = new Map();

export function compileRuleEmailRegex(ruleEmail) {
	return new RegExp(ruleEmail);
}

export function getCompiledRuleEmailRegex(ruleEmail, compileRegex = compileRuleEmailRegex) {
	if (!ruleEmail) {
		return null;
	}

	if (compiledRuleEmailRegexCache.has(ruleEmail)) {
		return compiledRuleEmailRegexCache.get(ruleEmail);
	}

	try {
		const compiledRuleEmailRegex = compileRegex(ruleEmail);
		compiledRuleEmailRegexCache.set(ruleEmail, compiledRuleEmailRegex);
		return compiledRuleEmailRegex;
	} catch {
		compiledRuleEmailRegexCache.set(ruleEmail, null);
		return null;
	}
}

export function assertValidRuleEmail(ruleEmail) {
	if (typeof ruleEmail !== 'string') {
		throw new BizError(t('invalidRuleEmail'), 400);
	}

	if (ruleEmail === '') {
		return;
	}

	if (!getCompiledRuleEmailRegex(ruleEmail)) {
		throw new BizError(t('invalidRuleEmail'), 400);
	}
}

export function shouldForwardByRuleEmail(ruleType, ruleEmail, recipientEmail) {
	if (ruleType !== settingConst.ruleType.RULE) {
		return true;
	}

	if (ruleEmail === '') {
		return false;
	}

	const compiledRuleEmailRegex = getCompiledRuleEmailRegex(ruleEmail);

	if (!compiledRuleEmailRegex) {
		return false;
	}

	return compiledRuleEmailRegex.test(recipientEmail);
}
