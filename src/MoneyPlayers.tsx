import React, { Component, createRef } from 'react';
import { Map } from 'immutable';
import { Player } from './types';
import { MoneyInput, AddPlayer } from './Dialogs';
import { Header, Sidebar } from './Header';

const SAVE_NAME = 'moneysave';

enum sel {
    Unselected,
    From,
    To
}

type PlayerCardProps = {
    name: string;
    money: number;
    isBank: boolean;
    inputCallback: (amount: number) => void;
    onSelection: (name: string) => void;
    selection: sel;
};

class PlayerCard extends Component<PlayerCardProps> {
    state = {
        val: ''
    };

    constructor(props) {
        super(props);
    }

    inputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) {
            this.setState({
                val: e.target.value
            });
        }
    }

    clickAvatar(ok: boolean) {
        let { selection, inputCallback } = this.props;

        if (selection == sel.To && ok) { // Pressed confirm
            let m = Number(this.state.val);
            if (isNaN(m)) m = 0; // Just in case

            inputCallback(m);
            this.setState({ val: '' });
        }
        else { // Pressed cancel
            inputCallback(null);
            this.setState({ val: '' });
        }
    }

    selected(e: React.MouseEvent<HTMLLIElement>) {
        if (this.props.selection == sel.Unselected) {
            this.props.onSelection(this.props.name);
            e.preventDefault();
        }
    }

    render() {
        let { name, money, selection, isBank } = this.props;

        let confirm = this.state.val != '';
        let avatarClass = 'avatar';
        if (confirm) {
            avatarClass += ' ok';
        }
        else {
            switch (selection) {
                case sel.From:
                    avatarClass += ' from';
                    break;
                case sel.To:
                    avatarClass += ' to';
                    break;
                default:
                    if (isBank) avatarClass += ' bank';
            }
        }

        return (
            <li className="player" onClick={this.selected.bind(this)}>
                <div
                    className={avatarClass}
                    onClick={e => this.clickAvatar(true)}
                />
                {selection == sel.To && <div
                    className="avatar cancel"
                    onClick={e => this.clickAvatar(false)}
                />}
                <h2>{name}</h2>
                {selection == sel.To
                    ? <label>
                        $&nbsp;
                        <input
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={this.state.val}
                            autoFocus={true}
                            onChange={
                                e => this.inputChange(e)
                            }
                            onKeyPress={e => {
                                if (e.key == 'Enter')
                                    this.clickAvatar(true);
                            }}
                            placeholder={`${this.props.money} más...`}
                        />
                    </label>
                    : <span>$ {money}</span>
                }
            </li>
        );
    }
}



type Transaction = { action: string; money: number; id: number; };

type MoneyState = {
    players: Map<string, Player>;
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

    selectPlayer(name: string) {
        console.log(name);
        if (this.state.from == null) {
            this.setState({ from: name });
        }
        else {
            this.setState({ to: name });
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

        console.dir(this.state);

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
                    inputCallback={m => this.sendMoney(m)}
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
                        () => { this.setState({ players: Map() }); }
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
                    <li className="player add" onClick={
                        () => this.setState({ addingPlayer: true })
                    }>
                        <div className="avatar"></div>
                        <h2>Agregar</h2>
                    </li>
                </ul>

                {
                    this.state.addingPlayer &&
                    <AddPlayer itemName={itemName} callback={this.addPlayer.bind(this)} />
                }
            </div>

        );
    }
}