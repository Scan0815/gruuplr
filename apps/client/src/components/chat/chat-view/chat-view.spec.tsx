import { newSpecPage } from '@stencil/core/testing';
import { ChatView } from './chat-view';

describe('chat-view', () => {
  it('renders chat view with group id', async () => {
    const { root } = await newSpecPage({
      components: [ChatView],
      html: '<chat-view group-id="general"></chat-view>',
    });
    expect(root).toBeTruthy();
    const title = root.shadowRoot.querySelector('ion-title');
    expect(title.textContent).toContain('general');
  });
});