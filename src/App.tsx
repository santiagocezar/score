import React from 'react';
import './App.css';
import { Map } from 'immutable';

interface MoneyInputProps {
    from: string;
    to: string;
    callback: (cancelled: boolean, money: number) => void;
}

class MoneyInput extends React.Component<MoneyInputProps, {}> {
    moneyInput = React.createRef<HTMLInputElement>();

    handleSubmit(event: React.FormEvent) {
        this.props.callback(false, Number(this.moneyInput.current.value));
        event.preventDefault();
    }

    cancel(event) {
        this.props.callback(true, null);
    };

    render() {
        return (
            <div className="dialog MoneyInput">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <h2>{this.props.from} a {this.props.to}</h2>
                    <label className="moneySelect">
                        $
                    <input type="number" ref={this.moneyInput} />
                    </label>
                    <br />
                    <input type="submit" value="Entregar dinero" />
                    <button onClick={this.cancel.bind(this)}>Cancelar</button>
                </form>
            </div>
        );
    }
}

interface Player {
    name: string;
    money: number;
}

interface AddPlayerProps {
    callback: (cancelled: boolean, name: string, money: number) => void;
    itemName: string;
}

class AddPlayer extends React.Component<AddPlayerProps, {}> {
    nameInput = React.createRef<HTMLInputElement>();
    moneyInput = React.createRef<HTMLInputElement>();


    handleSubmit(event: React.FormEvent) {
        this.props.callback(false, this.nameInput.current.value, Number(this.moneyInput.current.value));
        event.preventDefault();
    }

    cancel(event) {
        this.props.callback(true, null, null);
    };

    render() {
        return (
            <div className="dialog AddPlayer">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <h2>Agregar {this.props.itemName}</h2>
                    <label>
                        Nombre del {this.props.itemName}:
                        <input type="text" ref={this.nameInput} />
                    </label>
                    <label>
                        Dinero del {this.props.itemName}:
                        <input type="number" ref={this.moneyInput} />
                    </label>
                    <br />
                    <input type="submit" value="Agregar" />
                    <button onClick={this.cancel.bind(this)}>Cancelar</button>
                </form>
            </div>
        );
    }
}
interface MoneyState {
    players: Map<string, Player>;
    from: string;
    to: string;
    addingPlayer: boolean;
}

class MoneyPlayers extends React.Component<{}, MoneyState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            players: Map(),
            from: null,
            to: null,
            addingPlayer: false,
        };
    };

    clickPlayer(player: string) {
        if (this.state.from == null) {
            this.setState({ from: player });
        }
        else {
            this.setState({ to: player });
        }
    }

    addPlayer(cancelled: boolean, name: string, money: number) {
        if (cancelled) {
            this.setState(state => ({
                addingPlayer: false
            }));
            return;
        }
        console.log(`Agregar jugador ${name} con $${money}`);
        this.setState(state => ({
            players: state.players.update(
                name,
                _ => ({
                    name,
                    money,
                })
            ),
            addingPlayer: false
        }));
    }

    sendMoney(cancelled: boolean, money: number) {
        if (cancelled) {
            this.setState(state => ({
                from: null,
                to: null
            }));
            return;
        }

        this.setState(state => ({
            players: state.players.update(
                state.from,
                player => ({
                    ...player,
                    money: player.money - money,
                })
            ).update(
                state.to,
                player => ({
                    ...player,
                    money: player.money + money,
                })
            ),
            from: null,
            to: null
        }));
    }

    render() {
        let players = [];
        this.state.players.forEach((v, k) => {
            let className = 'player';
            if (this.state.from == v.name) {
                className += ' from';
            }
            if (this.state.to == v.name) {
                className += ' to';
            }
            players.push((
                <li className={className} key={k} onClick={this.clickPlayer.bind(this, k)}>
                    {v.name}<span>${v.money}</span>
                </li>
            ));
        });
        let itemName = players.length > 0
            ? 'jugador'
            : 'banco';
        return (
            <div className="MoneyPlayers">
                <ul>
                    {players}
                    <li className="player add" onClick={() => this.setState({ addingPlayer: true })}>Agregar {itemName}</li>
                </ul>
                <p>{this.state.from === null
                    ? 'Ningún jugador seleccionado'
                    : 'Jugador seleccionado:' + this.state.from}

                </p>

                {
                    this.state.addingPlayer &&
                    <AddPlayer itemName={itemName} callback={this.addPlayer.bind(this)} />
                }
                {
                    this.state.to !== null &&
                    <MoneyInput from={this.state.from} to={this.state.to} callback={this.sendMoney.bind(this)} />
                }
            </div>
        );
    }
}

export class App extends React.Component {
    render() {
        return (
            <div className="App">
                <img src="/res/score.svg" height="64" />
                <MoneyPlayers />
                <p>Score beta hecho por <a href="https://">Santi Cézar</a></p>
            </div>
        );
    }
};;