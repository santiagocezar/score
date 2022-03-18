import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { Card } from 'components/Commons';
// import ScoreSheet from 'views/ScoreSheet';
import Bingo from 'views/Bingo';
import styled from 'styled-components';
import TextBody from 'components/TextBody';
import Usage from 'views/Usage';
//import BankProvider from 'lib/bankContext';
import { Games } from 'games';
// import BankSocket from 'lib/bankSockets';

import scoreURL from 'res/score.svg';
import moneyURL from 'res/money.svg';
import cardsURL from 'res/cards.svg';
import bingoURL from 'res/bingo.svg';
import { Header } from 'components/Header';

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

export default function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" exact>
                    <img
                        src={scoreURL}
                        style={{ margin: 8, marginBottom: 0 }}
                        height="48"
                        alt="Score"
                    />
                    <p style={{ fontWeight: 'bold' }}>
                        hecho por <SC />
                    </p>
                    <div className="gameSelect">
                        <Card
                            src={moneyURL}
                            name="Dinero"
                            to="/money"
                            description="Para juegos en donde hay un banco 
                                     y cada jugador tiene su propio dinero. 
                                     Acepta transferencias y rankings"
                        />
                        <Card
                            src={cardsURL}
                            name="Tabla"
                            to="/sheet"
                            description="Planilla de puntaje tradicional. 
                                    Recomendada para juegos de cartas"
                        />
                        <Card
                            src={bingoURL}
                            name="Bingo"
                            to="/bingo"
                            description="Herramienta para elegir números
                                    aleatorios para el bingo, sin repetir."
                        />
                    </div>
                    <Usage />
                </Route>
                <Route path="/money">
                    <Games.Monopoly useSavedMatch='kiricocho' settings={{
                        defaultMoney: 1500,
                    }} />
                    {/* <BankSocket /> */}
                </Route>
                {/* <Route path="/sheet">
                        <ScoreSheet />
                    </Route>
                    <Route path="/bingo">
                        <Bingo />
                    </Route> */}
            </Switch>
            <Header />
        </Router>
    );
}
