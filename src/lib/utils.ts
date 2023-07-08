import { DependencyList, useEffect, useMemo, useState } from 'react';
import { isLight } from './color';
import { CSS } from './theme';
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => { };

export function saveString(name: string, text: string) {
    const el = document.createElement('a');
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
    const inp = document.createElement('input');
    inp.setAttribute('type', 'file');
    inp.style.display = 'none';
    inp.addEventListener(
        'change',
        (e) => {
            const file = (<HTMLInputElement>e.target).files?.[0];
            if (!file) {
                callback(null);
                return;
            }
            const r = new FileReader();
            r.onload = (e) => {
                const c = e.target?.result?.toString();
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
    return [...Array(Math.floor(size)).keys()].map((i) => i + startAt);
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
    listener: (this: T, evt: EventMap<T>[K] & Event) => unknown,
    options?: boolean | AddEventListenerOptions
): void {
    useEffect(() => {
        //@ts-expect-error trust me bro
        target.addEventListener(type, listener, options);
        return () => {
            //@ts-expect-error here too
            target.removeEventListener(type, listener, options);
        };
    }, [listener]);
}

export const tuple = <T extends [...unknown[]]>(...args: T): T => args;

export function hasOwnProperty<X, Y extends PropertyKey>
    (obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function useContrastingColor(color: string) {
    return useMemo(() => {
        return isLight(color) ? 'black' : 'white';
    }, [color]);
}

export function useContrastingPair(color: string, invert = false) {
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
}

export function listPlayers(list: string[], maxPlayers = 5): string {
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

export function useLocalStorage<T extends z.ZodTypeAny>(key: string, type: T): [z.infer<T> | undefined, (value: z.infer<T>) => void];
export function useLocalStorage<T extends z.ZodTypeAny>(key: string, type: T, initialValue: z.infer<T>): [z.infer<T>, (value: z.infer<T>) => void];
export function useLocalStorage<T extends z.ZodTypeAny>(key: string, type: T, initialValue?: z.infer<T>): [z.infer<T> | undefined, (value: z.infer<T>) => void] {
    const [storedValue, setStoredValue] = useState<z.infer<T> | undefined>(() => {
        try {
            // Get from local storage by key
            const item = localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? type.parse(JSON.parse(item)) : initialValue;
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
            if (type.parse(value))
                setStoredValue(value);
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: z.infer<T>) => {
        try {
            // Allow value to be a function so we have same API as useStateparse
            // Save state
            setStoredValue(value);
            // Save to local storage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(value));
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
