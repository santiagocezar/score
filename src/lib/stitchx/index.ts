import type { CSS } from '@stitches/react';
import Stitches from '@stitches/react/types/stitches';
import { createUseBreakpoint, UseBreakpoint } from './breakpoint';
import { createTransitions, Transitions } from './transition';
export type { default as Stitches } from '@stitches/react/types/stitches';

export type CSSForStitches<C extends Stitches['config']> = CSS<C>;
/*
interface StitchX<S extends Stitches> {
    useBreakpoint: UseBreakpoint<S>;
    transitions: Transitions<S>;
}
*/

export type SomeStitches = Pick<Stitches, 'config' | 'css'>;

export function extendStitches<S extends SomeStitches>(stitches: S) {
    return {
        useBreakpoint: createUseBreakpoint<S['config']['media']>(stitches.config.media),
        transitions: createTransitions(stitches),
    };
}