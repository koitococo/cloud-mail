import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BizError from '../src/error/biz-error';
import { t } from '../src/i18n/i18n';

const updateGetMock = vi.fn(async () => ({}));
const assertValidRuleEmailMock = vi.fn();

vi.mock('../src/entity/orm', () => ({
	default: vi.fn(() => ({
		update: vi.fn(() => ({
			set: vi.fn(() => ({
				returning: vi.fn(() => ({
					get: updateGetMock,
				})),
			})),
		})),
	})),
}));

vi.mock('../src/email/rule-email', () => ({
	assertValidRuleEmail: assertValidRuleEmailMock,
}));

const { settingConst } = await import('../src/const/entity-const');
const { default: settingService } = await import('../src/service/setting-service');

describe('settingService.set ruleEmail validation', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	beforeEach(() => {
		updateGetMock.mockClear();
		assertValidRuleEmailMock.mockClear();
		vi.spyOn(settingService, 'query').mockResolvedValue({
			resendTokens: {},
			ruleType: settingConst.ruleType.ALL,
		});
		vi.spyOn(settingService, 'refresh').mockResolvedValue();
	});

	it('skips ruleEmail validation when effective ruleType is not RULE', async () => {
		await settingService.set({}, {
			ruleType: settingConst.ruleType.ALL,
			ruleEmail: '[',
			resendTokens: {},
		});

		expect(assertValidRuleEmailMock).not.toHaveBeenCalled();
	});

	it('validates ruleEmail when current ruleType is RULE and params omit ruleType', async () => {
		settingService.query.mockResolvedValueOnce({
			resendTokens: {},
			ruleType: settingConst.ruleType.RULE,
		});

		await settingService.set({}, {
			ruleEmail: '^user@example\\.com$',
			resendTokens: {},
		});

		expect(assertValidRuleEmailMock).toHaveBeenCalledWith('^user@example\\.com$');
	});

	it('rejects explicit non-string ruleEmail and skips update', async () => {
		await expect(settingService.set({}, {
			ruleEmail: ['^user@example\\.com$'],
			resendTokens: {},
		})).rejects.toEqual(new BizError(t('invalidRuleEmail'), 400));

		expect(updateGetMock).not.toHaveBeenCalled();
		expect(assertValidRuleEmailMock).not.toHaveBeenCalled();
	});

	it('validates persisted ruleEmail when switching effective ruleType to RULE', async () => {
		settingService.query.mockResolvedValueOnce({
			resendTokens: {},
			ruleType: settingConst.ruleType.ALL,
			ruleEmail: '[',
		});

		await settingService.set({}, {
			ruleType: settingConst.ruleType.RULE,
			resendTokens: {},
		});

		expect(assertValidRuleEmailMock).toHaveBeenCalledWith('[');
	});
});
