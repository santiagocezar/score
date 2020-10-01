import React from 'react';
import './App.css';
import './MoneyPlayers.css';
import { Map } from 'immutable';
import { Player } from './types';
import { MoneyInput, AddPlayer } from './Dialogs';
import { Header, Sidebar } from './Header';

interface MoneyState {
    players: Map<string, Player>;
    from: string;
    to: string;
    addingPlayer: boolean;
    historyOpen: boolean;
    rankOpen: boolean;
    rankings: Array<Player>;
}

export class MoneyPlayers extends React.Component<{ home: () => void; }, MoneyState> {
    constructor(props) {
        super(props);
        let save = localStorage.getItem('save');
        let players = Map<string, Player>();
        if (save) {
            players = Map(JSON.parse(save));
        }
        this.state = {
            players,
            from: null,
            to: null,
            addingPlayer: false,
            historyOpen: false,
            rankOpen: false,
            rankings: []
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
        this.setState(state => {
            let newState = {
                players: state.players.update(
                    name,
                    _ => ({
                        name,
                        money,
                    })
                ),
                addingPlayer: false
            };
            this.save(newState);
            return newState;
        });
    }

    save = (state) => localStorage.setItem('save', JSON.stringify(state.players));

    sendMoney(cancelled: boolean, money: number) {
        if (cancelled) {
            this.setState(state => ({
                from: null,
                to: null
            }));
            return;
        }

        this.setState(state => {
            let newState = {
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
            };
            this.save(newState);
            return newState;
        });
    }

    getRankings() {
        let actualPlayers = this.state.players.slice(1); // El banco no cuenta
        let rankings = Array.from(actualPlayers.values());

        rankings.sort((a, b) => b.money - a.money); // Ordenar por el dinero

        return rankings;
    };

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
        let rankings = [];
        this.getRankings().forEach((players, rank) => {
            rankings.push((
                <li key={players.name}>
                    <span className="rank">{rank + 1}°</span>
                    <div>
                        <span className="name">{players.name}</span>
                        <span className="pts">${players.money}</span>
                    </div>
                </li>
            ));
        });
        let itemName = players.length > 0
            ? 'jugador'
            : 'banco';
        return (
            <div className="MoneyPlayers">
                <Header home={this.props.home}>
                    <a href="#" className="material-icons" onClick={
                        () => { this.setState({ players: Map() }); }
                    } >group_add</a>
                    <a href="#" className="material-icons" onClick={
                        () => {
                            this.setState(state => (
                                { historyOpen: !state.historyOpen, rankOpen: false }
                            ));
                        }
                    } >history</a>
                    <a href="#" className="material-icons" onClick={
                        () => {
                            this.setState(state => (
                                { historyOpen: false, rankOpen: !state.rankOpen }
                            ));
                        }
                    } >poll</a>
                </Header>
                <Sidebar open={this.state.rankOpen}>
                    <ul className="rankings">
                        {rankings}
                    </ul>
                </Sidebar>
                <ul>
                    {players}
                    <li className="player add" onClick={() => this.setState({ addingPlayer: true })}>Agregar {itemName}</li>
                </ul>

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