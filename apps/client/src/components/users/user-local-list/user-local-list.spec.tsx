import { newSpecPage } from '@stencil/core/testing';
import { UserLocalList } from './user-local-list';

describe('user-local-list', () => {
  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [UserLocalList],
      html: '<user-local-list></user-local-list>',
    });
    expect(root).toEqualHtml(`
      <user-local-list>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </user-local-list>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [UserLocalList],
      html: `<user-local-list first="Stencil" last="'Don't call me a framework' JS"></user-local-list>`,
    });
    expect(root).toEqualHtml(`
      <user-local-list first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </user-local-list>
    `);
  });
});
