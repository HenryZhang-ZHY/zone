// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';

import expressiveCode from 'astro-expressive-code';
import { addClassName } from 'astro-expressive-code/hast';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeFootnotes from './src/lib/rehype-footnotes';
import i18nOutput from './src/integrations/i18n-output';

const markdownProcessor = unified({
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex, rehypeFootnotes],
});

// https://astro.build/config
export default defineConfig({
  site: 'https://shuzhi.zone',
  // Every page URL ends in a slash, so each page has exactly one URL.
  trailingSlash: 'always',
  // In production the Worker picks the reader's language for `/` first; this static
  // redirect only serves local development and requests that bypass the Worker.
  redirects: { '/': '/en/' },
  integrations: [
    expressiveCode({
      plugins: [
        {
          name: 'not-content-plugin',
          hooks: {
            postprocessRenderedBlock: ({ renderData }) => {
              addClassName(renderData.blockAst, 'not-content');
            }
          }
        }
      ]
    }),
    mdx(),
    i18nOutput()
  ],
  vite: {
    // esbuild escapes non-ASCII (lightningcss, Vite's default, does not), so CSS
    // `content` glyphs like • and · survive servers that send text/css without a charset.
    build: { cssMinify: 'esbuild' },
    esbuild: { charset: 'ascii' },
  },
  markdown: {
    processor: markdownProcessor,
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
