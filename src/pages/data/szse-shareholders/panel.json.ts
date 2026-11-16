import type { APIRoute } from 'astro'
import { buildSzseClientPayload, buildSzseModel } from '../../../lib/shareholders/szse'
import { loadSzseRows } from '../../../lib/shareholders/szse-parse'

/** The Shenzhen rows for the table, off the page so the initial HTML stays small. */
export const GET: APIRoute = () => {
  const payload = buildSzseClientPayload(buildSzseModel(loadSzseRows()))

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
