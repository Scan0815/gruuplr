import { newSpecPage } from '@stencil/core/testing';
import { PageChat } from '../page-chat';

describe('page-chat', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [PageChat],
      html: '<page-chat></page-chat>',
    });
    expect(root).toBeTruthy();
  });
});