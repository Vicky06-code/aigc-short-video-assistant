import { expect, test } from '@playwright/test';
import { CreatePage } from '../pages/CreatePage.js';
import { createLoggedInUser, loginByLocalStorage } from '../utils/apiClient.js';
import { creationPayload } from '../utils/testData.js';

const mockedResult = {
  titles: ['AI title 1', 'AI title 2', 'AI title 3', 'AI title 4', 'AI title 5'],
  selectedTitle: 'AI title 1',
  speechScript: 'This is an AI generated script for UI automation.',
  storyboard: [
    { sceneNo: 1, timeRange: '0-10s', visual: 'Opening', voiceover: 'Intro', subtitle: 'Intro', camera: 'Close-up' },
    { sceneNo: 2, timeRange: '10-20s', visual: 'Body', voiceover: 'Body', subtitle: 'Body', camera: 'Medium' },
    { sceneNo: 3, timeRange: '20-30s', visual: 'Ending', voiceover: 'Ending', subtitle: 'Ending', camera: 'Wide' }
  ],
  tags: ['#AI', '#E2E', '#Video', '#Test', '#Creator', '#Automation', '#Content', '#ShortVideo'],
  publishAdvice: {
    bestTime: '20:00',
    coverText: 'AI Cover',
    interactionGuide: 'Comment your idea',
    platformAdvice: 'Use a strong hook.'
  }
};

test.describe('AI 生成模式', () => {
  test.beforeEach(async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    await loginByLocalStorage(page, auth);
  });

  test('AI 模式生成结果时展示 AI 智能生成状态', async ({ page }) => {
    await page.route('**/api/creation/generate', async (route) => {
      await route.fulfill({ json: { success: true, generationMode: 'ai', data: mockedResult } });
    });

    const createPage = new CreatePage(page);
    await createPage.goto();
    await createPage.chooseAiMode();
    await createPage.fillForm(creationPayload({ topic: 'AI mode e2e topic' }));
    await createPage.generate();

    await expect(page.getByTestId('create-result')).toContainText('AI title 1');
  });

  test('AI 调用失败时展示兜底模板提示', async ({ page }) => {
    await page.route('**/api/creation/generate', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          generationMode: 'fallback_template',
          fallbackReason: 'mock ai timeout',
          data: mockedResult
        }
      });
    });

    const createPage = new CreatePage(page);
    await createPage.goto();
    await createPage.chooseAiMode();
    await createPage.fillForm(creationPayload({ topic: 'fallback e2e topic' }));
    await createPage.generate();

    await expect(page.locator('.mode-fallback-alert')).toContainText('mock ai timeout');
  });
});
