import { glob, file } from 'astro/loaders';
import { defineCollection, reference, z } from 'astro:content';
import { localeTags, type Locale } from './i18n/locales';
import { translationKey } from './lib/localized';

const lang = z.enum(localeTags as [Locale, ...Locale[]]);

const localizedText = z.object({
	title: z.string(),
	description: z.string().min(20).max(160),
});

const series = defineCollection({
	loader: file('./src/content/series.yaml'),
	schema: z.object({
		title: z.string(),
		description: z.string().min(20).max(160),
		lang: lang.default('en'),
		translations: z.partialRecord(lang, localizedText).optional(),
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

// Hand-made translations sit beside the original: `<slug>/<locale>.md`. Publish
// date, series and update date belong to the original and are not repeated here.
const translations = defineCollection({
	loader: glob({
		base: './src/content/blog',
		pattern: ['*/*.{md,mdx}', '!*/index.{md,mdx}'],
		generateId: ({ entry }) => {
			const id = entry.replace(/\.mdx?$/, '');
			translationKey(id);
			return id;
		},
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().min(50).max(160),
		translatedAt: z.coerce.date(),
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

export const collections = { blog, translations, series, book, readingList, podcast, dsibs };
