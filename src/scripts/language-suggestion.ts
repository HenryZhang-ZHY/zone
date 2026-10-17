import type { SuggestionInput } from '../i18n/match'

export interface SuggestionConfig {
	current: string
	available: string[]
	supported: string[]
	cookie: string
	storageKey: string
	/** `banner`: a dismissible notice of its own. `notice`: a line inside the page's existing notice. */
	mode: 'banner' | 'notice'
	/** Per suggestible language: the page in it, and the suggestion written in it. */
	links: Record<string, { href: string; text: string; action: string; dismiss: string }>
}

/**
 * Runs as a synchronous inline script where the suggestion belongs, so the notice is
 * in place before first paint and nothing shifts. Self-contained: it is serialized
 * with `suggest` into the page (see LanguageSuggestion.astro).
 */
export function mountLanguageSuggestion(config: SuggestionConfig, suggest: (input: SuggestionInput) => string | undefined) {
	const script = document.currentScript
	if (!script) return

	const saved = document.cookie
		.split(';')
		.map((part) => part.trim().split('='))
		.find(([key]) => key === config.cookie)?.[1]
	const target = suggest({ saved, languages: navigator.languages ?? [navigator.language], current: config.current, available: config.available, supported: config.supported })
	if (!target) return

	// Inside an existing notice, list the reader's version first.
	const version = script.parentElement?.querySelector(`[data-version="${target}"]`)
	version?.parentElement?.prepend(version)

	let dismissed = false
	try {
		dismissed = localStorage.getItem(config.storageKey) === 'dismissed'
	} catch {
		// Storage blocked: keep suggesting.
	}
	if (dismissed) return

	const link = config.links[target]
	const line = document.createElement('p')
	line.lang = target
	const anchor = document.createElement('a')
	anchor.href = link.href + location.search + location.hash
	anchor.hreflang = target
	anchor.dataset.locale = target
	anchor.textContent = link.action
	line.append(`${link.text} `, anchor)

	if (config.mode === 'notice') {
		script.before(line)
		return
	}

	const shell = document.createElement('aside')
	shell.className = 'z-notice-shell'
	shell.lang = target
	const box = document.createElement('div')
	box.className = 'z-notice'
	const close = document.createElement('button')
	close.type = 'button'
	close.className = 'z-notice-dismiss'
	close.setAttribute('aria-label', link.dismiss)
	close.textContent = '×'
	close.addEventListener('click', () => {
		try {
			localStorage.setItem(config.storageKey, 'dismissed')
		} catch {
			// Storage blocked: dismiss for this page only.
		}
		shell.remove()
	})
	box.append(line, close)
	shell.append(box)
	script.before(shell)
}
