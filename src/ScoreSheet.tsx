import React from 'react';
import { Map } from 'immutable';
import { Player } from './types';
import { AddSimple, AddScore } from './Dialogs';
import { Header, Sidebar } from './Header';

interface Transaction { action: string; money: number; id: number; }
interface SheetState {
    players: Map<string, Player>;
    addingPlayer: boolean;
    addingScore: string;
    rankOpen: boolean;
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
            addingScore: null,
            rankOpen: false,
        };
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

    addScore(cancelled: boolean, player: string, score: number) {
        if (cancelled)
            return;


        this.setState(state => {
            let newState = {
                players: state.players.update(
                    player,
                    p => ({
                        ...p,
                        prevScore: [...p.prevScore, score],
                        score: p.score + score,
                    })
                ),
                addingScore: null
            };
            this.save(newState);
            return newState;
        });
    }

    getRankings() {
        let rankings = Array.from(this.state.players.values());

        rankings.sort((a, b) => b.score - a.score); // Ordenar por el dinero

        return rankings;
    };

    render() {
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

        let names = [];
        let prev = [];
        let totals = [];
        this.state.players.forEach((v: Player, k) => {
            names.push(<span key={k}>{v.name}</span>);

            let col = [];
            for (let s of v.prevScore) {
                col.push(<span key={col.length}>{s}</span>);
            }

            col.push(
                <span
                    className="material-icons"
                    onClick={() => this.setState({ addingScore: v.name })}
                >add</span>
            );

            prev.push(<div className="col">{col}</div>);

            totals.push(<span key={k}>{v.score}</span>);
        });

        return (
            <div className="ScoreSheet">
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

                <div className="sheet">
                    <div className="names">
                        {names}
                        <span className="material-icons" onClick={() => this.setState({ addingPlayer: true })}>add</span>
                    </div>
                    <div className="prevWrapper">
                        <div className="prev">
                            {prev}
                            <div className="col"></div>
                        </div>
                    </div>
                    <div className="totals">
                        {totals}
                        <span></span>
                    </div>
                </div>

                {
                    this.state.addingPlayer &&
                    <AddSimple callback={this.addPlayer.bind(this)} />
                }
                {
                    this.state.addingScore !== null &&
                    <AddScore name={this.state.addingScore} callback={this.addScore.bind(this)} />
                }
            </div>
        );
    }
}