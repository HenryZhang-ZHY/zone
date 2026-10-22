# 0003 — The reading measure is 78ch at 22px

- Status: accepted
- Date: 2026-10-22
- Related: [0002](./0002-serif-reading-voice.md)

## Context

The previous reading column was 68ch of the UI mono with a 19px serif body. Measured against the serif, that landed at about 80 characters: already at the top of the 45–75 comfort range.

The wider 78ch column at 19px measured about 94 characters, which is over the usual 80-character upper bound. It looked better on a 1440px screen because the block occupied more of the viewport, but the line was too long.

Painting the same width with a larger body changes both variables at once: 78ch at 22px is about 81 characters. It keeps the generous proportions of the wide composition and brings the line back to the upper bound.

## Decision

1. **The reading measure is 78ch** (`--z-layout-reading`, `max-w-reading`). The article, the measure lab and any other long-form reading surface use it.
2. **The serif body is 22px / 1.68** (`reading-22`); the article lede is 24px / 1.55 (`lede-24`). The title stays 40px.
3. **The index measure stays 68ch** (`--z-layout-measure`, `max-w-measure`) for the archive and the listening list. Their type is 16–20px; a 78ch index would outrun its type.
4. **The mobile body is 19px / 1.7** and the lede 21px. The measure stays fluid; the margins shrink.
5. **Full-bleed is for objects, not for prose.** A table, figure or quote can use the 1200px shell in full-bleed mode; the paragraph never widens.
6. **The 78ch / 19px combination is rejected.** It is the anti-example in the measure lab: about 94 characters.

## Consequences

- The article fills more of a large screen and reads at about 81 characters: at the ceiling, not in the 60–70 sweet spot. It is a deliberate compromise between the publication feel and the reading range.
- The body type scale grows: `reading-22` and `lede-24` are new tokens. The type specimens and the Tailwind type utilities include them.
- Archive and listening pages keep their 68ch index measure and their smaller type; the site has two measures, each matched to its content.
- The measure lab at `/demos/measure/` compares the new default, the previous 68ch/19px, full-bleed, and the 78ch/19px anti-example.
- The 22px body is a real change in page texture. It should be judged on a long article, not on a short specimen.
