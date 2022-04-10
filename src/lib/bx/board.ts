import produce, { castDraft, Draft } from 'immer';
import { Emitter } from 'lib/emitter';
import { useState } from 'react';
import { Facets, FieldGroup, buildFacets } from '.';
import { checkFacets, facetsToJson, Json } from './facet';
import { z } from "zod";

export type PlayerID = number;
const PlayerID = z.number();


export type Player<F extends FieldGroup> = {
    pid: PlayerID,
    name: string;
    avatar?: string;
    palette: number;
    fields: Facets<F>;
};

const Player = z.object({
    pid: PlayerID,
    name: z.string(),
    palette: z.number(),
    fields: z.record(z.unknown()),
});

type AddPlayer<F extends FieldGroup> = Omit<Player<F>, 'pid' | 'fields'>;

export const GameData = z.object({
    players: z.array(Player),
    globals: z.record(z.unknown()),
});
export type GameData = z.infer<typeof GameData>;

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

    fields: F;
    globalDeclarations: G;
    globals: Producer<Facets<G>>;

    constructor(facetBuilders: F, globalFacetBuilders: G) {
        this.fields = facetBuilders;
        this.globalDeclarations = globalFacetBuilders;
        this.globals = producer(buildFacets(globalFacetBuilders));
    }

    loadData(data: GameData) {
        this.globals.value = checkFacets(data.globals, this.globalDeclarations);
        for (const player of data.players) {
            console.dir(player);
            const { pid, name, palette, fields: untypedFields } = player;
            this.increasingID = Math.max(this.increasingID, pid + 1);
            const fields = checkFacets(untypedFields, this.fields);
            this.players.produce(draft => {
                draft.set(pid, {
                    pid,
                    name,
                    palette,
                    fields: castDraft(fields),
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
            const { fields, ...player }: any = this.players.value.get(pid)!;
            player.fields = facetsToJson(fields, this.fields);
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
                fields: castDraft(buildFacets(this.fields)),
                ...player
            });
        });
        this.sortedIDs.produce(draft => {
            draft.push(pid);
        });
        this.onPlayersUpdate.emit(pid);
        return pid;
    }

    set(pid: PlayerID, updater: ((draft: Draft<Facets<F>>) => void)): boolean {
        if (this.players.value.has(pid)) {
            const prevFields = this.players.value.get(pid)!.fields;
            this.players.produce(draft => {
                const player = draft.get(pid)!;
                updater(player.fields);
            });
            const currFields = this.players.value.get(pid)!.fields;
            if (prevFields !== currFields) {
                for (const key in prevFields) {
                    if (prevFields[key] !== currFields[key]) {
                        console.log(`key "${key}" was updated`);
                        this.onFacetUpdate.emit(pid, key);
                    }
                }
            }
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
