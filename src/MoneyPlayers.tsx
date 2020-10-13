import React, { Component } from 'react';
import { OrderedMap } from 'immutable';
import { Player } from './types';
import PlayerCard, { sel } from './PlayerCard';
import { Header, Sidebar } from './Header';

const SAVE_NAME = 'moneysave';

type Transaction = { action: string; money: number; id: number; };

type MoneyState = {
    players: OrderedMap<string, Player>;
    from: string;
    to: string;
    addingPlayer: boolean;
    historyOpen: boolean;
    rankOpen: boolean;
    transactions: Array<Transaction>;
};

export default class MoneyPlayers extends Component<{}, MoneyState> {
    constructor(props) {
        super(props);
        let save = localStorage.getItem(SAVE_NAME);
        let players = OrderedMap<string, Player>();
        if (save) {
            players = OrderedMap(JSON.parse(save));
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

    selectPlayer(name: string) {
        if (this.state.from == null) {
            this.setState({ from: name });
        }
        else {
            this.setState({ to: name });
        }
    }

    addPlayer(cancelled: boolean, name: string, money: number) {
        if (cancelled) {
            this.setState({
                addingPlayer: false
            });
            return;
        }
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

    sendMoney(money: number) {
        if (money === null) {
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
            let s = sel.Unselected;

            if (this.state.from == v.name) s = sel.From;
            if (this.state.to == v.name) s = sel.To;

            players.push((
                <PlayerCard
                    key={k}
                    name={v.name}
                    money={v.score}
                    isBank={players.length == 0}
                    selection={s}
                    inputCallback={(_, m) => this.sendMoney(m)}
                    onSelection={n => this.selectPlayer(n)}
                />
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

            <div className="_MP">

                <Header>
                    <a href="#" className="material-icons" onClick={
                        () => { this.setState({ players: OrderedMap() }); }
                    }>
                        group_add
                    </a>
                    <a href="#" className="material-icons" onClick={
                        () => {
                            this.setState(state => (
                                { historyOpen: !state.historyOpen, rankOpen: false }
                            ));
                        }
                    }>
                        history
                    </a>
                    <a href="#" className="material-icons" onClick={
                        () => {
                            this.setState(state => (
                                { historyOpen: false, rankOpen: !state.rankOpen }
                            ));
                        }
                    }>
                        poll
                    </a>
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
                    <PlayerCard
                        name='Add'
                        money={0}
                        isBank={false}
                        selection={sel.Unselected}
                        add={this.state.addingPlayer}
                        inputCallback={
                            (n, m) => { this.addPlayer(n == null, n, m); }
                        }
                        onSelection={_ => this.setState({ addingPlayer: true })}
                    />
                </ul>
            </div>

        );
    }
}