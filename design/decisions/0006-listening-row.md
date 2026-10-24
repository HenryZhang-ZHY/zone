# 0006 — The listening row is a channel, a title and the lines worth keeping

- Status: accepted
- Date: 2026-10-24
- Related: [0002](./0002-serif-reading-voice.md), [0005](./0005-footer-sitemap.md)
- Partly supersedes: 0005's "one row for two logs"

## Context

The listening page was six links with a picture. Nobody kept an episode for its title: the page exists because one line in a recording was worth writing down, and the design had nowhere to put it — the first attempt pasted a small comment card under the title, the only filled box on a site of white paper and hairlines, which made one row three times taller than its neighbours and read as something borrowed from another product.

Two things turned out to be true about those lines. They are not always quotations: sometimes the line is the site's own recommendation, with no timestamp at all. And there is rarely just one.

The share-the-row arrangement from 0005 also stopped paying. Reading is a date and a title in a 5.5rem lead column; listening needed a 56px cover, a line above the title and a block below it. The only thing left in common was the hairline.

The sketch work is on the `listening-layout` artboard (`.ryugi/artifacts/artboard/listening-layout`), rounds 1–3.

## Decision

1. **Two rows, not one.** `RecordRow` keeps the reading list: date lead, serif title, the domain it points at, arrow. `EpisodeRow` is the listening row: 56px channel cover, a channel line, the title, then the lines.
2. **The channel leads.** `小马宋商业观察 · 小宇宙 ↗` at `label-11` mono above the title, arrow included. The channel is what tells one row from the next; the platform alone says nothing, and the arrow belongs on the line that already names where the link goes.
3. **The cover is 56px.** At 40px it is a smudge (four characters of 面基 in 40px are four grey marks); at 64px every row grows another 12px and the seventh episode leaves the first screen. It is the channel's cover, not the episode's artwork.
4. **The kept lines are text first.** Under the title, indented to it, outside the link. `copy-16` in `ink-secondary`; the time, when there is one, trails the last line in `label-11` mono: `…遵循原则就能导向成功。 00:12`. No fill, no rule, no timestamp column, no label. A line without a time is the site's own voice.
5. **A row keeps a list of lines.** `notes: [{ text, at? }]` in `podcast.yaml`, stacked with a 12px gap in one block. A word joiner holds the time on the last line so it never starts one of its own.

## Consequences

- The listening row is taller than it was (92px with a 56px cover, plus the kept lines) and the page is now a list of what was worth keeping rather than a list of links. A page of titles would look over-built; this one has one annotated episode out of seven, and the annotation is the reason the page exists.
- A kept line is not in the link. Clicking the words does nothing; they can be selected and copied, which is what they are for. The focus ring covers the cover, the channel and the title — what Enter activates.
- A recommendation and a timestamped quotation look identical until you read for the time. If that distinction has to be seen at a glance, it needs a mark; that is an open question, not a decision.
- A short last line happens when a line ends near the measure: the word joiner moves a word or two down with the time rather than letting the time float alone. This is the price of keeping the mark in the sentence.
- `podcast.yaml` grows `notes` and loses `ogAudio`/`ogImage`; the episode's own artwork and audio URL are gone, since the row never draws one and there is no player.
- The demo at `/demos/listening/` shows the two kinds of line: one excerpt with a time, one recommendation without.
