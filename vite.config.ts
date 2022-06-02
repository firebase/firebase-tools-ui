import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

const { PORT = 3001 } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
    viteCommonjs(),
  ],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
    },
  },
})