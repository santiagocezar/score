import { DraftFunction, useImmer } from "use-immer";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { castDraft } from 'immer';
import { Emitter } from 'lib/emitter';
import { createFacet, Facet, FacetPool, FacetTuple, FacetValue, Json, FacetTuplePartial, OrUndefined, FacetTupleValues } from './facet';
import { tuple } from 'lib/utils';
import { JsonMap } from '.';

export type PlayerID = number | null;

export type PlayerInfo = {
    id: PlayerID,
    name: string;
    avatar?: string;
    color: string;
};

export const PlayerInfo = createFacet<PlayerInfo>('info', () => ({
    id: null,
    name: 'null!',
    color: '#000'
}));

export class BoardStorage {
    lastID = 0;
    index = new Map<PlayerID, FacetPool>();
    ids = new Array<PlayerID>();

    removeEvent = new Emitter<[id: PlayerID]>();
    updateEvent = new Emitter<[id: PlayerID, data: Facet<any, Json>]>();
    addEvent = new Emitter<[id: PlayerID]>();

    create(): PlayerID {
        const pid = this.lastID++;
        this.index.set(pid, new Map());
        this.ids.push(pid);
        this.addEvent.emit(pid);
        return pid;
    }

    add(player: Omit<PlayerInfo, 'id'>) {
        const pid = this.create();
        this.set(pid, PlayerInfo, {
            id: pid,
            ...player,
        });
        return pid;
    }

    set<D extends Facet<any, any>>(pid: PlayerID, data: D, value?: FacetValue<D> | ((value: FacetValue<D>) => void)): boolean {
        if (this.index.has(pid)) {
            const player = this.index.get(pid)!;
            if (value instanceof Function) {
                const draft = player.get(data.id) ?? data.default();
                value(draft);
                player.set(data.id, draft);
            } else {
                player.set(data.id, value ?? data.default());
            }
            this.updateEvent.emit(pid, data);
            return true;
        } else {
            console.warn(`called set for non-existing pid: ${pid}`);
            return false;
        }
    }
    unset<D extends Facet<any, any>>(pid: PlayerID, data: D): boolean {
        if (this.index.has(pid)) {
            this.index.get(pid)!.delete(data.id);
            this.updateEvent.emit(pid, data);
            return true;
        } else {
            return false;
        }
    }

    get<Ds extends FacetTuple>
        (id: PlayerID, ...deps: Ds): FacetTuplePartial<Ds> {
        if (this.index.has(id)) {
            const singled = deps.map(data => (
                this.index.get(id)!.get(data.id)
            )) as FacetTuplePartial<Ds>;
            return singled;
        } else {
            const singled = deps.map(_ => undefined) as unknown as FacetTuplePartial<Ds>;
            return singled;
        }
    }

    remove(id: PlayerID) {
        this.removeEvent.emit(id);
        this.index.delete(id);
        const idx = this.ids.findIndex(v => v == id);
        if (idx >= 0) {
            this.ids.splice(idx);
        }
    }

    map<W extends FacetTuple, R>(fn: (id: PlayerID, ...args: FacetTupleValues<W>) => R, ...using: W): R[] {
        const mapped: R[] = [];
        for (const pid of this.ids) {
            const values = this.get(pid, ...using);
            if (values.every(v => v !== undefined))
                mapped.push(fn(pid, ...(values as FacetTupleValues<W>)));
        }
        return mapped;
    }

    // mapDefault<Ds extends FacetTuple, R>
    //     (fn: (id: PlayerID, ...args: FacetTupleValues<Ds>) => R, ...deps: Ds): R[] {
    //     return this.ids.map(id => {
    //         return fn(id, ...this.getDefault(id, ...deps));
    //     });
    // }

