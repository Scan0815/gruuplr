import { newSpecPage } from '@stencil/core/testing';
import { GroupCreate } from '../group-create';

describe('group-create', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [GroupCreate],
      html: '<group-create></group-create>',
    });
    expect(root).toEqualHtml(`
      <group-create>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </group-create>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [GroupCreate],
      html: `<group-create first="Stencil" last="'Don't call me a framework' JS"></group-create>`,
    });
    expect(root).toEqualHtml(`
      <group-create first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </group-create>
    `);
  });
});
