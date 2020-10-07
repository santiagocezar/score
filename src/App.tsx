import React from 'react';
import { render } from 'react-dom';
import { MoneyPlayers } from './MoneyPlayers';
import { ScoreSheet } from './ScoreSheet';
import { Route, BrowserRouter as Router, Link, Switch } from 'react-router-dom';

type CardProps = {
    src: string;
    name: string;
    to: string;
    description: string;
};
class Card extends React.Component<CardProps>{
    render() {
        return (
            <Link to={this.props.to}>
                <img src={this.props.src} />
                <div>
                    <h2>{this.props.name}</h2>
                    <p>{this.props.description}</p>
                </div>
            </Link>
        );
    }
}
export class App extends React.Component {

    render() {
        return (
            <Router>
                <div className="App">
                    <Switch>
                        <Route path="/" exact>
                            <img src="/res/score.svg" height="64" />
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
                    <p>Score beta hecho por <a href="https://scez.ar">Santi Cézar</a></p>
                </div >
            </Router>
        );
    }
};;
