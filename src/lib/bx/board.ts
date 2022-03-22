import produce, { castDraft, Draft } from 'immer';
import { Emitter } from 'lib/emitter';
import { useState } from 'react';
import { Facets, FieldGroup, buildFacets } from '.';
import { checkFacets, facetsToJson, Json } from './facet';
import * as rt from 'runtypes';

export type PlayerID = number;
const PlayerID = rt.Number;


export type Player<F extends FieldGroup> = {
    pid: PlayerID,
    name: string;
    avatar?: string;
    palette: number;
    facets: Facets<F>;
};

const Player = rt.Record({
    pid: PlayerID,
    name: rt.String,
    palette: rt.Number,
    facets: rt.Dictionary(rt.Unknown, rt.String),
});

type AddPlayer<F extends FieldGroup> = Omit<Player<F>, 'pid' | 'facets'>;

export const GameData = rt.Record({
    players: rt.Array(Player),
    globals: rt.Dictionary(rt.Unknown, rt.String),
});
export type GameData = rt.Static<typeof GameData>;

interface Producer<T> {
    value: Readonly<T>;
    produce(producer: (draft: Draft<T>) => void): void;
}

function producer<T>(value: T): Producer<T> {
    const self: Producer<T> = {
        value,
        produce(producer) {
            self.value = produce(self.value, producer);
        }
    };
    return self;
};

function uncastDraft<T>(draft: Draft<T>): T {
    return draft as T;
}

export class BoardStorage<F extends FieldGroup, G extends FieldGroup> {

    onPlayersUpdate = new Emitter<[pid: PlayerID]>();
    onGlobalUpdate = new Emitter<[facet: keyof G]>();
    onFacetUpdate = new Emitter<[pid: PlayerID, facet: keyof F]>();

    increasingID = 0;
    sortedIDs = producer(new Array<PlayerID>());
    players = producer(new Map<PlayerID, Player<F>>());

    facets: F;
    globalDeclarations: G;
    globals: Producer<Facets<G>>;

    constructor(facetBuilders: F, globalFacetBuilders: G) {
        this.facets = facetBuilders;
        this.globalDeclarations = globalFacetBuilders;
        this.globals = producer(buildFacets(globalFacetBuilders));
    }

    loadData(data: GameData) {
        this.globals.value = checkFacets(data.globals, this.globalDeclarations);
        for (const player of data.players) {
            console.dir(player);
            const { pid, name, palette, facets: untypedFacets } = player;
            this.increasingID = Math.max(this.increasingID, pid + 1);
            const facets = checkFacets(untypedFacets, this.facets);
            this.players.produce(draft => {
                draft.set(pid, {
                    pid,
                    name,
                    palette,
                    facets: castDraft(facets),
                });
            });
            this.sortedIDs.produce(draft => {
                if (!draft.includes(pid))
                    draft.push(pid);
            });
        }
        this.sortedIDs.produce(draft => {
            draft.sort();
        });
    }

    dumpData(): GameData {
        const players = this.sortedIDs.value.map(pid => {
            const { facets, ...player }: any = this.players.value.get(pid)!;
            player.facets = facetsToJson(facets, this.facets);
            return player;
        });

        const globals = facetsToJson(this.globals.value, this.globalDeclarations);

        return {
            globals,
            players,
        };
    }

    add(player: AddPlayer<F>) {
        const pid = this.increasingID++;
        this.players.produce(draft => {
            draft.set(pid, {
                pid,
                facets: castDraft(buildFacets(this.facets)),
                ...player
            });
        });
        this.sortedIDs.produce(draft => {
            draft.push(pid);
        });
        this.onPlayersUpdate.emit(pid);
        return pid;
    }

    set<K extends keyof F>(pid: PlayerID, facet: K, value: Facets<F>[K] | ((draft: Facets<F>[K]) => void)): boolean {
        if (this.players.value.has(pid)) {
            this.players.produce(draft => {
                const player = draft.get(pid)!;
                const facets = uncastDraft(player.facets);
                if (value instanceof Function) {
                    const f = facets[facet];
                    value(f);
                    facets[facet] = f;
                } else {
                    facets[facet] = value;
                }
            });
            this.onFacetUpdate.emit(pid, facet);
            return true;
        } else {
            console.warn(`called set for non-existing pid: ${pid}`);
            return false;
        }
    }

    globalSet<K extends keyof G>(facet: K, value: Facets<G>[K] | ((draft: Facets<G>[K]) => void)) {
        this.globals.produce(draft => {
            const facets = uncastDraft(draft);
            if (value instanceof Function) {
                const f = facets[facet];
                value(f);
                facets[facet] = f;
            } else {
                facets[facet] = value;
            }
        });
        this.onGlobalUpdate.emit(facet);
    }

    get(pid: PlayerID) {
        return this.players.value.get(pid);
    }

    remove(id: PlayerID) {
        this.players.produce(draft => {
            draft.delete(id);
        });
        const idx = this.sortedIDs.value.findIndex(v => v == id);
        if (idx >= 0) {
            this.sortedIDs.produce(draft => {
                draft.splice(idx, 1);
            });
        }
        this.onPlayersUpdate.emit(id);
    }
}
