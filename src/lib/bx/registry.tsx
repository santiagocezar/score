import { ComponentType, ComponentProps, FC, createContext, useRef, ReactNode, useContext, useState } from 'react';
import { Record as RuntypeRecord, Runtype, Static } from 'runtypes';
import { BoardStorage, FieldGroup, FacetValue, Player, PlayerID, } from '.';
import { Json } from './facet';


const BoardContext = createContext<[board: BoardStorage<any, any>, name: string] | undefined>(undefined);
export const useAnyBoard = () => {
    const ctx = useContext(BoardContext);
    if (ctx === undefined)
        throw TypeError('useBoard called outside a BoardContext');
    return ctx[0];
};

type Settings = Runtype;


interface BoardGame
    <
    F extends FieldGroup,
    G extends FieldGroup = {},
    P extends Settings = Settings,
    > {
    id: {};
    name: string;
    settings: P;
    view: ComponentType<Static<P>>;
    globalFacets?: G;
    facets: F;
}

interface BXProviderProps<P extends Settings> {
    useSavedMatch?: string;
    settings: Static<P>;
}

function createBXProvider<P extends Settings>(bg: BoardGame<any, any, P>) {
    const { id, name, facets, globalFacets, view: View } = bg;
    const bgp: FC<BXProviderProps<P>> =
        ({ useSavedMatch, settings }) => {
            const game = useRef<BoardStorage<any, any>>();
            if (game.current === undefined) {
                const g = new BoardStorage(facets, globalFacets);

                if (useSavedMatch !== undefined) {
                    const match = useSavedMatch;
                    const item = localStorage.getItem(useSavedMatch);
                    if (item) {
                        g.loadJSON(JSON.parse(item));
                    }
                    function save() {
                        localStorage.setItem(match, JSON.stringify(g.dumpJSON()));
                    }
                    g.onPlayersUpdate.use(save);
                    g.onGlobalUpdate.use(save);
                    g.onFacetUpdate.use(save);
                };

                game.current = g;
            }



            return (
                <BoardContext.Provider value={[game.current, name]}>
                    {/*@ts-expect-error*/}
                    <View {...settings} />
                </BoardContext.Provider>
            );
        };
    return bgp;
}

type Registry<B extends BoardGames> = {
    [K in keyof B]: B[K] extends BoardGame<any, any, infer P>
    ? FC<BXProviderProps<P>>
    : never
};

type BoardGames = Record<string, BoardGame<any, any, any>>;

export function createGame<F extends FieldGroup, G extends FieldGroup, P extends Settings>
    (boardGame: Omit<BoardGame<F, G, P>, 'id'>): BoardGame<F, G, P> {
    return {
        ...boardGame,
        id: {}
    };
}

interface BoardGameHooks<F extends FieldGroup, G extends FieldGroup> {
    useBoard(): BoardStorage<F, G>;
    usePlayers(): Player<F>[];
    usePlayer(pid: PlayerID): Player<F> | undefined;
    useGlobal<K extends keyof G>(facet: K): FacetValue<G[K]>;
    useFacet<K extends keyof F>(pid: PlayerID, facet: K): FacetValue<F[K]> | undefined;
}


export function gameHooks<F extends FieldGroup, G extends FieldGroup>(bg: BoardGame<F, G, any>): BoardGameHooks<F, G> {
    const hooks: BoardGameHooks<F, G> = {
        useBoard() {
            const ctx = useContext(BoardContext);
            if (ctx === undefined)
                throw TypeError('useBoard called outside a BoardContext');
            const [storage, name] = ctx;
            if (name !== bg.name)
                throw TypeError(`called ${bg.name}'s useBoard for ${name}`);
            return storage as BoardStorage<F, G>;
        },
        usePlayers() {
            const board = hooks.useBoard();

            const updatePlayers = () => (
                board
                    .sortedIDs
                    .value
                    .map(id => board.get(id))
                    .filter((p): p is Player<F> =>
                        p !== undefined)
            );

            const [players, setPlayers] = useState(updatePlayers);


            board.onPlayersUpdate.use(() => setPlayers(updatePlayers()));
            board.onFacetUpdate.use(() => setPlayers(updatePlayers()));

            return players;
        },
        usePlayer(pid) {
            const board = hooks.useBoard();
            const [player, setPlayer] = useState(board.get(pid));

            const listener = (id: PlayerID) => {
                if (id == pid) {
                    setPlayer(board.get(pid));
                }
            };

            board.onFacetUpdate.use(listener);
            board.onPlayersUpdate.use(listener);

            return player;
        },
        useGlobal(facetKey) {
            const board = hooks.useBoard();
            const [facet, setFacet] = useState(board.globals.value[facetKey]);

            board.onGlobalUpdate.use((facet) => {
                if (facet == facetKey) {
                    setFacet(board.globals.value[facetKey]);
                }
            });
            return facet;
        },
        useFacet(pid, facetKey) {
            const board = hooks.useBoard();
            const [facet, setFacet] = useState(board.get(pid)?.facets?.[facetKey]);

            board.onFacetUpdate.use((id, facet) => {
                if (id == pid && facet == facetKey) {
                    setFacet(board.get(pid)?.facets?.[facetKey]);
                }
            });

            board.onPlayersUpdate.use((id) => {
                if (id == pid) {
                    setFacet(board.get(pid)?.facets?.[facetKey]);
                }
            });
            return facet;
        }
    };
    return hooks;
};

export function registerGames<B extends BoardGames>(boardGames: B): Registry<B> {
    const incompleteRegistry: Partial<Registry<B>> = {};

    for (const name in boardGames) {
        const bg = boardGames[name];
        const provider = createBXProvider(bg);
        //@ts-expect-error
        incompleteRegistry[name] = provider;
    }

    return incompleteRegistry as Registry<B>;
}