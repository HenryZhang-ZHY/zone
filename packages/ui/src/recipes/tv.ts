import { createTV } from 'tailwind-variants'
import { twMergeConfig } from './merge-config'

/** The component recipe factory, with the Zone type scale registered. */
export const tv = createTV({ twMergeConfig })
