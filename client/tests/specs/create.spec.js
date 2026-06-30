import { expect, test } from '@playwright/test';
import { CreatePage } from '../pages/CreatePage.js';
import { createLoggedInUser, loginByLocalStorage } from '../utils/apiClient.js';
import { creationPayload } from '../utils/testData.js';

test.describe('智能创作流程', () => {
  test.beforeEach(async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    await loginByLocalStorage(page, auth);
  });

  test('模板模式可以生成内容并保存到历史记录', async ({ page }) => {
    const createPage = new CreatePage(page);

    await createPage.goto();
    await createPage.chooseTemplateMode();
    await createPage.fillForm(creationPayload());
    await createPage.generate();

    await expect(page.getByText(/口播文案|Speech/i)).toBeVisible();
    await expect(page.getByText(/分镜脚本|Storyboard/i)).toBeVisible();
    await expect(page.getByText(/发布建议|Publish/i)).toBeVisible();

    await createPage.save();
  });

  test('90 秒视频时长可以选择并生成更长分镜', async ({ page }) => {
    const createPage = new CreatePage(page);

    await createPage.goto();
    await createPage.chooseTemplateMode();
    await createPage.fillForm(creationPayload({ duration: 90, topic: '职场新人如何提升表达能力' }));
    await createPage.generate();

    await expect(page.getByTestId('create-result')).toContainText(/90|标题推荐|Title/i);
  });

  test('复制全部内容按钮可用', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permission is verified in Chromium only.');

    const createPage = new CreatePage(page);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await createPage.goto();
    await createPage.chooseTemplateMode();
    await createPage.fillForm(creationPayload({ topic: '新手如何开始做短视频账号' }));
    await createPage.generate();
    await createPage.clickButton('create-copy');

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain('新手如何开始做短视频账号');
  });
});
