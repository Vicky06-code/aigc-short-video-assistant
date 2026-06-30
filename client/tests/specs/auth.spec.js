import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { createLoggedInUser, loginByLocalStorage } from '../utils/apiClient.js';
import { uniqueUser } from '../utils/testData.js';

test.describe('用户认证流程', () => {
  test('未登录访问工作台会跳转到登录页', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('用户可以注册并跳转登录页', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = uniqueUser('register');

    await registerPage.goto();
    await registerPage.register(user);

    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('用户可以登录并进入工作台', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(auth.user.email, auth.user.password);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByTestId('nav-create')).toBeVisible();
  });

  test('已登录用户访问登录页会自动回到工作台', async ({ page, request }) => {
    const auth = await createLoggedInUser(request);
    await loginByLocalStorage(page, auth);

    await page.goto('/login');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('忘记密码入口可以打开邮箱验证码重置弹窗', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.openForgotPassword();

    await expect(page.getByTestId('reset-email')).toBeVisible();
    await expect(page.getByTestId('send-reset-code')).toBeVisible();
  });
});
