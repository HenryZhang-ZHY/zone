export interface SeriesPostLike {
	id: string
	data: {
		title: string
		series?: { id: string }
		seriesOrder?: number
	}
}

export interface SeriesNav<T extends SeriesPostLike> {
	posts: T[]
	position: number
	total: number
	prev?: T
	next?: T
}

export function getSeriesPosts<T extends SeriesPostLike>(posts: T[], seriesId: string): T[] {
	const members = posts
		.filter((post) => post.data.series?.id === seriesId)
		.sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0))

	for (let i = 1; i < members.length; i++) {
		if (members[i].data.seriesOrder === members[i - 1].data.seriesOrder) {
			throw new Error(
				`Series "${seriesId}" has duplicate seriesOrder ${members[i].data.seriesOrder}: "${members[i - 1].id}" and "${members[i].id}"`,
			)
		}
	}

	return members
}

export function getSeriesNav<T extends SeriesPostLike>(posts: T[], post: T): SeriesNav<T> | undefined {
	const seriesId = post.data.series?.id
	if (!seriesId) return undefined

	const members = getSeriesPosts(posts, seriesId)
	const index = members.findIndex((member) => member.id === post.id)
	if (index === -1) return undefined

	return {
		posts: members,
		position: index + 1,
		total: members.length,
		prev: members[index - 1],
		next: members[index + 1],
	}
}
