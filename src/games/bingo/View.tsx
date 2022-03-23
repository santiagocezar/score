import React, { ComponentProps, FC, memo, ReactNode, useEffect, useReducer, useState } from 'react';
import { Header } from 'components/Header';
import { range, useEvent } from 'lib/utils';
import { Dialog, DialogClose } from 'components/Dialog';
import { useImmer } from 'use-immer';
import MdCasino from '~icons/ic/baseline-casino';
import MdRestorePage from '~icons/ic/baseline-restore-page';
import { styled, keyframes } from 'lib/theme';
import { Button, ButtonGroup } from 'components/Button';
import { Content } from 'components/panels';
import { bingo } from '.';

const NumberGrid = styled('div', {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    flexGrow: '1',
    gap: '.25rem',
    alignSelf: 'stretch',
    gridTemplateRows: 'repeat(9, 1fr)',
});

const ballIn = keyframes({
    '0%': {
        transform: 'translate(-50%, -100vh) scale(1)',
    },
    '100%': {
        transform: 'translate(-50%, -50%) scale(1)',
    }
});

const ballOut = keyframes({
    '0%': {
        transform: 'translate(-50%, -50%) scale(1)',
    },
    '100%': {
        transform: 'translate(-50%, -50%) scale(0)',
    }
});

const StyledBall = styled('div', {
    display: 'block',
    width: '8rem',
    height: '8rem',
    fontFamily: '$body',
    fontSize: '40px',
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: '99',
    borderRadius: '128px',
    animation: `${ballIn} 0.5s cubic-bezier(0.5, 1.5, 0.5, 1), ${ballOut} 1s cubic-bezier(0.5, -0.5, 1, 0.5) 2s`,
    animationFillMode: 'forwards',

    textDecoration: 'underline',
    boxShadow: '0 0 32px #0008',
    backgroundColor: 'white',
    border: '1rem solid $red400',
    padding: '.25rem',
    'p': {
        display: 'flex',
        width: '100%',
        height: '100%',
        borderRadius: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        border: '.25rem solid $red400',
    }
});

const StyledSquare = styled('span', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '$body',
    fontSize: '1.5rem',
    borderRadius: '.5rem',
    border: '.125rem solid transparent',
    backgroundColor: '$bg300',
    transition: `
        color 0.4s, border-color 0.4s, 
        background-color 0.4s, 
        transform ease 0.4s
    `,

    variants: {
        state: {
            played: {
                backgroundColor: '$blue100',
                borderColor: '$blue300',
                color: '$blue800',
                transform: 'rotateY(360deg)',
            },
            new: {
                backgroundColor: '$yellow400',
                borderColor: '$yellow500',
                color: '$yellow900',
                transform: 'rotateY(360deg)',
            }
        }
    }
});

enum SquareState {
    New, Played, None
}

interface SquareProps {
    number: number,
    state: ComponentProps<typeof StyledSquare>['state'],
}
const Square = memo<SquareProps>(({ number, state }) => (
    <StyledSquare state={state}>
        {('0' + number).slice(-2)}
    </StyledSquare>
));

const Warranty = styled('div', {
    padding: '16px',
    maxWidth: '512px',
});

const BingoContent = styled('div', {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '.5rem',
    padding: '.5rem',
    '@lg': {
        padding: '1rem',
    }
});

const NUMBERS = range(90, 1);

export const BingoView: FC = () => {
    const board = bingo.useBoard();
    const played = bingo.useGlobal('played');
    const [newNum, setNewNum] = useState(-1);
    const [showingConfirm, setShowingConfirm] = useState(false);

    useEvent(document, 'keypress', (e) => {
        if (e.code == 'Space') {
            random();
            e.preventDefault();
        }
    });

    function reset() {
        board.globalSet('played', draft => {
            draft.clear();
        });
        setShowingConfirm(false);
        setNewNum(-1);
    }
    function random() {
        if (NUMBERS.length !== played.size) {
            let available = NUMBERS.filter((n) => !played.has(n));
            let n = available[Math.floor(Math.random() * available.length)];
            board.globalSet('played', draft => {
                draft.add(n);
            });

            setNewNum(n);
        }
    }
    return (
        <Content>
            <BingoContent>
                {newNum !== -1 && <StyledBall key={newNum}>
                    <p>
                        {newNum}
                    </p>
                </StyledBall>}
                <ButtonGroup>
                    <Button onClick={() => setShowingConfirm(true)}>Reiniciar</Button>
                    <Button onClick={random}>Sacar un número</Button>
                </ButtonGroup>
                <NumberGrid onTouchEnd={random}>
                    {NUMBERS.map((n) => (
                        <Square number={n} state={n == newNum ? 'new' : played.has(n) ? 'played' : undefined} key={n} />
                    ))}
                </NumberGrid>
                <Dialog
                    open={showingConfirm}
                    onOpenChange={setShowingConfirm}
                    titlebar="Confirmar"
                >
                    <p>
                        Seguro que quiere empezar de nuevo?
                    </p>
                    <br />
                    <ButtonGroup>
                        <DialogClose asChild>
                            <Button>Cancelar</Button>
                        </DialogClose>
                        <Button color="red" onClick={reset}>Reiniciar</Button>
                    </ButtonGroup>
                </Dialog>
            </BingoContent>
        </Content>
    );
};
