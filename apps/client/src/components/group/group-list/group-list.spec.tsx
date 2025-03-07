import { newSpecPage } from '@stencil/core/testing';
import { GroupList } from './group-list';

describe('group-list', () => {
  it('renders a list of groups', async () => {
    const { root } = await newSpecPage({
      components: [GroupList],
      html: '<group-list></group-list>',
    });
    expect(root).toBeTruthy();
    const items = root.shadowRoot.querySelectorAll('ion-item');
    expect(items.length).toBe(3);
  });
});