import type { SuggestionInput } from '../i18n/match'

export interface LanguageNoteConfig {
	current: string
	available: string[]
	supported: string[]
	cookie: string
	/** Every available locale except the current one, ready to link. */
	links: Record<string, { href: string; name: string; label: string }>
}

/**
 * Runs as a synchronous inline script immediately after the note, so the reader's
 * preferred version is in the link before first paint. It only swaps the link the
 * server rendered; it never creates, appends or reorders a message.
 */
export function mountLanguageNote(config: LanguageNoteConfig, suggest: (input: SuggestionInput) => string | undefined) {
	const script = document.currentScript
	if (!script) return

	const note = script.previousElementSibling
	if (!note) return
	const link = note.querySelector<HTMLAnchorElement>('[data-language-target]')
	if (!link) return

	const saved = document.cookie
		.split(';')
		.map((part) => part.trim().split('='))
		.find(([key]) => key === config.cookie)?.[1]
	const target = suggest({ saved, languages: navigator.languages ?? [navigator.language], current: config.current, available: config.available, supported: config.supported })

	// Keep query and hash on the version the server rendered, even when no
	// preferred target is found.
	const base = link.getAttribute('href') ?? link.href
	if (!target || target === config.current) {
		link.setAttribute('href', base + location.search + location.hash)
		return
	}

	const info = config.links[target]
	if (!info) return

	link.href = info.href + location.search + location.hash
	link.hreflang = target
	link.dataset.locale = target
	link.setAttribute('aria-label', info.label)

	const name = link.querySelector<HTMLElement>('[data-language-name]')
	if (name) {
		name.textContent = info.name
		name.lang = target
	}

	// A same-language article keeps the note hidden until the reader prefers
	// another version. Revealing it also tightens the page top, before paint.
	if (note.hasAttribute('hidden')) {
		note.removeAttribute('hidden')
		const main = note.closest('main')
		if (main) {
			main.classList.remove('pt-page-top')
			main.classList.add('pt-10')
		}
	}
}
