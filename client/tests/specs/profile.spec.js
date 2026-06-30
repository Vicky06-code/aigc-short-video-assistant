import { expect, test } from '@playwright/test';
import { createLoggedInUser, loginByLocalStorage } from '../utils/apiClient.js';

test.describe('个人中心', () => {
  test('个人中心展示用户信息并支持退出登录', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    await loginByLocalStorage(page, auth);

    await page.goto('/profile');

    await expect(page.getByText(auth.profile.username)).toBeVisible();
    await page.getByTestId('profile-logout').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
