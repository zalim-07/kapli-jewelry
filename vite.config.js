import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pugPlugin from 'vite-pug-static-builder';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const themeAssetsDir = resolve(__dirname, '../docker/wp-content/themes/kapli-jewelry/assets');
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

const staticAssetDirs = [
  ['src/assets/images', 'images'],
  ['src/assets/svg', 'svg'],
];

function copyStaticAssets() {
  for (const [source, target] of staticAssetDirs) {
    const from = resolve(__dirname, source);
    const to = resolve(themeAssetsDir, target);

    if (!existsSync(from)) {
      continue;
    }

    mkdirSync(to, { recursive: true });
    cpSync(from, to, { recursive: true });
  }
}

function cleanThemeAssets() {
  const preserveJs = new Set(['product-variations.js']);
  const dirsToClean = ['css', 'fonts', 'images', 'svg'];

  mkdirSync(themeAssetsDir, { recursive: true });

  for (const dir of dirsToClean) {
    const fullPath = resolve(themeAssetsDir, dir);

    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true });
    }

    mkdirSync(fullPath, { recursive: true });
  }

  const jsDir = resolve(themeAssetsDir, 'js');

  mkdirSync(jsDir, { recursive: true });

  for (const file of readdirSync(jsDir)) {
    if (!preserveJs.has(file)) {
      unlinkSync(resolve(jsDir, file));
    }
  }
}

function assetFileNames(info) {
  const name = info.names?.[0] ?? info.name ?? 'asset';
  const ext = extname(name).toLowerCase();

  if (ext === '.css') {
    return 'css/main.min[extname]';
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
    base: isBuild ? './' : '/',
    plugins: [
      !isBuild
        && pugPlugin({
          build: pugSettings,
          serve: {
            ...pugSettings,
            reload: true,
          },
        }),
      isBuild && {
        name: 'kapli-clean-theme-assets',
        buildStart() {
          cleanThemeAssets();
        },
      },
      isBuild && {
        name: 'kapli-copy-static-assets',
        closeBundle() {
          copyStaticAssets();
        },
      },
    ].filter(Boolean),
    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: false,
      open: true,
    },
    build: isBuild
      ? {
          outDir: themeAssetsDir,
          emptyOutDir: false,
          cssCodeSplit: false,
          assetsInlineLimit: 0,
          rollupOptions: {
            input: resolve(__dirname, 'src/main.js'),
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
