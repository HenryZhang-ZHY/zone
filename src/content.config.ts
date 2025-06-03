import { glob, file } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
	}),
});

const book = defineCollection({
	loader: file('./src/content/book.yaml'),
	schema: z.object({
		title: z.string(),
		url: z.string().url(),
	}),
});

export const collections = { blog, book };
