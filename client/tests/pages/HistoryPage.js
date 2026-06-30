import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class HistoryPage extends BasePage {
  async goto() {
    await this.page.goto('/history');
    await expect(this.byTestId('history-table')).toBeVisible();
  }

  async search(keyword) {
    await this.fillInput('history-search', keyword);
  }

  async openFirstDetail() {
    await this.byTestId('history-view').first().click();
    await expect(this.page.locator('.el-drawer')).toBeVisible();
  }

  async deleteFirstRecord() {
    await this.byTestId('history-delete').first().click();
    await this.page.locator('.el-message-box').getByRole('button').filter({ hasText: /确定|OK|Confirm|Bestätigen/i }).click();
  }
}
