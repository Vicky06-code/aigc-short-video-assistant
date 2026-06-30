import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class CreatePage extends BasePage {
  async goto() {
    await this.page.goto('/create');
    await expect(this.byTestId('create-generate')).toBeVisible();
  }

  async fillForm(input) {
    await this.fillInput('create-topic', input.topic);
    await this.selectByVisibleText('create-platform', input.platform);
    await this.selectByVisibleText('create-style', input.style);
    await this.byTestId('create-duration').getByText(`${input.duration}s`).click();
    await this.fillInput('create-audience', input.audience);
    if (input.creativeRequirement) {
      await this.fillInput('create-requirement', input.creativeRequirement);
    }
  }

  async chooseTemplateMode() {
    await this.byTestId('generation-mode-switch').getByText(/模板|Template/i).first().click();
  }

  async generate() {
    await this.clickButton('create-generate');
    await expect(this.byTestId('create-result')).toContainText(/标题推荐|Title/i, { timeout: 30_000 });
  }

  async save() {
    await this.clickButton('create-save');
    await expect(this.byTestId('create-save')).toBeDisabled({ timeout: 10_000 });
  }
}
