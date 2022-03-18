import { useEffect, useMemo, useRef } from 'react';
import { isLight } from './color';
import { CSS } from './theme';

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
        console.log('called color');
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
