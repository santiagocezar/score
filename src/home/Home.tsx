import React, { useCallback, useMemo, useState } from 'react';
import { Route, BrowserRouter as Router, Switch, useLocation, useHistory } from 'react-router-dom';
import { GameCard, Modes } from './GameCard';
// import ScoreSheet from 'views/ScoreSheet';
import TextBody from 'components/TextBody';
import Usage from 'views/Usage';
//import BankProvider from 'lib/bankContext';
import { MatchProvider, newMatch } from 'games';
// import BankSocket from 'lib/bankSockets';

import scoreURL from 'res/score.svg';
import { Header } from 'components/Header';
import { Title2 } from 'components/Title';
import { styled } from 'lib/theme';
import { Content } from 'components/panels';
import * as rt from 'runtypes';
import produce from 'immer';

const SC = () => (
    <a
        href="https://scez.ar"
        style={{ textDecoration: 'none', color: 'unset' }}
    >
        <span style={{ color: '#ff4294' }}>scez</span>
        <span style={{ color: '#898bcb' }}>.</span>
        <span style={{ color: '#18d1ff' }}>ar</span>
    </a>
);

const HomeContent = styled('div', {
    padding: '.5rem',
    width: '100%',
    maxWidth: '40rem',
    marginX: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    '*': {
        flexShrink: 0,
    },
    '@lg': {
        padding: '1rem',
    }
});

const Logo = styled('img', {
    height: '4rem',
});

const MatchList = rt.Array(
    rt.Record({
        id: rt.String,
        mode: rt.String,
        name: rt.String,
    })
);

export const Home = () => {
    const [matches,] = useState(() => {
        const item = JSON.parse(localStorage.getItem('matches') ?? '[]');
        if (MatchList.guard(item)) {
            return item;
        } else {
            return [];
        }
    });

    const history = useHistory();

    const goToMatch = useCallback((id: string) => history.push({
        pathname: '/match/' + id
    }), [history]);

    const nm: typeof newMatch = (game, settings) => {
        const id = newMatch(game, settings);
        const newMatches = produce(matches, draft => {
            draft.splice(0, 0, {
                id,
                mode: game,
                name: new Date(Date.now()).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
            });
        });
        localStorage.setItem('matches', JSON.stringify(newMatches));
        goToMatch(id);

        return id;
    };

    const matchElements = useMemo(() => (
        matches.map(({ id, mode, name }) => (
            <GameCard
                name={name}
                mode={mode as Modes}
                onClick={() => goToMatch(id)}
                description=""
            />
        ))
    ), [matches]);

    return (
        <HomeContent>
            <Logo
                src={scoreURL}
                alt="Score"
            />
            {matchElements.length && <>
                <Title2>Partidas recientes</Title2>
                {matchElements}
            </>}
            <Title2>Nueva partida</Title2>
            <GameCard
                name="Monopolio"
                mode="Monopoly"
                onClick={() => nm('Monopoly', { defaultMoney: 1500 })}
                description="Para juegos en donde hay un banco 
                             y cada jugador tiene su propio dinero. 
                             Acepta transferencias y rankings"
            />
            <GameCard
                name="Cartas"
                mode="Cards"
                onClick={() => nm('Cards', { defaultMoney: 1500 })}
                description="Planilla de puntaje tradicional. 
                            Recomendada para juegos de cartas"
            />
            <GameCard
                name="Bingo"
                mode="Bingo"
                onClick={() => nm('Bingo', { defaultMoney: 1500 })}
                description="Herramienta para elegir números
                            aleatorios para el bingo, sin repetir."
            />
            <Usage />
        </HomeContent>
    );
};
