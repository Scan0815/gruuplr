import { newSpecPage } from '@stencil/core/testing';
import { PageRegister } from './page-register';

describe('page-register', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [PageRegister],
      html: '<page-register></page-register>',
    });
    expect(root).toEqualHtml(`
      <page-register>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </page-register>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [PageRegister],
      html: `<page-register first="Stencil" last="'Don't call me a framework' JS"></page-register>`,
    });
    expect(root).toEqualHtml(`
      <page-register first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </page-register>
    `);
  });
});
