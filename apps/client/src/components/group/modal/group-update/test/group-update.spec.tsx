import { newSpecPage } from '@stencil/core/testing';
import { GroupUpdate } from '../group-update';

describe('group-update', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [GroupUpdate],
      html: '<group-update></group-update>',
    });
    expect(root).toEqualHtml(`
      <group-update>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </group-update>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [GroupUpdate],
      html: `<group-update first="Stencil" last="'Don't call me a framework' JS"></group-update>`,
    });
    expect(root).toEqualHtml(`
      <group-update first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </group-update>
    `);
  });
});
