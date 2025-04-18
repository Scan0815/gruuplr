import { newSpecPage } from '@stencil/core/testing';
import { GroupJoin } from '../group-join';

describe('group-join', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [GroupJoin],
      html: '<group-join></group-join>',
    });
    expect(root).toEqualHtml(`
      <group-join>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </group-join>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [GroupJoin],
      html: `<group-join first="Stencil" last="'Don't call me a framework' JS"></group-join>`,
    });
    expect(root).toEqualHtml(`
      <group-join first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </group-join>
    `);
  });
});
