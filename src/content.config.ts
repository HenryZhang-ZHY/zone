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
		ogUrl: z.string().url(),
		ogImage: z.string().url(),
	}),
});

const podcast = defineCollection({
	loader: file('./src/content/podcast.yaml'),
	schema: z.object({
		ogTitle: z.string(),
		ogUrl: z.string().url(),
		ogImage: z.string().url(),
		ogAudio: z.string().url(),
	}),
});

export const collections = { blog, book, podcast };
