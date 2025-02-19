import { newE2EPage } from '@stencil/core/testing';

describe('page-login', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<page-login></page-login>');
    const element = await page.find('page-login');
    expect(element).toHaveClass('hydrated');
  });

  it('shows error message when fields are empty and form is submitted', async () => {
    const page = await newE2EPage();
    await page.setContent('<page-login></page-login>');

    const form = await page.find('page-login >>> form');
    // Cast form to any to use evaluate
    await (form as any).evaluate((el: HTMLFormElement) => {
      el.dispatchEvent(new Event('submit'));
    });
    await page.waitForChanges();

    const errorText = await page.find('page-login >>> ion-text[color="danger"]');
    expect(errorText).not.toBeNull();
    expect(errorText.textContent).toContain('Please fill in both fields.');
  });
});