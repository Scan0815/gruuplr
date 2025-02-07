import { newSpecPage } from '@stencil/core/testing';
import { RxdbTest } from './rxdb-test';

describe('rxdb-test', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [RxdbTest],
      html: '<rxdb-test></rxdb-test>',
    });
    expect(root).toEqualHtml(`
      <rxdb-test>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </rxdb-test>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [RxdbTest],
      html: `<rxdb-test first="Stencil" last="'Don't call me a framework' JS"></rxdb-test>`,
    });
    expect(root).toEqualHtml(`
      <rxdb-test first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </rxdb-test>
    `);
  });
});
