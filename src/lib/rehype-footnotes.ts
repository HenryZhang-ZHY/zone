import type { Element, ElementContent, Root, RootContent } from 'hast'
import type { VFile } from 'vfile'
import { defaultLocale, isLocale, t, type Locale } from '../i18n'

// U+FE0E asks for the text glyph; a bare U+21A9 renders as a color emoji on Windows.
export const FOOTNOTE_BACK_TEXT = '\u21A9\uFE0E'

const walk = (node: Root | RootContent, visit: (el: Element) => void) => {
	if (node.type === 'element') visit(node)
	if ('children' in node) for (const child of node.children) walk(child, visit)
}

// Translations are named after their language, e.g. `blog/<slug>/ja.md`.
const fileLocale = (file: VFile) => {
	const name = file.stem
	return isLocale(name) ? name : undefined
}

const text = (value: string): ElementContent[] => [{ type: 'text', value }]

/** Localizes GFM footnote chrome to the article's language and keeps the back arrow out of emoji presentation. */
export default function rehypeFootnotes() {
	return (tree: Root, file: VFile) => {
		const frontmatter = (file.data.astro as { frontmatter?: { lang?: Locale } } | undefined)?.frontmatter
		const i18n = t(frontmatter?.lang ?? fileLocale(file) ?? defaultLocale)

		walk(tree, (el) => {
			if (el.properties.id === 'footnote-label') {
				el.children = text(i18n.footnotes)
			} else if (el.properties.dataFootnoteBackref !== undefined) {
				const ref = String(el.properties.ariaLabel ?? '').match(/\d[\d-]*$/)?.[0] ?? ''
				el.properties.ariaLabel = i18n.footnoteBack(ref)
				el.children = el.children.map((child) =>
					child.type === 'text' ? { ...child, value: child.value.replace(/\u21A9(?!\uFE0E)/g, FOOTNOTE_BACK_TEXT) } : child,
				)
			}
		})
	}
}
