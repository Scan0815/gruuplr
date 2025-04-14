import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import resolve from '@rollup/plugin-node-resolve';
import { webTypesOutputTarget } from '@stencil-community/web-types-output-target';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.scss',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  sourceMap: true,
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null
    },
    webTypesOutputTarget({ outFile: './web-types/web-types.json' })
  ],
  rollupPlugins:{
    before: [
      alias({
        entries: [
          {
            find: 'dexie',
            // Point to the ES module build rather than the minified UMD build.
            replacement: 'node_modules/dexie/dist/dexie.mjs'
          }
        ]
      }),
      resolve({ browser: true }),
      commonjs({
        requireReturnsDefault: 'auto'
      })
    ]
  },
  plugins: [
    sass(),
    nodePolyfills()
  ],
  devServer: {
    reloadStrategy: 'pageReload',
    basePath: '/',
    initialLoadUrl: '/',
    logRequests: false,
    openBrowser: true,
    port: 3335,
    address: 'localhost',
  },
};
