/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import react from '@vitejs/plugin-react';
import { UserConfig, defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const config: UserConfig = {
    build: {
      // Included in the bundled build so that users can see non-minified error
      // messages using DevTools for debugging (at the cost of bundle size).
      sourcemap: true,
      outDir: mode === 'server' ? 'dist/server' : 'dist/client',
    },
    publicDir: mode === 'server' ? false : 'public',
    plugins: [
      react(),
      svgrPlugin({
        svgrOptions: {
          icon: true,
        },
      }),
      viteCommonjs(),

      // Fix Vite routing paths with dots (used in Storage/Firestore/etc.):
      // https://github.com/vitejs/vite/issues/2415
      pluginRewriteAll(),
    ],
    resolve: {
      alias:
        mode !== 'server'
          ? {
              // node-fetch is imported by Firebase SDKs but not actually used
              // in browsers. Stub it to silence Vite errors on Node.js deps.
              'node-fetch': './src/stub.js',
            }
          : undefined,
    },
  };
  if (command === 'serve' || mode === 'server') {
    // Start Node.js server (APIs) during dev time.
    config.plugins!.push(
      ...VitePluginNode({
        // tell the plugin where is your project entry
        appPath: './server.ts',

        // the name of named export of you app from the appPath file
        exportName: 'viteNodeApp',
        tsCompiler: 'esbuild',
        // https://github.com/axe-me/vite-plugin-node/issues/47
        adapter({ app, req, res, next }) {
          if (req.url?.startsWith('/api/')) {
            app(req, res);
          } else {
            next();
          }
        },
      })
    );
    // Rollup a server bundle when `vite build --mode server` is invoked.
    if (command === 'build') {
      // @ts-ignore (Vite alpha feature: https://vitejs.dev/config/#ssr-options)
      // This instructs Vite to rollup all dependencies into a single file.
      // Needed because the Emulator UI is distributed as a self-contained zip
      // ball with no `node_modules` or `package.json`.
      config.ssr = { noExternal: /^(?!dns)/ };
    }
  }
  return config;
});
