import { SomeStitches } from '.';
import { } from '@stitches/react';
import { CSSForStitches } from '.';
import { CSSTransition } from 'react-transition-group';
import { TransitionProps } from 'react-transition-group/Transition';
import { ComponentType } from 'react';

export type TransitionsStyle<C extends SomeStitches['config']> = {
    always?: CSSForStitches<C>;
    enterStart: CSSForStitches<C>;
    enterEnd: CSSForStitches<C>;
    exitStart?: CSSForStitches<C>;
    exitEnd?: CSSForStitches<C>;
};

export type TransitionsProps<Ref extends undefined | HTMLElement> = TransitionProps<Ref>;

export function createTransitions<S extends SomeStitches>({ css }: S) {
    const fn = <Ref extends undefined | HTMLElement>(style: TransitionsStyle<S['config']>) => {
        const { enterStart, enterEnd, exitStart = enterEnd, exitEnd = enterStart, always = {} } = style;
        const className = css({
            '&-enter-active, &-exit-active': always,
            '&-enter': enterStart,
            '&-enter-active': enterEnd,
            '&-exit': exitStart,
            '&-exit-active': exitEnd,
        })();

        const component: ComponentType<TransitionsProps<Ref>> = (props) => (
            <CSSTransition
                {...props}
                classNames={className.className}
            />
        );
        component.displayName = "Transition";

        return component;
    };
    return fn;
}
