import React, { Component } from 'react';
import { OrderedMap, Set } from 'immutable';
import { saveString, loadString } from '../utils';
import PlayerCard, { sel } from './PlayerCard';
import { Header, Sidebar } from '../Header';
import Property, { PropertyData } from './Property';
import OwnedProperties from './OwnedProperties';

const SAVE_NAME = 'moneysave';

type Transaction = { action: string; money: number; id: number; };

type Player = {
    isBank?: boolean;
    name: string;
    score: number;
    properties: Set<number>;
    prevScore: number[];
}

type PlayerMap = OrderedMap<string, Player>;

type BankerState = {
    players: PlayerMap;
    from: string;
    to: string;
    addingPlayer: boolean;
    sidebars: boolean[];
    transactions: Array<Transaction>;
    properties: PropertyData[];
    selectedProperty: number | null;
};

const SIDE_PROP = 0;
const SIDE_HIST = 1;
const SIDE_RANK = 2;

export default class Banker extends Component<{}, BankerState> {
    constructor(props) {
        super(props);

        let players = this.loadSave(true)

        let propertiesString = localStorage.getItem('properties');
        let properties = null;
        if (propertiesString) {
            let propfile = JSON.parse(propertiesString);
            properties = propfile.properties;
        }

        this.state = {
            players,
            from: null,
            to: null,
            addingPlayer: false,
            sidebars: [false, false, false],
            transactions: [],
            properties,
            selectedProperty: null
        };
    }

    loadSave(get?: boolean): PlayerMap {
        let save = localStorage.getItem(SAVE_NAME);
        let players: PlayerMap = OrderedMap();
        if (save) {
            players = OrderedMap(JSON.parse(save));
        }

        let thereIsBank = false

        players.forEach((p, k) => {
            thereIsBank = thereIsBank || p.isBank == true
            p.properties = Set(p.properties)
        })

        if (!thereIsBank && players.size > 0) {
            players.first({ isBank: false }).isBank = true
        }

        if (get != true) {
            this.setState({
                players
            });
        }
        return players
    }

    selectPlayer(name: string) {
        let { from, to, selectedProperty, properties } = this.state
        if (from == null && selectedProperty == null) {
            this.setState({ from: name });
        }
        else {
            if (selectedProperty != null) {
                if (from != null) {
                    this.setState(state => ({
                        players: state.players.update(
                            from,
                            p => ({
                                ...p,
                                properties: p.properties.update(m => {
                                    return m.delete(properties[selectedProperty].id)
                                })
                            })
                        ).update(
                            name,
                            p => {
                                if (p.isBank) return p

                                if (!p.properties) {
                                    p.properties = Set()
                                }
                                p.properties = p.properties.update(m => {
                                    return m.add(properties[selectedProperty].id)
                                })
                                return p
                            }
                        ),
                        from: null,
                        selectedProperty: null,
                    }));
                }
                else {
                    this.setState(state => ({
                        players: state.players.update(
                            name,
                            p => {
                                if (p.isBank) return p

                                if (!p.properties) {
                                    p.properties = Set()
                                }
                                p.properties = p.properties.update(m => {
                                    return m.add(properties[selectedProperty].id)
                                })
                                return p
                            }
                        ),
                        selectedProperty: null,
                    }));
                }
            }
            else {
                this.setState({ to: name });
            }
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
                        properties: Set(),
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
                to: null,
                selectedProperty: null,
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

    loadProperties() {
        loadString(s => {
            localStorage.setItem('properties', s);
            let propfile = JSON.parse(s);
            this.setState({ properties: propfile.properties });
        });
    }

    render() {
        let players = [];
        let ownedProperties = [];

        this.state.players.forEach((v, k) => {
            let s = sel.Unselected;
            let isBank = v.isBank == true

            if (this.state.from == v.name) s = sel.From;
            if (this.state.to == v.name) s = sel.To;

            let colors: string[] = []
            if (this.state.properties && v.properties) {
                colors = Array.from(v.properties).map(v => this.state.properties[v].group)
                console.log(Array.from(v.properties))
                ownedProperties = [...ownedProperties, ...Array.from(v.properties)]
            }

            players.push((
                <PlayerCard
                    key={k}
                    name={v.name}
                    money={v.score}
                    isBank={isBank}
                    selection={s}
                    colors={colors}
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



        let shownProperties = [];

        if (this.state.properties) {
            if (this.state.from != null) {
                let p = this.state.players.get(this.state.from).properties
                if (p) {
                    for (let id of p) {
                        shownProperties.push(this.state.properties[id]);
                    }
                }
            }
            else {
                for (let data of this.state.properties) {
                    if (!ownedProperties.includes(data.id))
                        shownProperties.push(data)
                }
            }
        }

        return (

            <div className="_MP">

                <Header>
                    <a href="#" about="Abrir" className="material-icons" onClick={
                        () => {
                            loadString(s => {
                                localStorage.setItem(SAVE_NAME, s);
                                this.loadSave();
                            });
                        }
                    }>
                        publish
                    </a>
                    <a href="#" about="Guardar" className="material-icons" onClick={
                        () => {
                            saveString(`score_save${Date.now()}.txt`,
                                localStorage.getItem(SAVE_NAME));
                        }
                    }>
                        get_app
                    </a>
                    <a href="#" about="Reiniciar" className="material-icons" onClick={
                        () => { this.setState({ players: OrderedMap() }); }
                    }>
                        restore_page
                    </a>
                    <a href="#" about="Historial" className="material-icons" onClick={
                        () => {
                            this.setState(state => (
                                {
                                    sidebars: [
                                        false, !state.sidebars[SIDE_HIST],
                                        false
                                    ]
                                }
                            ));
                        }
                    }>
                        history
                    </a>
                    <a href="#" about="Puestos" className="material-icons" onClick={
                        () => {
                            this.setState(state => (
                                {
                                    sidebars: [
                                        false, false,
                                        !state.sidebars[SIDE_RANK]
                                    ]
                                }
                            ));
                        }
                    }>
                        emoji_events
                    </a>
                </Header>


                <Sidebar open={this.state.sidebars[SIDE_HIST]}>
                    <ul className="history">
                        {transactions.reverse()}
                        <p className="empty">Historial vacío.</p>
                    </ul>
                </Sidebar>

                <Sidebar open={this.state.sidebars[SIDE_RANK]}>
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
                <OwnedProperties
                    properties={shownProperties}
                    empty={this.state.properties == null || this.state.properties.length == 0}
                    selected={this.state.selectedProperty}
                    onImport={() => this.loadProperties()}
                    onPropertyClicked={id => this.setState({ selectedProperty: id })}
                />
            </div>

        );
    }
}