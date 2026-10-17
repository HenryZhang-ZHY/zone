import { LOCALE_COOKIE, localizePath, negotiateLocale } from '../i18n/locales'

interface Env {
	ASSETS: { fetch(request: Request): Promise<Response> }
}

export const readCookie = (header: string | null, name: string) =>
	header
		?.split(';')
		.map((part) => part.trim().split('='))
		.find(([key]) => key === name)?.[1]

/**
 * Runs only for `/` (see `run_worker_first` in wrangler.jsonc): sends each reader to
 * the language they picked before, or to the best match for their browser.
 * Everything else is served straight from the static build.
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)
		if (url.pathname !== '/') return env.ASSETS.fetch(request)

		const headers = request.headers
		const locale = negotiateLocale(headers.get('Accept-Language'), readCookie(headers.get('Cookie'), LOCALE_COOKIE))
		return new Response(null, {
			status: 302,
			headers: {
				Location: `${localizePath('/', locale)}${url.search}`,
				Vary: 'Accept-Language, Cookie',
				'Cache-Control': 'private, no-store',
			},
		})
	},
}
