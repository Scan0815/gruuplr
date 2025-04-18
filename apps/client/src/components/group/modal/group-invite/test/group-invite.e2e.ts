import { newE2EPage } from '@stencil/core/testing';

describe('group-invite', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<group-invite></group-invite>');
    const element = await page.find('group-invite');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<group-invite></group-invite>');
    const component = await page.find('group-invite');
    const element = await page.find('group-invite >>> div');
    expect(element.textContent).toEqual(`Hello, World! I'm `);

    component.setProperty('first', 'James');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James`);

    component.setProperty('last', 'Quincy');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Quincy`);

    component.setProperty('middle', 'Earl');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Earl Quincy`);
  });
});
