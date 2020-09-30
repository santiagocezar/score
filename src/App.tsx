import React from 'react';
import './App.css';
import { MoneyPlayers } from './MoneyPlayers';

interface AppState {
    game: string;
}

export class App extends React.Component<{}, AppState> {
    constructor(props) {
        super(props);

        this.state = {
            game: null
        };
    }

    openGame(game: string, event: React.MouseEvent) {
        if (game == 'cards') {
            alert('no esta implementado jsjsjsj');
        }
        else {
            this.setState({
                game
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className="App">
                {this.state.game === null && <img src="/res/score.svg" height="64" />}
                {this.state.game === null
                    ? <div className="gameSelect">
                        <a href="#money" onClick={this.openGame.bind(this, 'money')}>Dinero</a>
                        <a href="#cards" onClick={this.openGame.bind(this, 'cards')}>Puntos</a>
                    </div>
                    : <MoneyPlayers />
                }
                <p>Score beta hecho por <a href="https://">Santi Cézar</a></p>
            </div>
        );
    }
};;