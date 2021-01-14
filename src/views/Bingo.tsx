import React, { ReactNode, useEffect, useReducer, useState } from 'react';
import styled, { css } from 'styled-components';
import { Header } from 'components/Header';
import { range, useEvent } from 'lib/utils';
import { Set } from 'immutable';
import StyledBall from 'components/Ball';
import Dialog from 'components/Dialogs';
import { Icon } from 'components/Commons';

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
    const [showingWarranty, setShowingWarranty] = useState(false);

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

    useEvent('keypress', (e) => {
        if (e.code == 'Space') {
            random();
            e.preventDefault();
        }
    });

    const hideBall = () => setShowBall(false);

    function reset() {
        setPlayed(played.clear());
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

    console.log(showingWarranty);

    return (
        <div className="_MP">
            {showBall && <StyledBall>{newNum}</StyledBall>}
            <Header mode="bingo">
                <a
                    about="Condiciones"
                    onClick={(e) => setShowingWarranty(true)}
                >
                    <Icon name="info" />
                </a>
                <a about="Reiniciar" onClick={reset}>
                    <Icon name="restore_page" />
                </a>
                <a about="Número" onClick={random}>
                    <Icon name="casino" />
                </a>
            </Header>
            <NumberGrid>
                {NUMBERS.map((n) => (
                    <Num new={n == newNum} played={played.has(n)} key={n}>
                        {('0' + n).slice(-2)}
                    </Num>
                ))}
            </NumberGrid>
            <Dialog
                open={showingWarranty}
                onClosed={() => setShowingWarranty(false)}
                title="Aviso de garantía"
            >
                <Warranty>
                    <p>
                        Desarrollo de carácter educativo.{' '}
                        <strong>
                            No se permite el uso para fines lucrativos.
                        </strong>{' '}
                        Sin ninguna garantía para un propósito en particular.
                    </p>
                </Warranty>
            </Dialog>
        </div>
    );
}
