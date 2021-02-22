import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { Card } from 'components/Commons';
import Banker from 'views/Banker/Banker';
import ScoreSheet from 'views/ScoreSheet';
import Bingo from 'views/Bingo';
import styled from 'styled-components';
import TextBody from 'components/TextBody';
import Usage from 'views/Usage';
import BankProvider from 'lib/bankContext';
import BankSocket from 'lib/bankSockets';

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

const StyledApp = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    width: 100%;
    height: 100%;
    img {
        flex-shrink: 0;
    }
`;

export default function App() {
    return (
        <StyledApp>
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <img
                            src="/res/score.svg"
                            style={{ margin: 8, marginBottom: 0 }}
                            height="48"
                            alt="Score"
                        />
                        <p style={{ fontWeight: 'bold' }}>
                            hecho por <SC />
                        </p>
                        <div className="gameSelect">
                            <Card
                                src="res/money.svg"
                                name="Dinero"
                                to="/money"
                                description="Para juegos en donde hay un banco 
                                     y cada jugador tiene su propio dinero. 
                                     Acepta transferencias y rankings"
                            />
                            <Card
                                src="res/cards.svg"
                                name="Tabla"
                                to="/sheet"
                                description="Planilla de puntaje tradicional. 
                                    Recomendada para juegos de cartas"
                            />
                            <Card
                                src="res/bingo.svg"
                                name="Bingo"
                                to="/bingo"
                                description="Herramienta para elegir números
                                    aleatorios para el bingo, sin repetir."
                            />
                        </div>
                        <Usage />
                    </Route>
                    <Route path="/money">
                        <BankProvider>
                            <Banker />
                            <BankSocket />
                        </BankProvider>
                    </Route>
                    <Route path="/sheet">
                        <ScoreSheet />
                    </Route>
                    <Route path="/bingo">
                        <Bingo />
                    </Route>
                </Switch>
            </Router>
        </StyledApp>
    );
}
