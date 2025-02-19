import { newE2EPage } from '@stencil/core/testing';

describe('group-list', () => {
  it('renders and allows group selection', async () => {
    const page = await newE2EPage();
    await page.setContent('<group-list></group-list>');
    const groupItem = await page.find('group-list >>> ion-item');
    expect(groupItem).not.toBeNull();
    groupItem.click();
    await page.waitForChanges();
    const element = await page.find('group-list');
    expect(element).toHaveClass('hydrated');
  });
});