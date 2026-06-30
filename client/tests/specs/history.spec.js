import { expect, test } from '@playwright/test';
import { HistoryPage } from '../pages/HistoryPage.js';
import { createLoggedInUser, generateByApi, loginByLocalStorage, saveCreationByApi } from '../utils/apiClient.js';
import { creationPayload } from '../utils/testData.js';

test.describe('历史记录管理', () => {
  test('可以搜索、查看详情、复用历史记录', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    const generated = await generateByApi(request, auth.token, creationPayload({ topic: 'AI 工具如何提升运营效率' }));
    await saveCreationByApi(request, auth.token, generated);
    await loginByLocalStorage(page, auth);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.search('AI 工具');

    await expect(page.getByText('AI 工具如何提升运营效率')).toBeVisible();
    await historyPage.openFirstDetail();
    await expect(page.locator('.el-drawer')).toContainText(/标题推荐|口播文案|分镜脚本/);

    await page.keyboard.press('Escape');
    await page.getByTestId('history-reuse').first().click();
    await expect(page).toHaveURL(/\/create/);
    await expect(page.getByTestId('create-topic').locator('input')).toHaveValue('AI 工具如何提升运营效率');
  });

  test('只能看到当前登录用户自己的历史记录', async ({ page, request }) => {
    const userA = await createLoggedInUser(request);
    const userB = await createLoggedInUser(request);
    const generatedA = await generateByApi(request, userA.token, creationPayload({ topic: '用户 A 的私有选题' }));
    await saveCreationByApi(request, userA.token, generatedA);
    await loginByLocalStorage(page, userB);

    await page.goto('/history');

    await expect(page.getByText('用户 A 的私有选题')).toHaveCount(0);
  });
});
