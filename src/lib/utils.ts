import { useEffect, useRef } from 'react';

export interface Player {
    name: string;
    score: number;
    prevScore: number[];
}

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

export function useEvent<
    K extends keyof DocumentEventMap,
    C extends (this: Document, ev: DocumentEventMap[K]) => any
>(type: K, listener: C, options?: boolean | AddEventListenerOptions): void {
    useEffect(() => {
        document.addEventListener(type, listener, options);
        return () => {
            document.removeEventListener(type, listener, options);
        };
    }, [listener]);
}
