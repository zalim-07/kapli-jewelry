import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pugPlugin from 'vite-pug-static-builder';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const pugRoot = resolve(__dirname, 'src/pug');
const products = JSON.parse(
  readFileSync(resolve(__dirname, 'src/data/products.json'), 'utf-8'),
);
const categories = JSON.parse(
  readFileSync(resolve(__dirname, 'src/data/categories.json'), 'utf-8'),
);

const pugSettings = {
  options: {
    basedir: pugRoot,
  },
  locals: {
    products,
    categories,
  },
};

export default defineConfig({
  plugins: [
    pugPlugin({
      build: pugSettings,
      serve: {
        ...pugSettings,
        reload: true,
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: false,
    open: true,
  },
  build: {
    rollupOptions: {
      input: [
        resolve(__dirname, 'index.pug'),
        resolve(__dirname, 'home.pug'),
        resolve(__dirname, 'coming-soon.pug'),
      ],
    },
  },
});
