import { createContext, PropsWithChildren, ReactNode, useContext, useRef } from "react";
import { JsonMap, BoardExtension, BoardStorage } from '.';

const BoardContext = createContext<BoardExtension<any> | undefined>(undefined);

type BoardProviderProps<S extends JsonMap, X extends BoardExtension<S>> = {
    extension: new () => X;
    children: ReactNode,
    settings: S;
};

export const BoardProvider =
    <S extends JsonMap, X extends BoardExtension<S>>
        ({ extension, children, settings }: BoardProviderProps<S, X>) => {

        const game = useRef<X>();
        if (game.current === undefined) {
            const bx = new extension();
            bx.settings = settings;
            game.current = bx;
        }

        return (
            <BoardContext.Provider value={game.current}>
                {children}
            </BoardContext.Provider>
        );
    };

export function useBoard(): BoardStorage;
export function useBoard<G extends BoardExtension<any>>(game: new (...args: any[]) => G): G;
export function useBoard<G extends BoardExtension<any> = BoardExtension<any>>(inheritedBoard?: new (...args: any[]) => G): G | BoardStorage {
    const context = useContext(BoardContext);
    if (!context)
        throw new Error('useGame called outside an GameContext');
    if (!inheritedBoard)
        return context.board;

    if (context instanceof inheritedBoard)
        return context;

    throw new Error('wrong context type');
}