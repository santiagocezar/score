import React from 'react';
import './App.css';
import { Map } from 'immutable';
import { Player } from './types';
import { MoneyInput, AddPlayer } from './Dialogs';

interface MoneyState {
    players: Map<string, Player>;
    from: string;
    to: string;
    addingPlayer: boolean;
}

export class MoneyPlayers extends React.Component<{}, MoneyState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            players: Map(),
            from: null,
            to: null,
            addingPlayer: false,
        };
    }

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