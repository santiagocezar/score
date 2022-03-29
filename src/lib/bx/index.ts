import { Player } from './board';
import { BoardGameHooks } from './registry';

export * from './board';
export * from './registry';
export * from './facet';

export type PlayerFor<B extends BoardGameHooks<any, any>> =
    B extends BoardGameHooks<infer F, any>
    ? Player<F>
    : never;