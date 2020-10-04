import React from 'react';
import { Map } from 'immutable';
import { Player } from './types';
import { AddSimple } from './Dialogs';
import { Header, Sidebar } from './Header';

interface Transaction { action: string; money: number; id: number; }
interface SheetState {
    players: Map<string, Player>;
    addingPlayer: boolean;
    rankOpen: boolean;
    transactions: Array<Transaction>;
}

const SAVE_NAME = 'sheetsave';

export class ScoreSheet extends React.Component<{ home: () => void; }, SheetState> {
    constructor(props) {
        super(props);
        let save = localStorage.getItem(SAVE_NAME);
        let players = Map<string, Player>();
        if (save) {
            players = Map(JSON.parse(save));
        }
        this.state = {
            players,
            addingPlayer: false,
            rankOpen: false,
            transactions: [],
        };
    }

    clickPlayer(player: string) {
    }

    addPlayer(cancelled: boolean, name: string) {
        if (cancelled) {
            this.setState(state => ({
                addingPlayer: false
            }));
            return;
        }
        console.log(`Agregar jugador ${name}`);
        this.setState(state => {
            let newState = {
                players: state.players.update(
                    name,
                    _ => ({
                        name,
                        score: 0,
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
            players.push((
                <li className='player' key={k} onClick={this.clickPlayer.bind(this, k)}>
                    {v.name}<span>{v.score}</span>
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
                        <span className="pts">{players.score}</span>
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
                                { rankOpen: !state.rankOpen }
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
                    <AddSimple callback={this.addPlayer.bind(this)} />
                }
            </div>
        );
    }
}