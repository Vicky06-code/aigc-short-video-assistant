import { expect, test } from '@playwright/test';
import { HistoryPage } from '../pages/HistoryPage.js';
import { createLoggedInUser, getHistoryByApi, loginByLocalStorage, seedCreation } from '../utils/apiClient.js';
import { creationPayload } from '../utils/testData.js';

test.describe('历史记录扩展操作', () => {
  test('可以删除单条历史记录', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    const topic = `delete topic ${Date.now()}`;
    await seedCreation(request, auth.token, creationPayload({ topic }));
    await loginByLocalStorage(page, auth);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.search(topic);
    await expect(page.getByText(topic)).toBeVisible();

    await historyPage.deleteFirstRecord();

    await expect(page.getByText(topic)).toHaveCount(0);
  });

  test('可以批量删除历史记录', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    const prefix = `batch topic ${Date.now()}`;
    await seedCreation(request, auth.token, creationPayload({ topic: `${prefix} A` }));
    await seedCreation(request, auth.token, creationPayload({ topic: `${prefix} B` }));
    await loginByLocalStorage(page, auth);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.search(prefix);
    await expect(page.getByText(`${prefix} A`)).toBeVisible();
    await expect(page.getByText(`${prefix} B`)).toBeVisible();

    await historyPage.selectFirstRows(2);
    await page.getByTestId('history-batch-delete').click();
    await historyPage.confirmDialog();

    const records = await getHistoryByApi(request, auth.token);
    expect(records.filter((item) => item.topic.includes(prefix))).toHaveLength(0);
  });

  test('可以清空当前用户全部历史记录', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    await seedCreation(request, auth.token, creationPayload({ topic: `clear topic ${Date.now()}` }));
    await loginByLocalStorage(page, auth);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await page.getByTestId('history-clear-all').click();
    await historyPage.confirmDialog();

    const records = await getHistoryByApi(request, auth.token);
    expect(records).toHaveLength(0);
  });

  test('详情页支持导出 Word，并展示 PDF 导出入口', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    const topic = `export topic ${Date.now()}`;
    await seedCreation(request, auth.token, creationPayload({ topic }));
    await loginByLocalStorage(page, auth);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.search(topic);
    await historyPage.openFirstDetail();

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('history-export-word').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.doc');
    await expect(page.getByTestId('history-export-pdf')).toBeVisible();
  });

  test('历史记录筛选、排序和分页控件可用', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    const prefix = `filter topic ${Date.now()}`;
    for (let index = 0; index < 12; index += 1) {
      await seedCreation(request, auth.token, creationPayload({ topic: `${prefix} ${index}` }));
    }
    await loginByLocalStorage(page, auth);

    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.search(prefix);
    await page.getByTestId('history-order').click();
    await page.locator('.el-popper:visible .el-select-dropdown__item').last().click();

    await expect(page.locator('.el-pagination')).toBeVisible();
    await expect(page.getByTestId('history-table')).toContainText(prefix);
  });
});
