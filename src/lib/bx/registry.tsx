import { ComponentType, ComponentProps, FC, createContext, useRef, ReactNode, useContext, useState } from 'react';
import * as rt from 'runtypes';
import { BoardStorage, FieldGroup, FacetValue, Player, PlayerID, } from '.';
import { GameData } from './board';
import { Json } from './facet';
import { nanoid } from 'nanoid';
import { hasOwnProperty } from 'lib/utils';


const BoardContext = createContext<[board: BoardStorage<any, any>, name: string] | undefined>(undefined);
export const useAnyBoard = () => {
    const ctx = useContext(BoardContext);
    if (ctx === undefined)
        throw TypeError('useBoard called outside a BoardContext');
    return ctx[0];
};

type Settings = rt.Runtype;


interface BoardGame
    <
    F extends FieldGroup = FieldGroup,
    G extends FieldGroup = FieldGroup,
    P extends Settings = Settings,
    > {
    name: string;
    settings: P;
    view: ComponentType<rt.Static<P>>;
    globalFacets?: G;
    facets?: F;
}


type BoardGames = Record<string, BoardGame<any, any, any>>;

export function createGame<F extends FieldGroup, G extends FieldGroup, P extends Settings>
    (boardGame: Omit<BoardGame<F, G, P>, 'id'>): BoardGame<F, G, P> {
    return {
        ...boardGame,
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
            const [facet, setFacet] = useState(board.get(pid)?.fields?.[facetKey]);

            board.onFacetUpdate.use((id, facet) => {
                if (id == pid && facet == facetKey) {
                    setFacet(board.get(pid)?.fields?.[facetKey]);
                }
            });

            board.onPlayersUpdate.use((id) => {
                if (id == pid) {
                    setFacet(board.get(pid)?.fields?.[facetKey]);
                }
            });
            return facet;
        }
    };
    return hooks;
};


export const MatchData = rt.Record({
    id: rt.String,
    settings: rt.Unknown,
    name: rt.String,
    game: GameData,
});

export type MatchData<S extends Settings = Settings> =
    & Omit<rt.Static<typeof MatchData>, 'settings'>
    & { settings: rt.Static<S>; };

function createMatch<S extends Settings>({ name, globalFacets = {} }: BoardGame, settings: rt.Static<S>) {
    const id = nanoid();
    const globals: any = {};
    for (const global in globalFacets) {
        if (hasOwnProperty(globalFacets, global)) {
            globals[global] = globalFacets[global].new();
        }
    }

    const match: MatchData<S> = {
        id,
        settings,
        name,
        game: {
            globals,
            players: []
        }
    };

    localStorage.setItem(id, JSON.stringify(match));

    return id;
}

function loadMatch<S extends Settings>(matchID: string, bgs: BoardGames): [MatchData<S>?, BoardGame?] {
    const item = localStorage.getItem(matchID);

    if (item) {
        const match = MatchData.check(JSON.parse(item));
        if (hasOwnProperty(bgs, match.name)) {
            const bg = bgs[match.name] as BoardGame;
            match.settings = bg.settings.check(match.settings);
            return [match, bg];
        }
    }
    return [];
}

function useGameInstance(bg: BoardGame, match: MatchData) {
    const game = useRef<BoardStorage<any, any>>();

    if (game.current === undefined) {
        const g = new BoardStorage(bg.facets ?? {}, bg.globalFacets ?? {});

        g.loadData(match.game);
        function save() {
            match.game = g.dumpData();

            localStorage.setItem(match.id, JSON.stringify(match));
        }
        g.onPlayersUpdate.use(save);
        g.onGlobalUpdate.use(save);
        g.onFacetUpdate.use(save);

        game.current = g;
    }

    return game.current;
}

interface GameProviderProps {
    match: MatchData;
    bg: BoardGame;
}

const GameProvider: FC<GameProviderProps> = ({ match, bg }) => {
    const game = useGameInstance(bg, match);
    const View = bg.view;
    const settings = match.settings;
    return (
        <BoardContext.Provider value={[game, bg.name]}>
            {/*@ts-expect-error*/}
            <View {...settings} />
        </BoardContext.Provider>
    );
};

interface MatchProviderProps {
    matchID: string;
}

function createMatchProvider(bgs: BoardGames) {
    const MatchProvider: FC<MatchProviderProps> =
        ({ matchID }) => {
            const [match, bg] = loadMatch(matchID, bgs);

            return match && bg
                ? <GameProvider match={match} bg={bg} />
                : null;
        };
    return MatchProvider;
}


interface GameRegistry<B extends BoardGames> {
    MatchProvider: FC<MatchProviderProps>;
    newMatch<G extends keyof B>(game: G, settings: rt.Static<B[G]['settings']>): string;
    games: B,
}

export function registerGames<B extends BoardGames>(boardGames: B): GameRegistry<B> {
    for (const name in boardGames) {
        const bg = boardGames[name];
        if (bg.name !== name) {
            console.warn(`game ${name} has .name: "${bg.name}"`);
        }
        bg.name = name;
    }

    return {
        MatchProvider: createMatchProvider(boardGames),
        newMatch(game, settings) {
            return createMatch(boardGames[game], settings);
        },
        games: boardGames,
    };
}