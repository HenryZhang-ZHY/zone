// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';

import expressiveCode from 'astro-expressive-code';
import { addClassName } from 'astro-expressive-code/hast';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeFootnotes from './src/lib/rehype-footnotes';

const markdownProcessor = unified({
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex, rehypeFootnotes],
});

// https://astro.build/config
export default defineConfig({
  site: 'https://shuzhi.zone',
  // Every page URL ends in a slash, so each page has exactly one URL.
  trailingSlash: 'always',
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
    sitemap()
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
