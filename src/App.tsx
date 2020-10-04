import React from 'react';
import { MoneyPlayers } from './MoneyPlayers';
import { ScoreSheet } from './ScoreSheet';

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
        this.setState({
            game
        });
        event.preventDefault();
    }

    render() {
        return (
            <div className="App">
                {this.state.game === null &&
                    <>
                        <img src="/res/score.svg" height="64" />
                        <div className="gameSelect">
                            <Card src="res/money.svg" action={this.openGame.bind(this, 'money')}>Dinero</Card>
                            <Card src="res/cards.svg" action={this.openGame.bind(this, 'cards')}>Puntos</Card>
                        </div>
                    </>
                }
                {this.state.game === 'money' &&
                    <MoneyPlayers home={this.openGame.bind(this, null)} />
                }
                {this.state.game === 'cards' &&
                    <ScoreSheet home={this.openGame.bind(this, null)} />
                }
                <p>Score beta hecho por <a href="https://scez.ar">Santi Cézar</a></p>
            </div >
        );
    }
};;
