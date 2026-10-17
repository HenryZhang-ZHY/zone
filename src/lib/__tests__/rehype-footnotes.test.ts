import { describe, expect, it } from 'vitest'
import type { Element, Root } from 'hast'
import { VFile } from 'vfile'
import rehypeFootnotes, { FOOTNOTE_BACK_TEXT } from '../rehype-footnotes'

const footnoteTree = (): Root => ({
	type: 'root',
	children: [
		{
			type: 'element',
			tagName: 'section',
			properties: { dataFootnotes: true },
			children: [
				{ type: 'element', tagName: 'h2', properties: { id: 'footnote-label' }, children: [{ type: 'text', value: 'Footnotes' }] },
				{
					type: 'element',
					tagName: 'a',
					properties: { dataFootnoteBackref: '', ariaLabel: 'Back to reference 1-2' },
					children: [
						{ type: 'text', value: '↩' },
						{ type: 'element', tagName: 'sup', properties: {}, children: [{ type: 'text', value: '2' }] },
					],
				},
			],
		},
	],
})

const run = (lang?: string, path = '/site/src/content/blog/post/index.md') => {
	const tree = footnoteTree()
	rehypeFootnotes()(tree, new VFile({ path, data: { astro: { frontmatter: lang ? { lang } : {} } } }))
	const section = tree.children[0] as Element
	return { label: section.children[0] as Element, backref: section.children[1] as Element }
}

describe('rehypeFootnotes', () => {
	it('keeps English labels and forces a text-style back arrow', () => {
		const { label, backref } = run()
		expect(label.children).toEqual([{ type: 'text', value: 'Footnotes' }])
		expect(backref.properties.ariaLabel).toBe('Back to reference 1-2')
		expect(backref.children[0]).toEqual({ type: 'text', value: FOOTNOTE_BACK_TEXT })
		expect((backref.children[1] as Element).tagName).toBe('sup')
	})

	it('localizes labels for Chinese articles', () => {
		const { label, backref } = run('zh-Hans')
		expect(label.children).toEqual([{ type: 'text', value: '脚注' }])
		expect(backref.properties.ariaLabel).toBe('返回引用 1-2')
		expect(backref.children[0]).toEqual({ type: 'text', value: FOOTNOTE_BACK_TEXT })
	})

	it('takes the language of a translation from its file name', () => {
		const { label, backref } = run(undefined, '/site/src/content/blog/post/ja.md')
		expect(label.children).toEqual([{ type: 'text', value: '脚注' }])
		expect(backref.properties.ariaLabel).toBe('参照 1-2 に戻る')
	})
})
