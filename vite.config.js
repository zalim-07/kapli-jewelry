import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vite';
import { extname, resolve } from 'node:path';
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

const pugPages = Object.fromEntries(
  readdirSync(__dirname)
    .filter((file) => file.endsWith('.pug'))
    .map((file) => [file.replace(/\.pug$/, ''), resolve(__dirname, file)]),
);

function assetFileNames(info) {
  const name = info.names?.[0] ?? info.name ?? 'asset';
  const ext = extname(name).toLowerCase();

  if (ext === '.css') {
    return 'css/[name].min[extname]';
  }

  if (['.woff', '.woff2', '.eot', '.ttf', '.otf'].includes(ext)) {
    return 'fonts/[name][extname]';
  }

  if (ext === '.svg') {
    return 'svg/[name][extname]';
  }

  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif'].includes(ext)) {
    return 'images/[name][extname]';
  }

  return '[name][extname]';
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
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
    build: isBuild
      ? {
          outDir: 'dist',
          emptyOutDir: true,
          cssCodeSplit: false,
          assetsInlineLimit: 0,
          rollupOptions: {
            input: pugPages,
            output: {
              entryFileNames: 'js/[name].min.js',
              chunkFileNames: 'js/[name].min.js',
              assetFileNames,
            },
          },
        }
      : undefined,
  };
});
