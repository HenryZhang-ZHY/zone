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
	anchor.className = 'text-accent underline decoration-accent/40 underline-offset-[0.25em] hover:decoration-current'
	anchor.textContent = link.action
	line.append(`${link.text} `, anchor)

	if (config.mode === 'notice') {
		script.before(line)
		return
	}

	const shell = document.createElement('aside')
	shell.className = 'shell pt-4'
	shell.lang = target
	const frame = document.createElement('div')
  frame.className = 'mx-auto max-w-reading'
  const box = document.createElement('div')
	box.className = 'flex items-start gap-4 border-l-2 border-line-strong bg-surface px-4 py-3 font-ui text-copy-13 text-ink-secondary'
	const close = document.createElement('button')
	close.type = 'button'
	close.className = 'ml-auto shrink-0 text-label-16 leading-none text-ink-tertiary transition-colors duration-1 hover:text-ink'
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
	frame.append(box)
  shell.append(frame)
	script.before(shell)
}
