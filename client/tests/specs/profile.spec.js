import { expect, test } from '@playwright/test';
import { createLoggedInUser } from '../utils/apiClient.js';

test.describe('个人中心', () => {
  test('个人中心展示用户信息并支持退出登录', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);

    await page.goto('/login');
    await page.evaluate(({ token, profile }) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(profile));
    }, auth);
    await page.goto('/profile');

    await expect(page.locator('.profile-user h2')).toHaveText(auth.profile.username);
    await page.getByTestId('profile-logout').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
