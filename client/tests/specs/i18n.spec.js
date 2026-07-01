import { expect, test } from '@playwright/test';
import { createLoggedInUser, loginByLocalStorage } from '../utils/apiClient.js';

test.describe('多语言切换', () => {
  test('支持简体中文、繁体中文、英语、德语切换', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    await loginByLocalStorage(page, auth);

    await page.goto('/dashboard');

    const languages = [
      { label: 'English', expected: 'Dashboard' },
      { label: 'Deutsch', expected: 'Übersicht' },
      { label: '繁體中文', expected: '工作台' },
      { label: '简体中文', expected: '工作台' }
    ];

    for (const item of languages) {
      await page.getByTestId('language-switcher').click();
      await page.locator('.el-select-dropdown__item', { hasText: item.label }).last().click();
      await expect(page.locator('.layout-topbar h1')).toContainText(item.expected);
    }
  });
});
