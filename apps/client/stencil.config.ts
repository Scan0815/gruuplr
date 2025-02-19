import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { webTypesOutputTarget } from '@stencil-community/web-types-output-target';

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
