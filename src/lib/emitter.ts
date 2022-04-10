import { DependencyList, useEffect, useRef, useState } from 'react';

export class Emitter<A extends (readonly unknown[]) = []> {
    subscribers = new Set<(...args: A) => void>();

    emit(...args: A) {
        this.subscribers.forEach(fn => fn(...args));
    }

    do(fn: (...args: A) => void) {
        this.subscribers.add(fn);
    }

    dont(fn: (...args: A) => void) {
        this.subscribers.delete(fn);
    }

    use<R>(fn: (...args: A) => R, deps?: DependencyList) {
        const [ret, setRet] = useState<R>();
        useEffect(() => {
            const wrapped = (...args: A) => setRet(fn(...args));
            this.do(wrapped);
            return () => this.dont(wrapped);
        }, deps);
        return ret!;
    }
}

export function useEmitter<A extends (readonly unknown[]) = []>() {
    const emitter = useRef(new Emitter<A>());
    return emitter.current;
}
