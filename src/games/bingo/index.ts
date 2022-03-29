import { createGame, createField, gameHooks } from 'lib/bx';
import { z } from 'zod';
import { BingoView } from './View';

export const Bingo = createGame({
    name: 'Bingo',
    view: BingoView,
    settings: z.object({}),
    globalFacets: {
        played: createField(
            z.array(z.number()).transform((arr) => new Set(arr)),
            () => new Set(),
            (value) => [...value]
        )
    },
    facets: {}
});

export const bingo = gameHooks(Bingo);