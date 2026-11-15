import type { APIRoute } from 'astro'
import { buildClientPayload } from '../../../lib/shareholders/client-data'
import { buildPanelModel } from '../../../lib/shareholders/model'
import { loadPanelRows } from '../../../lib/shareholders/parse'

/**
 * The stock rows for the search instrument, off the page so the initial HTML stays
 * small. Built once from the vendored CSV; the deploy serves it as a static file.
 */
export const GET: APIRoute = () => {
  const payload = buildClientPayload(buildPanelModel(loadPanelRows()))

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
