import { glob, file } from 'astro/loaders';
import { defineCollection, reference, z } from 'astro:content';

const lang = z.enum(['en', 'zh-Hans']);

const series = defineCollection({
	loader: file('./src/content/series.yaml'),
	schema: z.object({
		title: z.string(),
		description: z.string().min(20).max(160),
		lang: lang.default('en'),
	}),
});

const blog = defineCollection({
	// Each post is a bundle: `<slug>/index.md` holds the original, siblings hold its images.
	loader: glob({
		base: './src/content/blog',
		pattern: '*/index.{md,mdx}',
		generateId: ({ entry }) => entry.split('/')[0],
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().min(50).max(160),
		lang: lang.default('en'),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		redirect: z.string().optional(),
		series: reference('series').optional(),
		seriesOrder: z.number().int().positive().optional(),
	}).refine((data) => (data.series === undefined) === (data.seriesOrder === undefined), {
		message: '`series` and `seriesOrder` must be set together',
		path: ['seriesOrder'],
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

export const collections = { blog, series, book, readingList, podcast, dsibs };
