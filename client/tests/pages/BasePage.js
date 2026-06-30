export class BasePage {
  constructor(page) {
    this.page = page;
  }

  byTestId(testId) {
    return this.page.getByTestId(testId);
  }

  async fillInput(testId, value) {
    const field = this.byTestId(testId);
    const isNativeControl = await field.evaluate((element) => element.matches('input, textarea'));
    const control = isNativeControl ? field : field.locator('input, textarea').first();
    await control.fill(String(value));
  }

  async selectByVisibleText(testId, label) {
    await this.byTestId(testId).click();
    await this.page.locator('.el-select-dropdown__item', { hasText: label }).last().click();
  }

  async clickButton(testId) {
    await this.byTestId(testId).click();
  }
}
