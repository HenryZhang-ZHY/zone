import { glob, file } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		redirect: z.string().optional(),
	}),
});

const book = defineCollection({
	loader: file('./src/content/book.yaml'),
	schema: ({ image }) => z.object({
		title: z.string(),
		ogUrl: z.string().url(),
		ogImage: image(),
	}),
});

const readingList = defineCollection({
	loader: file('./src/content/reading-list.yaml'),
	schema: z.object({
		title: z.string(),
		ogUrl: z.string().url(),
		dateRead: z.coerce.date(),
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

const bankType = z.enum(['国有商业银行', '股份制商业银行', '城市商业银行']);

const dsibs = defineCollection({
	loader: file('./src/content/d-sibs.yaml'),
	schema: z.object({
		year: z.number().int(),
		link: z.string().url(),
		groups: z.array(z.object({
			level: z.number().int().min(1).max(5),
			banks: z.array(z.object({
				name: z.string(),
				type: bankType,
			})),
		})),
	}),
});

export const collections = { blog, book, readingList, podcast, dsibs };
