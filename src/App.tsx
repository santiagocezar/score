import React from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { Card, Icon } from './CommonComponents';
import MoneyPlayers from './MoneyPlayers';
import ScoreSheet from './ScoreSheet';

const socialStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 'bold',
    color: 'inherit',
    gap: 4
};

export class App extends React.Component {

    render() {
        return (
            <Router>
                <div className="App">
                    <Switch>
                        <Route path="/" exact>
                            <img src="/res/score.svg" height="64" alt="Score" />
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
                            </div>
                        </Route>
                        <Route path="/money">
                            <MoneyPlayers />
                        </Route>
                        <Route path="/sheet">
                            <ScoreSheet />
                        </Route>
                    </Switch>
                    <div style={{ ...socialStyle, marginBottom: 4 }}>
                        <a style={socialStyle} href="https://scez.ar">
                            <Icon name="icon-scezar" size={20} /> por scezar
                        </a> —
                        <a style={socialStyle} href="https://github.com/santiagocezar/score">
                            <Icon name="icon-github" size={16} /> código
                        </a>
                    </div >
                </div >
            </Router >
        );
    }
};;
