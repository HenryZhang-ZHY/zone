import { glob, file } from 'astro/loaders';
import { parse } from 'yaml';
import { defineCollection, reference, z } from 'astro:content';
import { localeTags, type Locale } from './i18n/locales';
import { translationKey } from './lib/localized';

const lang = z.enum(localeTags as [Locale, ...Locale[]]);

/**
 * A YAML array is ordered on purpose — the shelf runs by importance, not by date — but
 * Astro keys a `file()` collection by id and sorts it, which throws that order away.
 * Stamp each entry with its index so the page can put the array back in order.
 */
const orderedFile = (fileName: string) =>
	file(fileName, {
		parser: (text: string) =>
			(parse(text) as Record<string, unknown>[]).map((item, order) => ({ ...item, order })),
	});

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
	loader: orderedFile('./src/content/book.yaml'),
	schema: ({ image }) => z.object({
		order: z.number().int(),
		title: z.string(),
		ogUrl: z.url(),
		ogImage: image(),
	}),
});

const readingList = defineCollection({
	loader: file('./src/content/reading-list.yaml'),
	schema: z.object({
		title: z.string(),
		ogUrl: z.url(),
		dateRead: z.coerce.date(),
	}),
});

const podcast = defineCollection({
	loader: orderedFile('./src/content/podcast.yaml'),
	schema: z.object({
		order: z.number().int(),
		ogTitle: z.string(),
		ogUrl: z.url(),
		ogImage: z.url(),
		show: z.string(),
		showCover: z.url(),
		ogAudio: z.url(),
	}),
});

const bankType = z.enum(['国有商业银行', '股份制商业银行', '城市商业银行']);

const dsibs = defineCollection({
	loader: file('./src/content/d-sibs.yaml'),
	schema: z.object({
		year: z.number().int(),
		link: z.url(),
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
