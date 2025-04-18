import { newSpecPage } from '@stencil/core/testing';
import { GroupInvite } from '../group-invite';

describe('group-invite', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [GroupInvite],
      html: '<group-invite></group-invite>',
    });
    expect(root).toEqualHtml(`
      <group-invite>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </group-invite>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [GroupInvite],
      html: `<group-invite first="Stencil" last="'Don't call me a framework' JS"></group-invite>`,
    });
    expect(root).toEqualHtml(`
      <group-invite first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </group-invite>
    `);
  });
});
