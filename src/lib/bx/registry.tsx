import { ComponentType, FC, createContext, useRef, useContext, useState, useCallback, useEffect } from 'react';
import { z } from "zod";
import { BoardStorage, FieldGroup, FieldInfer, Player, PlayerID, } from '.';
import { GameData } from './board';
import { nanoid } from 'nanoid';
import { hasOwnProperty } from 'lib/utils';


const BoardContext = createContext<[board: BoardStorage<any, any>, name: string] | undefined>(undefined);
export const useAnyBoard = () => {
    const ctx = useContext(BoardContext);
    if (ctx === undefined)
        throw TypeError('useBoard called outside a BoardContext');
    return ctx[0];
};

type Settings = z.ZodTypeAny;


interface BoardGame
    <
        F extends FieldGroup = FieldGroup,
        G extends FieldGroup = FieldGroup,
        P extends Settings = Settings,
    > {
    name: string;
    settings: P;
    view: ComponentType<z.infer<P>>;
    globals?: G;
    fields?: F;
}


type BoardGames = Record<string, BoardGame<any, any, any>>;

export function createGame<F extends FieldGroup, G extends FieldGroup, P extends Settings>
    (boardGame: Omit<BoardGame<F, G, P>, 'id'>): BoardGame<F, G, P> {
    return {
        ...boardGame,
    };
}

export interface BoardGameHooks<F extends FieldGroup, G extends FieldGroup> {
    useBoard(): BoardStorage<F, G>;
    usePlayers(): Player<F>[];
    usePlayer(pid: PlayerID): Player<F> | undefined;
    useGlobal<K extends keyof G>(facet: K): FieldInfer<G[K]>;
    useFacet<K extends keyof F>(pid: PlayerID, facet: K): FieldInfer<F[K]> | undefined;
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

            const listener = useCallback((id: PlayerID) => {
                console.dir({ id, pid });
                if (id == pid) {
                    setPlayer(board.get(pid));
                }
            }, [pid]);

            useEffect(() => {
                setPlayer(board.get(pid));
            }, [pid]);

            board.onFacetUpdate.use(listener, [listener]);
            board.onPlayersUpdate.use(listener, [listener]);

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
}


export const MatchData = z.object({
    id: z.string(),
    settings: z.unknown(),
    name: z.string(),
    game: GameData,
});

export type MatchData<S extends Settings = Settings> =
    & Omit<z.infer<typeof MatchData>, 'settings'>
    & { settings: z.infer<S>; };

function createMatch<S extends Settings>({ name, globals: globalFacets = {} }: BoardGame, settings: z.infer<S>) {
    const id = nanoid();
    const globals: any = {};
    for (const global in globalFacets) {
        if (hasOwnProperty(globalFacets, global)) {
            globals[global] = globalFacets[global].def();
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
        const match = MatchData.parse(JSON.parse(item));
        if (hasOwnProperty(bgs, match.name)) {
            const bg = bgs[match.name] as BoardGame;
            match.settings = bg.settings.parse(match.settings);
            return [match as MatchData<S>, bg];
        }
    }
    return [];
}

function useGameInstance(bg: BoardGame, match: MatchData) {
    const game = useRef<BoardStorage<any, any>>();
    const autoSaveTaskID = useRef<number>(-1);
    const g = new BoardStorage(bg.fields ?? {}, bg.globals ?? {});
    function save() {
        match.game = g.dumpData();

        localStorage.setItem(match.id, JSON.stringify(match));
    }

    function fireAutoSave() {
        clearTimeout(autoSaveTaskID.current)
        autoSaveTaskID.current = setTimeout(() => {
            console.log("saved!")
            save()
        }, 2000)
    }

    if (game.current === undefined) {

        g.loadData(match.game);
        g.onPlayersUpdate.use(fireAutoSave);
        g.onGlobalUpdate.use(fireAutoSave);
        g.onFacetUpdate.use(fireAutoSave);

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
    newMatch<G extends keyof B>(game: G, settings: z.infer<B[G]['settings']>): string;
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