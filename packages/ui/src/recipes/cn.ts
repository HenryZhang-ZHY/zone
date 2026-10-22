import { extendTailwindMerge } from 'tailwind-merge'
import { twMergeConfig } from './merge-config'

const merge = extendTailwindMerge(twMergeConfig)

/** Merge component classes with a caller's overrides, last one wins. */
export function cn(...inputs: Array<string | undefined | null | false>): string {
  return merge(inputs.filter(Boolean).join(' '))
}
