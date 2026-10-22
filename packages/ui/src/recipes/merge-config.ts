/*
 * tailwind-merge cannot know the design system's custom type scale: it sees
 * `text-heading-40` and `text-ink` as two colors and drops one. Teach it which
 * `text-*` utilities are font sizes before any component merges classes.
 */
export const typeSizes = [
  'display-64',
  'display-48',
  'heading-40',
  'heading-32',
  'heading-28',
  'heading-24',
  'heading-20',
  'heading-18',
  'heading-16',
  'heading-14',
  'lede-20',
  'lede-24',
  'copy-18',
  'reading-22',
  'copy-16',
  'copy-14',
  'copy-13',
  'label-16',
  'label-14',
  'label-13',
  'label-12',
  'label-11',
  'button-14',
  'button-13',
  'button-12',
] as const

export const twMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [{ text: [...typeSizes] }],
    },
  },
}
