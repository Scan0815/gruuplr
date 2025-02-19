import { newE2EPage } from '@stencil/core/testing';

describe('page-chat', () => {
  it('renders and contains group-list and chat-view', async () => {
    const page = await newE2EPage();
    await page.setContent('<page-chat></page-chat>');
    const groupList = await page.find('page-chat >>> group-list');
    const chatView = await page.find('page-chat >>> chat-view');
    expect(groupList).not.toBeNull();
    expect(chatView).not.toBeNull();
  });
});