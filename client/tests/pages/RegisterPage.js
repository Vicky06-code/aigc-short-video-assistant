import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class RegisterPage extends BasePage {
  async goto() {
    await this.page.goto('/register');
    await expect(this.byTestId('register-submit')).toBeVisible();
  }

  async register(user) {
    await this.fillInput('register-username', user.username);
    await this.fillInput('register-email', user.email);
    await this.fillInput('register-password', user.password);
    await this.fillInput('register-confirm-password', user.password);
    await this.clickButton('register-submit');
  }
}
