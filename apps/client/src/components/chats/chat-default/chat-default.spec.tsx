import { newSpecPage } from '@stencil/core/testing';
import { ChatDefault } from './chat-default';

describe('chat-default', () => {
  it('renders the welcome message', async () => {
    const { root } = await newSpecPage({
      components: [ChatDefault],
      html: '<chat-default></chat-default>',
    });
    expect(root).toBeTruthy();
    const cardTitle = root.shadowRoot.querySelector('ion-card-title');
    expect(cardTitle.textContent).toContain('Welcome to Gruuplr Chat!');
  });
});