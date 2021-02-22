import React, { ReactNode, useEffect, useReducer, useState } from 'react';
import styled, { css } from 'styled-components';
import { Header } from 'components/Header';
import { range, useEvent } from 'lib/utils';
import { Set } from 'immutable';
import StyledBall from 'components/Ball';
import Dialog, { Action } from 'components/Dialogs';
import { Icon, InlineIcon } from 'components/Commons';
import TextBody from 'components/TextBody';

const NumberGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    flex-grow: 1;
    padding: 4px;
    gap: 4px;
    align-self: stretch;
    grid-template-rows: repeat(9, 1fr);
`;

const Num = styled.span<{ new?: boolean; played?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Nova Mono', monospace;
    font-size: 24px;
    background-color: #fff0;
    color: #000;
    border-radius: 4px;
    box-sizing: border-box;
    border: 2px solid #0002;
    transition: color 0.4s, border-color 0.4s, background-color 0.4s,
        transform ease 0.4s;

    ${(p) =>
        p.played &&
        css`
            background-color: #4169e144;
            border-color: #4169e144;
            color: #4169e1;
            transform: rotateY(360deg);
        `}
    ${(p) =>
        p.new &&
        css`
            background-color: #4169e1;
            border-color: #4169e1;
            color: #fff;
            transform: rotateY(360deg);
        `}
`;

const Warranty = styled.div`
    padding: 16px;
    max-width: 512px;
`;

const NUMBERS = range(90, 1);

export default function Bingo() {
    const [played, setPlayed] = useState(Set<number>());
    const [newNum, setNewNum] = useState(0);
    const [showBall, setShowBall] = useState(false);
    const [preventDoubleClick, setPDC] = useState(false);
    const [showingHelp, setShowingHelp] = useState(false);
    const [showingConfirm, setShowingConfirm] = useState(false);

    /// This is for resetting the ball animation
    useEffect(() => {
        if (!showBall && newNum != 0) {
            setShowBall(true);
        }
    }, [newNum]);

    useEffect(() => {
        if (preventDoubleClick) {
            setTimeout(() => {
                setPDC(false);
            }, 500);
        }
    }, [preventDoubleClick]);

    useEvent(document, 'keypress', (e) => {
        if (e.code == 'Space') {
            random();
            e.preventDefault();
        }
    });

    const hideBall = () => setShowBall(false);

    function reset() {
        setPlayed(played.clear());
        setShowingConfirm(false);
        setNewNum(0);
    }
    function random() {
        if (!preventDoubleClick) {
            let available = NUMBERS.filter((n) => !played.has(n));
            let n = available[Math.floor(Math.random() * available.length)];
            setPlayed(played.add(n));
            /// Hide ball first because function is sometimes not batched
            setShowBall(false);
            setNewNum(n);
            setPDC(true);
        }
    }

    console.log(showingHelp);

    return (
        <div className="_MP">
            {showBall && <StyledBall>{newNum}</StyledBall>}
            <Header mode="bingo">
                <a about="Ayuda" onClick={(e) => setShowingHelp(true)}>
                    <Icon name="info" />
                </a>
                <a about="Reiniciar" onClick={() => setShowingConfirm(true)}>
                    <Icon name="restore_page" />
                </a>
                <a about="Número" onClick={random}>
                    <Icon name="casino" />
                </a>
            </Header>
            <NumberGrid onTouchEnd={random}>
                {NUMBERS.map((n) => (
                    <Num new={n == newNum} played={played.has(n)} key={n}>
                        {('0' + n).slice(-2)}
                    </Num>
                ))}
            </NumberGrid>
            <Dialog
                open={showingConfirm}
                onClosed={() => setShowingConfirm(false)}
                title="Confirmar"
            >
                <TextBody style={{ maxWidth: '512px', padding: '16px' }}>
                    Seguro que quiere empezar de nuevo?
                </TextBody>
                <Action name="Si" do={reset} />
                <Action
                    name="No"
                    do={() => setShowingConfirm(false)}
                    highlight
                />
            </Dialog>
            <Dialog
                open={showingHelp}
                onClosed={() => setShowingHelp(false)}
                title="Ayuda"
            >
                <TextBody style={{ maxWidth: '512px', padding: '16px' }}>
                    <h2 id="modo-bingo">Instrucciones</h2>
                    <p>
                        Para sortear un número haga clic en
                        <InlineIcon name="casino" />, presione la tecla espacio
                        o toque la grilla (solo en teléfonos).
                    </p>
                    <p>
                        Para empezar de nuevo haga clic en{' '}
                        <InlineIcon name="restore_page" />
                    </p>
                    <h2 id="condiciones-de-uso">Condiciones de Uso</h2>
                    <p>
                        Desarrollo de carácter educativo.{' '}
                        <strong>
                            No se permite el uso para fines lucrativos.
                        </strong>{' '}
                        Sin ninguna garantía para un propósito en particular.
                    </p>
                </TextBody>
            </Dialog>
        </div>
    );
}
