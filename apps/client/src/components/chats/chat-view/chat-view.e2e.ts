import { newE2EPage } from '@stencil/core/testing';

describe('chat-view', () => {
  it('renders and sends a message', async () => {
    const page = await newE2EPage();
    await page.setContent('<chat-view group-id="general"></chat-view>');
    const input = await page.find('chat-view >>> ion-input');
    expect(input).not.toBeNull();
    // Cast input to any to use evaluate
    await (input as any).evaluate((el: HTMLInputElement) => {
      el.value = 'Hello';
      el.dispatchEvent(new Event('input'));
    });
    await page.waitForChanges();
    const button = await page.find('chat-view >>> ion-button');
    await button.click();
    await page.waitForChanges();
    const items = await page.findAll('chat-view >>> ion-item');
    expect(items.length).toBeGreaterThan(0);
  });
});