import { expect, test } from '@playwright/test';
import { createLoggedInUser, loginByLocalStorage } from '../utils/apiClient.js';

test.describe('工作台', () => {
  test.beforeEach(async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    await loginByLocalStorage(page, auth);
  });

  test('工作台展示热门话题，并可从话题进入创作页', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('.trend-card').first()).toBeVisible();
    await page.getByTestId('hot-topic-use').first().click();

    await expect(page).toHaveURL(/\/create/);
    await expect(page.getByTestId('create-topic')).not.toHaveValue('');
  });

  test('左侧导航可以在主要模块之间切换', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByTestId('nav-create').click();
    await expect(page).toHaveURL(/\/create/);

    await page.getByTestId('nav-history').click();
    await expect(page).toHaveURL(/\/history/);

    await page.getByTestId('nav-profile').click();
    await expect(page).toHaveURL(/\/profile/);
  });
});
