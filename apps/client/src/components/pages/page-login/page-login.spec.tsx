import { newSpecPage } from '@stencil/core/testing';
import { PageLogin } from './page-login';

describe('page-login', () => {
  it('renders the login form', async () => {
    const { root } = await newSpecPage({
      components: [PageLogin],
      html: '<page-login></page-login>',
    });
    expect(root).toBeTruthy();
    // Check that the ion-card-title contains "Login"
    const cardTitle = root?.shadowRoot?.querySelector('ion-card-title');
    expect(cardTitle.textContent).toContain('Login');
  });
});