import { expect, test } from '@playwright/test';
import { HistoryPage } from '../pages/HistoryPage.js';
import { createLoggedInUser, generateByApi, loginByLocalStorage, saveCreationByApi } from '../utils/apiClient.js';
import { creationPayload } from '../utils/testData.js';

test.describe('历史记录管理', () => {
  test('可以搜索、查看详情、复用历史记录', async ({ page, request }) => {
    const topic = `E2E history topic ${Date.now()}`;
    const auth = await createLoggedInUser(request);
    const generated = await generateByApi(request, auth.token, creationPayload({ topic }));
    await saveCreationByApi(request, auth.token, generated);
    await loginByLocalStorage(page, auth);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.search(topic);

    await expect(page.getByText(topic)).toBeVisible();
    await historyPage.openFirstDetail();
    await expect(page.locator('.el-drawer')).toContainText(topic);

    await page.keyboard.press('Escape');
    await page.getByTestId('history-reuse').first().click();
    await expect(page).toHaveURL(/\/create/);
    await expect(page.getByTestId('create-topic')).toHaveValue(topic);
  });

  test('只能看到当前登录用户自己的历史记录', async ({ page, request }) => {
    const privateTopic = `private topic ${Date.now()}`;
    const userA = await createLoggedInUser(request);
    const userB = await createLoggedInUser(request);
    const generatedA = await generateByApi(request, userA.token, creationPayload({ topic: privateTopic }));
    await saveCreationByApi(request, userA.token, generatedA);
    await loginByLocalStorage(page, userB);

    await page.goto('/history');

    await expect(page.getByText(privateTopic)).toHaveCount(0);
  });
});
