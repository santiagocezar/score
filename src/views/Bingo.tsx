import React, { ReactNode, useState } from 'react';
import styled, { css } from 'styled-components';
import { Header } from 'components/Header';
import { range } from 'lib/utils';
import { Set } from 'immutable';

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
    background-color: #0002;
    color: #000;
    border-radius: 4px;
    transition: color 0.4s, background-color 0.4s, transform ease 0.4s;

    ${(p) =>
        p.played &&
        css`
            background-color: #4169e144;
            color: #4169e1;
            transform: rotateY(360deg);
        `}
    ${(p) =>
        p.new &&
        css`
            background-color: #4169e1;
            color: #fff;
            transform: rotateY(360deg);
        `}
`;

const NUMBERS = range(90, 1);

export default function Bingo() {
    const [played, setPlayed] = useState(Set<number>());
    const [newNum, setNewNum] = useState(0);

    function reset() {
        setPlayed(played.clear());
        setNewNum(0);
    }
    function random() {
        let available = NUMBERS.filter((n) => !played.has(n));
        let n = available[Math.floor(Math.random() * available.length)];
        setPlayed(played.add(n));
        setNewNum(n);
    }

    return (
        <div className="_MP">
            <Header>
                <a
                    href="#"
                    about="Reiniciar"
                    className="material-icons"
                    onClick={reset}
                >
                    restore_page
                </a>
                <a
                    href="#"
                    about="Número"
                    className="material-icons"
                    onClick={random}
                >
                    casino
                </a>
            </Header>
            <NumberGrid>
                {NUMBERS.map((n) => (
                    <Num new={n == newNum} played={played.has(n)} key={n}>
                        {('0' + n).slice(-2)}
                    </Num>
                ))}
            </NumberGrid>
        </div>
    );
}
