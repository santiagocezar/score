import { DraftFunction, useImmer } from "use-immer";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import produce, { castDraft, Draft } from 'immer';
import { Emitter } from 'lib/emitter';
import { tuple } from 'lib/utils';
import { Facets, FacetDeclarations, JsonMap, buildFacets } from '.';

export type PlayerID = number;

export type Player<F extends FacetDeclarations> = {
    pid: PlayerID,
    name: string;
    avatar?: string;
    color: string;
    facets: Facets<F>;
};

type AddPlayer<F extends FacetDeclarations> = Omit<Player<F>, 'pid' | 'facets'>;

export class BoardStorage<F extends FacetDeclarations, G extends FacetDeclarations> {
    facets: F;
    globalFacets: Facets<G>;
    increasingID = 0;
    sortedIDs = new Array<PlayerID>();
    players = new Map<PlayerID, Player<F>>();

    constructor(facetBuilders: F, globalFacetBuilders: G) {
        this.facets = facetBuilders;
        this.globalFacets = buildFacets(globalFacetBuilders);
    }

    anyUpdateEvent = new Emitter<[]>();

    addEvent = new Emitter<[pid: PlayerID]>();
    globalUpdateEvent = new Emitter<[facet: keyof G]>();
    removeEvent = new Emitter<[id: PlayerID]>();
    updateEvent = new Emitter<[id: PlayerID, facet: keyof F]>();

    add(player: AddPlayer<F>) {
        const pid = this.increasingID++;
        this.players = produce(this.players, draft => {
            draft.set(pid, {
                pid,
                facets: castDraft(buildFacets(this.facets)),
                ...player
            });
        });
        this.sortedIDs = produce(this.sortedIDs, draft => {
            draft.push(pid);
        });
        this.addEvent.emit(pid);
        this.anyUpdateEvent.emit();
        return pid;
    }

    set<K extends keyof F>(pid: PlayerID, facet: K, value: Facets<F>[K] | ((draft: Facets<F>[K]) => void)): boolean {
        if (this.players.has(pid)) {
            this.players = produce(this.players, draft => {
                const player = draft.get(pid)!;
                const facets = player.facets as Facets<F>;
                if (value instanceof Function) {
                    const f = facets[facet];
                    value(f);
                    facets[facet] = f;
                } else {
                    facets[facet] = value;
                }
            });
            this.updateEvent.emit(pid, facet);
            return true;
        } else {
            console.warn(`called set for non-existing pid: ${pid}`);
            return false;
        }
    }

    globalSet<K extends keyof G>(facet: K, value: Facets<G>[K] | ((draft: Facets<G>[K]) => void)) {
        this.globalFacets = produce(this.globalFacets, draft => {
            const facets = draft as Facets<G>;
            if (value instanceof Function) {
                const f = facets[facet];
                value(f);
                facets[facet] = f;
            } else {
                facets[facet] = value;
            }
        });
        this.globalUpdateEvent.emit(facet);
    }

    get(pid: PlayerID) {
        return this.players.get(pid);
    }

    remove(id: PlayerID) {
        this.removeEvent.emit(id);
        this.players = produce(this.players, draft => {
            draft.delete(id);
        });
        const idx = this.sortedIDs.findIndex(v => v == id);
        if (idx >= 0) {
            this.sortedIDs = produce(this.sortedIDs, draft => {
                draft.splice(idx, 1);
            });
        }
    }
}
