// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';

import expressiveCode from 'astro-expressive-code';
import { addClassName } from 'astro-expressive-code/hast';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const markdownProcessor = unified({
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
});

// https://astro.build/config
export default defineConfig({
  site: 'https://shuzhi.zone',
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
