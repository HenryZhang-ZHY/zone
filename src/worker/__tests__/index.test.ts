import { describe, expect, it } from 'vitest'
import worker, { readCookie } from '../index'

const assets = { fetch: async (request: Request) => new Response(`asset ${new URL(request.url).pathname}`) }

const get = (path: string, headers: Record<string, string> = {}) =>
	worker.fetch(new Request(`https://shuzhi.zone${path}`, { headers }), { ASSETS: assets })

describe('root language redirect', () => {
	it('sends the root to the browser language', async () => {
		const response = await get('/', { 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8' })
		expect(response.status).toBe(302)
		expect(response.headers.get('Location')).toBe('/zh-hans/')
	})

	it('prefers the language the reader picked before', async () => {
		const response = await get('/', { 'Accept-Language': 'en-US', Cookie: 'theme=dark; lang=ja' })
		expect(response.headers.get('Location')).toBe('/ja/')
	})

	it('falls back to English and keeps the query string', async () => {
		const response = await get('/?ref=feed')
		expect(response.headers.get('Location')).toBe('/en/?ref=feed')
	})

	it('is never cached across readers', async () => {
		const response = await get('/')
		expect(response.headers.get('Vary')).toBe('Accept-Language, Cookie')
		expect(response.headers.get('Cache-Control')).toBe('private, no-store')
	})

	it('serves every other path from static assets', async () => {
		expect(await (await get('/ja/blog/refuge/')).text()).toBe('asset /ja/blog/refuge/')
	})
})

describe('readCookie', () => {
	it('finds one cookie among several', () => {
		expect(readCookie('a=1; lang=pt; b=2', 'lang')).toBe('pt')
		expect(readCookie('language=pt', 'lang')).toBeUndefined()
		expect(readCookie(null, 'lang')).toBeUndefined()
	})
})
