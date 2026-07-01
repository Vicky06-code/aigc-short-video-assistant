import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';
import { uniqueUser } from '../utils/testData.js';

test.describe('认证异常与密码重置', () => {
  test('登录页会拦截无效邮箱格式', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('bad-email', 'wrong-password');

    await expect(page).toHaveURL(/\/login/);
  });

  test('注册页会校验密码强度和确认密码一致性', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const user = uniqueUser('weak');

    await registerPage.goto();
    await registerPage.fillInput('register-username', user.username);
    await registerPage.fillInput('register-email', user.email);
    await registerPage.fillInput('register-password', '123456');
    await registerPage.fillInput('register-confirm-password', '654321');
    await registerPage.clickButton('register-submit');

    await expect(page).toHaveURL(/\/register/);
  });

  test('忘记密码可以完成邮箱验证码重置流程', async ({ page }) => {
    await page.route('**/api/auth/password-reset/request', async (route) => {
      await route.fulfill({ json: { success: true, message: 'code sent' } });
    });
    await page.route('**/api/auth/password-reset/confirm', async (route) => {
      await route.fulfill({ json: { success: true, message: 'reset success' } });
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openForgotPassword();

    await loginPage.fillInput('reset-email', 'reset@example.com');
    await loginPage.clickButton('send-reset-code');
    await loginPage.fillInput('reset-code', '123456');
    await loginPage.fillInput('reset-new-password', 'Reset123456');
    await loginPage.fillInput('reset-confirm-password', 'Reset123456');
    await loginPage.clickButton('confirm-reset');

    await expect(page.locator('.el-dialog')).toBeHidden();
    await expect(page.getByTestId('login-email')).toHaveValue('reset@example.com');
  });

  test('无效 token 访问内部页面会回到登录页', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      window.localStorage.setItem('token', 'invalid-token');
      window.localStorage.setItem('user', JSON.stringify({ id: 999, username: 'invalid', email: 'invalid@example.com' }));
    });

    await page.goto('/history');

    await expect(page).toHaveURL(/\/login/);
  });
});