    load<Ds extends FacetTuple>(saved: JsonMap, ...using: Ds) {
        let mapNameToFacet: Record<string, Ds[number] | undefined> = {};

        for (const d of using) {
            mapNameToFacet[d.name] = d;
        }

        for (const playerKey of Object.keys(saved)) {
            const player = saved[playerKey];
            if (player !== null && typeof player === 'object' && !Array.isArray(player)) {
                const pid = Number(playerKey);
                if (!isNaN(pid)) {
                    const facets = new FacetPool();
                    for (const facetName of Object.keys(player)) {
                        const facet = mapNameToFacet[facetName];
                        if (facet) {
                            const facetValue = player[facetName];
                            const deserializedValue = facet.des(facetValue);
                            facets.set(facet.id, deserializedValue);
                        }
                    }
                    this.index.set(pid, facets);
                }
            }
        }
    }
    dump<Ds extends FacetTuple>(...using: Ds): Json {
        let dump: Record<number, any> = {};

        for (const pid of this.index.keys()) {
            const player = this.index.get(pid);
            if (pid !== null && player) {
                let data: Record<string, any> = {};

                for (const dep of using) {
                    data[dep.name] = dep.ser(player.get(dep.id));
                }
                dump[pid] = data;
            }
        }
        return dump;
    }

    /* Convenience hooks */

    usePlayer<W extends FacetTuple>(pid: PlayerID, ...data: W) {
        const [values, setValues] = useState(this.get(pid, ...data));

        this.updateEvent.use((updatedPID, updatedData) => {
            if (pid === updatedPID) {
                const idx = data.findIndex(d => d.id === updatedData.id);
                if (idx >= 0) setValues(this.get(pid, ...data));
            }
        }, []);

        return values;
    };

    mustUsePlayer<W extends FacetTuple>(pid: PlayerID, ...using: W) {
        const values = this.usePlayer(pid, ...using);
        return useMemo(() => {
            return values.map(v => {
                if (v === undefined)
                    throw new Error(`player id: ${pid} doesn't exist`);
                return v;
            }) as FacetTupleValues<W>;
        }, [values]);
    };
    usePlayerDefault<W extends FacetTuple>(pid: PlayerID, ...using: W) {
        const values = this.usePlayer(pid, ...using);
        return useMemo(() => {
            return values.map((v, i) => {
                if (v === undefined)
                    return using[i].default();
                return v;
            }) as FacetTupleValues<W>;
        }, [values]);
    };

    useMap<W extends FacetTuple>(...using: W) {
        const [list, setList] = useImmer(
            () => this.ids.map(pid => tuple(pid, ...this.get(pid, ...using)))
        );

        this.updateEvent.use((updatedPID, updatedData) => {
            const isDataInteresting = using.findIndex(d => d.id === updatedData.id) >= 0;
            setList(list => {
                const index = list.findIndex(([id]) => id === updatedPID);
                console.log('updateEvent:', { isDataInteresting, index, updatedPID });
                if (isDataInteresting && index >= 0) {
                    const values = this.get(updatedPID, ...using);
                    list[index] = castDraft(tuple(updatedPID, ...values));
                }
            });
        }, [list]);

        this.removeEvent.use((removedPID) => {
            setList(list => {
                const index = list.findIndex(([id]) => id === removedPID);
                console.log('removeEvent:', { index, removedPID });
                if (index >= 0) {
                    list.splice(index, 1);
                }
            });
        }, [list]);
        this.addEvent.use((addedPID) => {
            console.log('addEvent:', { addedPID });
            setList(list => {
                list.push(castDraft(tuple(addedPID, ...this.get(addedPID, ...using))));
            });
        }, []);

        return list;
    };

    useIDs() {
        const [ids, setIDs] = useImmer(() => [...this.ids]);

        this.removeEvent.use((removedPID) => {
            const index = ids.findIndex(id => id === removedPID);
            if (index >= 0) {
                setIDs(ids => {
                    ids.splice(index, 1);
                });
            }
        }, [ids]);
        this.addEvent.use((addedPID) => {
            setIDs(ids => {
                ids.push(addedPID);
            });
        }, []);

        return ids;
    };
}

export interface BoardExtension<Settings extends JsonMap> {
    board: BoardStorage;
    settings: Settings;
}
