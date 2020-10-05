import React from 'react';
import { Map } from 'immutable';
import { Player } from './types';
import { MoneyInput, AddPlayer } from './Dialogs';
import { Header, Sidebar } from './Header';

interface Transaction { action: string; money: number; id: number; }
interface MoneyState {
    players: Map<string, Player>;
    from: string;
    to: string;
    addingPlayer: boolean;
    historyOpen: boolean;
    rankOpen: boolean;
    transactions: Array<Transaction>;
}

const SAVE_NAME = 'moneysave';

export class MoneyPlayers extends React.Component<{ home: () => void; }, MoneyState> {
    constructor(props) {
        super(props);
        let save = localStorage.getItem(SAVE_NAME);
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
            transactions: [],
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
                        score: money,
                        prevScore: []
                    })
                ),
                addingPlayer: false
            };
            this.save(newState);
            return newState;
        });
    }

    save = (state) => localStorage.setItem(SAVE_NAME, JSON.stringify(state.players));

    sendMoney(cancelled: boolean, money: number) {
        if (cancelled) {
            this.setState(state => ({
                from: null,
                to: null
            }));
            return;
        }

        let t: Transaction = {
            action: this.state.from + ' a ' + this.state.to,
            money,
            id: this.state.transactions.length
        };

        this.setState(state => {
            let newState = {
                players: state.players.update(
                    state.from,
                    player => ({
                        ...player,
                        score: player.score - money,
                    })
                ).update(
                    state.to,
                    player => ({
                        ...player,
                        score: player.score + money,
                    })
                ),
                from: null,
                to: null,
                transactions: [...state.transactions, t]
            };
            this.save(newState);
            return newState;
        });
    }

    getRankings() {
        let actualPlayers = this.state.players.slice(1); // El banco no cuenta
        let rankings = Array.from(actualPlayers.values());

        rankings.sort((a, b) => b.score - a.score); // Ordenar por el dinero

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
                    {v.name}<span>${v.score}</span>
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
                        <span className="pts">${players.score}</span>
                    </div>
                </li>
            ));
        });
        let transactions = [];
        for (let t of this.state.transactions) {
            transactions.push((
                <li key={t.id}>
                    <div>
                        <span className="name">{t.action}</span>
                        <span className="pts">${t.money}</span>
                    </div>
                </li>
            ));
        }

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
                <Sidebar open={this.state.historyOpen}>
                    <ul className="history">
                        {transactions.reverse()}
                        <p className="empty">Historial vacío.</p>
                    </ul>
                </Sidebar>
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