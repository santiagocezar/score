import { createGame, createFacet, gameHooks } from 'lib/bx';
import { Array, Number, Record } from 'runtypes';
import { BingoView } from './View';

export const Bingo = createGame({
    name: 'Bingo',
    view: BingoView,
    settings: Record({}),
    globalFacets: {
        played: createFacet(Array(Number), () => new Set<number>(), {
            fromJSON: (json) => new Set(json),
            toJSON: (obj) => [...obj]
        })
    },
    facets: {}
});

export const bingo = gameHooks(Bingo);