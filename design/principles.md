# Principles

## 1. Content first

A reader arrives with a question, not with patience for the interface. The first thing on a writing page is the writing. The archive starts with the first entry; the article starts with the title; the shelf starts with the covers.

There is no introduction block, no hero, no "featured" carousel, and no card that explains what the page is. The site header already says whose site it is, and the navigation already says where you are.

## 2. The layout explains

Labels and descriptions are a cost. If a rule, a gap or a type size can carry the meaning, it should. The date column explains the date, the rule explains the row, the cover explains the book.

When a label is genuinely needed — a series pager, an input label, a table header — keep it short and let it do a job. Do not add a second line that repeats the first.

## 3. Hairlines, not boxes

A 1px rule separates without containing. Content is not wrapped in a card. Surfaces are used for code, notices and form furniture, where a boundary is functional; shadows are reserved for things that float, such as menus and the demo controls.

The page is held together by a grid of rules: the row rules in the archive, the header rule in the article, the top rule on the series pager, the field border.

## 4. Mono structure, serif reading

Newsreader is the reading voice: article titles, ledes, body, entry titles and excerpts, book titles. IBM Plex Mono is the apparatus: dates, labels, navigation, numbers and code. The two are deliberately different, and that difference is the page.

There is no reader-facing reading-mode switch. The page has one reading voice. Chinese and Japanese always use the proportional reading stack, because mono Latin leaves awkward gaps around Han characters.

## 5. One accent, earned

Electric blue is a signal. It marks links, focus, the current navigation item, the current section in the edge index, and primary actions. It does not mark emphasis, decoration or a whole surface.

If a page needs more than a handful of accent marks, the hierarchy is wrong.

## 6. Quiet motion

Motion explains a change: a color, a border, a disclosure, a menu. It is 120ms for state, 180ms for a menu, 260ms for an overlay. Content does not fade in on scroll; the article has no entrance animation.

When `prefers-reduced-motion` is set, durations collapse and the page transition disappears.

## 7. Read the room

The article is one 78ch column at 22px with air around it. The margin is not a place to put a second interface.

On a wide screen the only thing at the edge is the contents index: a stack of ticks that stays invisible until reached for. On a narrow screen it is gone; the headings are the index.

Chinese and Japanese change the type values — size, leading, tracking, measure — but not the layout rules. The page should feel like the same page in every language.
