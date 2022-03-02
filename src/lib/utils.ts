import { useEffect, useRef } from 'react';

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
export function loadString(callback: (text: string) => void) {
    let inp = document.createElement('input');
    inp.setAttribute('type', 'file');
    inp.style.display = 'none';
    inp.addEventListener(
        'change',
        (e) => {
            let file = (<HTMLInputElement>e.target).files[0];
            if (!file) {
                callback(null);
            }
            let r = new FileReader();
            r.onload = (e) => {
                let c = e.target.result.toString();
                callback(c);
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
