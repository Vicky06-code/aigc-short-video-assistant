import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  async goto() {
    await this.page.goto('/login');
    await expect(this.byTestId('login-submit')).toBeVisible();
  }

  async login(email, password) {
    await this.fillInput('login-email', email);
    await this.fillInput('login-password', password);
    await this.clickButton('login-submit');
  }

  async openForgotPassword() {
    await this.clickButton('forgot-password');
    await expect(this.byTestId('reset-dialog')).toBeVisible();
  }
}
