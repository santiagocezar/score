import { DependencyList, useEffect, useMemo, useRef, useState } from 'react';
import { isLight } from './color';
import { CSS } from './theme';
import * as rt from 'runtypes';

export function saveString(name: string, text: string) {
    let el = document.createElement('a');
    el.setAttribute(
        'href',
        `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
    );
    el.setAttribute('download', name);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

/**
 * Load a file
 * @param callback A function called with the text inside the file
 */
export function loadString(callback: (text: string | null) => void) {
    let inp = document.createElement('input');
    inp.setAttribute('type', 'file');
    inp.style.display = 'none';
    inp.addEventListener(
        'change',
        (e) => {
            let file = (<HTMLInputElement>e.target).files?.[0];
            if (!file) {
                callback(null);
                return;
            }
            let r = new FileReader();
            r.onload = (e) => {
                let c = e.target?.result?.toString();
                callback(c ?? null);
            };
            r.readAsText(file);
        },
        false
    );

    document.body.appendChild(inp);
    inp.click();
    //document.body.removeChild(inp);

    return '';
}

export function range(size: number, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export type EventMap<T extends EventTarget> = T extends Window
    ? WindowEventMap
    : T extends Document
    ? DocumentEventMap
    : T extends WebSocket
    ? WebSocketEventMap
    : Parameters<T['addEventListener']>[0];

export function useEvent<
    T extends EventTarget,
    K extends keyof EventMap<T> & string
>(
    target: T,
    type: K,
    listener: (this: T, evt: EventMap<T>[K] & Event) => any,
    options?: boolean | AddEventListenerOptions
): void {
    useEffect(() => {
        //@ts-expect-error
        target.addEventListener(type, listener, options);
        return () => {
            //@ts-expect-error
            target.removeEventListener(type, listener, options);
        };
    }, [listener]);
}

export const tuple = <T extends [...any[]]>(...args: T): T => args;

export function hasOwnProperty<X extends {}, Y extends PropertyKey>
    (obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty(prop);
}

export function useContrastingColor(color: string) {
    return useMemo(() => {
        return isLight(color) ? 'black' : 'white';
    }, [color]);
}

export function useContrastingPair(color: string, invert: boolean = false) {
    const text = useContrastingColor(color);
    const css: CSS = useMemo(() => ({
        $$color: invert ? text : color,
        $$text: invert ? color : text,
    }), [color, text]);
    return css;
}

export function plural(word: string, amount: number): string;
export function plural(word: string, suffix: string, amount: number): string;
export function plural(word: string, suffixOrAmount: string | number, maybeAmount?: number): string {
    const [suffix, amount] = typeof suffixOrAmount === 'string'
        ? [suffixOrAmount, maybeAmount!]
        : ['s', suffixOrAmount];

    if (amount === 1) {
        return word;
    } else if (suffix.startsWith('-')) {
        return suffix.slice(1);
    } else {
        return `${word}${suffix}`;
    }
};

export function listPlayers(list: string[], maxPlayers: number = 5): string {
    if (list.length === 0) {
        return "Sin jugadores";
    } else if (list.length === 1) {
        return `Con ${list[0]} solo`;
    } else {
        let res = "Con ";

        // no tiene sentido escribir "y 1 más", que lo muestre y 
        // que empiece de "y 2 más"
        if (maxPlayers + 1 === list.length)
            maxPlayers++;

        for (let i = 0; i < Math.min(list.length, maxPlayers); i++) {
            const prefix = i === 0
                ? ''
                : i === list.length - 1
                    ? ' y '
                    : ', ';
            res += prefix + list[i];
        }
        if (list.length > maxPlayers) {
            res += ` y ${list.length - maxPlayers} más`;
        }
        return res;
    }
}

export function useLocalStorage<T extends rt.Runtype>(key: string, type: T): [rt.Static<T> | undefined, (value: rt.Static<T>) => void];
export function useLocalStorage<T extends rt.Runtype>(key: string, type: T, initialValue: rt.Static<T>): [rt.Static<T>, (value: rt.Static<T>) => void];
export function useLocalStorage<T extends rt.Runtype>(key: string, type: T, initialValue?: rt.Static<T>): [rt.Static<T> | undefined, (value: rt.Static<T>) => void] {
    const [storedValue, setStoredValue] = useState<rt.Static<T> | undefined>(() => {
        try {
            // Get from local storage by key
            const item = localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? type.check(JSON.parse(item)) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.error(error);
            return initialValue;
        }
    });

    useEvent(window, 'storage', () => {
        const item = localStorage.getItem(key);
        if (item !== null) {
            const value = JSON.parse(item);
            if (type.guard(value))
                setStoredValue(value);
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: rt.Static<T>) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

export function useCompareFn<T>(value: T, isEqual: (prev: T, next: T) => boolean, deps?: DependencyList): T {
    const [prev, setPrev] = useState(value);
    useEffect(() => {
        if (!isEqual(prev, value))
            setPrev(value);
    }, deps);

    return prev;
}