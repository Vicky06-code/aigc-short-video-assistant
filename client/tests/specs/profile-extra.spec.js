import { expect, test } from '@playwright/test';
import { createLoggedInUser, loginUser } from '../utils/apiClient.js';

test.describe('个人中心资料与安全', () => {
  test('可以修改用户名', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    const newUsername = `u_${Date.now().toString(36).slice(-8)}`;

    await page.goto('/login');
    await page.evaluate(({ token, profile }) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(profile));
    }, auth);
    await page.goto('/profile');

    await page.getByTestId('profile-update-username').click();
    await page.getByTestId('profile-username-input').fill(newUsername);
    await page.getByTestId('profile-save-username').click();

    await expect(page.locator('.profile-user h2')).toHaveText(newUsername);
  });

  test('可以修改密码并使用新密码登录', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    const newPassword = `Newpass${Date.now().toString().slice(-6)}A`;

    await page.goto('/login');
    await page.evaluate(({ token, profile }) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(profile));
    }, auth);
    await page.goto('/profile');

    await page.getByTestId('profile-update-password').click();
    await page.getByTestId('profile-old-password').fill(auth.user.password);
    await page.getByTestId('profile-new-password').fill(newPassword);
    const passwordResponse = page.waitForResponse((response) => (
      response.url().includes('/api/auth/password') && response.request().method() === 'PUT'
    ));
    await page.getByTestId('profile-save-password').click();
    expect((await passwordResponse).ok()).toBeTruthy();

    await loginUser(request, { email: auth.user.email, password: newPassword });
  });
});
