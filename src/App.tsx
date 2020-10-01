import React from 'react';
import './App.css';
import { MoneyPlayers } from './MoneyPlayers';

type CardProps = { src: string; action: () => void; };
const Card: React.FunctionComponent<CardProps> = (props) => <a href="#" onClick={props.action}>
    <img src={props.src} />
    {props.children}
</a>;

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
                        <Card src="res/money.svg" action={this.openGame.bind(this, 'money')}>Dinero</Card>
                        <Card src="res/cards.svg" action={this.openGame.bind(this, 'cards')}>Puntos</Card>
                    </div>
                    : <MoneyPlayers home={this.openGame.bind(this, null)} />
                }
                <p>Score beta hecho por <a href="https://">Santi Cézar</a></p>
            </div >
        );
    }
};;