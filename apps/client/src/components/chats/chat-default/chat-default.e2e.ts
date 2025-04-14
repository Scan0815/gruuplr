import { newE2EPage } from '@stencil/core/testing';

describe('chat-default', () => {
  it('renders and shows the welcome message', async () => {
    const page = await newE2EPage();
    await page.setContent('<chat-default></chat-default>');
    const element = await page.find('chat-default');
    expect(element).toHaveClass('hydrated');
    const title = await page.find('chat-default >>> ion-card-title');
    expect(title.textContent).toContain('Welcome to Gruuplr Chat!');
  });
});
