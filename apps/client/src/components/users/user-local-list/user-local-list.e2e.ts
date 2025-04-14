import { newE2EPage } from '@stencil/core/testing';

describe('user-local-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<user-local-list></user-local-list>');
    const element = await page.find('user-local-list');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<user-local-list></user-local-list>');
    const component = await page.find('user-local-list');
    const element = await page.find('user-local-list >>> div');
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
