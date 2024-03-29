import { useMediaQuery } from 'react-responsive';
import { Stitches } from '.';

export type UseBreakpoint<M extends Stitches['config']['media']> = (bp: keyof M) => boolean;

export function createUseBreakpoint<M extends Stitches['config']['media']>(media: M) {
    const hook: UseBreakpoint<M> = (bp) => {
        return useMediaQuery({
            //@ts-expect-error no idea why it errors, it should be assignable
            query: media?.[bp] ?? ''
        });
    };
    return hook;
}