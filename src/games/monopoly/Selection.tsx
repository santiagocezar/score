import { createContext, Dispatch, FC, SetStateAction, useContext, useMemo, useState } from 'react';
import { PlayerID } from 'lib/bx';

type SetState<T> = Dispatch<SetStateAction<T>>;

interface SelectionContext {
    from: PlayerID | null;
    setFrom: SetState<PlayerID | null>;
    to: PlayerID | null;
    setTo: SetState<PlayerID | null>;
    withProperty: number | null;
    setWithProperty: SetState<number | null>;
    defaultValue: number;
    setDefaultValue: SetState<number>;
}

const SelectionContext = createContext<SelectionContext>({
    from: null,
    setFrom() { },
    to: null,
    setTo() { },
    withProperty: null,
    setWithProperty() { },
    defaultValue: 0,
    setDefaultValue() { },
});

export const SelectionProvider: FC = ({ children }) => {
    const [from, setFrom] = useState<PlayerID | null>(null);
    const [to, setTo] = useState<PlayerID | null>(null);
    const [withProperty, setWithProperty] = useState<number | null>(0);
    const [defaultValue, setDefaultValue] = useState<number>(0);

    const value = useMemo<SelectionContext>(() => ({
        from, setFrom,
        to, setTo,
        withProperty, setWithProperty,
        defaultValue, setDefaultValue,
    }), [from, to, withProperty, defaultValue]);

    return <SelectionContext.Provider {...{ value }}>
        {children}
    </SelectionContext.Provider>;
};

interface UseSelection extends SelectionContext {
    clickPlayer(pid: PlayerID): void;
    clear(): void;
}

export function useSelection(): UseSelection {
    const value = useContext(SelectionContext);

    return {
        ...value,
        clickPlayer(pid) {
            if (pid === value.from) {
                value.setFrom(null);
            } else if (pid === value.to) {
                value.setTo(null);
            } else if (value.from !== null) {
                value.setTo(pid);
            } else {
                value.setFrom(pid);
            }
        },
        clear() {
            value.setFrom(null);
            value.setTo(null);
            value.setWithProperty(null);
            value.setDefaultValue(0);
        }
    };
}
