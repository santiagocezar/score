import React from 'react';
import { Map } from 'immutable';
import { Player } from '../lib/utils';
import { AddSimple, AddScore } from 'components/Dialogs';
import { Header, Sidebar } from 'components/Header';
import styled, { css } from 'styled-components';

const cell = css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    border-left: 2px solid black;

    color: black;
    min-height: 48px;
    height: 48px;

    &:first-child {
        border-left: none;
    }

    &:not(.material-icons) {
        font-family: 'Nova Mono', monospace;
        font-size: 32px;
    }
`;

const Wrapper = styled.div`
    flex-grow: 1;
    width: 100%;
    display: flex;
    align-items: center;
    align-content: space-around;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
`;

const Sheet = styled.div`
    margin: 16px 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
    overflow: hidden;
`;

const Names = styled.div`
    display: flex;
    height: 48px;
    border-bottom: 2px solid black;

    span {
        ${cell}
    }
`;

const History = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    overflow-y: auto;
`;

const Column = styled.div`
    ${cell}
    flex-direction: column;
    height: unset;
    border-color: transparent;

    span {
        ${cell}
        border: none;
    }
`;

const Totals = styled.div`
    display: flex;
    height: 48px;
    border-top: 2px solid black;

    span {
        ${cell}
    }
`;

interface Transaction {
    action: string;
    money: number;
    id: number;
}
interface SheetState {
    players: Map<string, Player>;
    addingPlayer: boolean;
    addingScore: string;
    rankOpen: boolean;
}

const SAVE_NAME = 'sheetsave';

export default class ScoreSheet extends React.Component<{}, SheetState> {
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
            this.setState((state) => ({
                addingPlayer: false,
            }));
            return;
        }
        console.log(`Agregar jugador ${name}`);
        this.setState((state) => {
            let newState = {
                players: state.players.update(name, (_) => ({
                    name,
                    score: 0,
                    prevScore: [],
                })),
                addingPlayer: false,
            };
            this.save(newState);
            return newState;
        });
    }

    save = (state) =>
        localStorage.setItem(SAVE_NAME, JSON.stringify(state.players));

    addScore(cancelled: boolean, player: string, score: number) {
        if (cancelled) return;

        this.setState((state) => {
            let newState = {
                players: state.players.update(player, (p) => ({
                    ...p,
                    prevScore: [...p.prevScore, score],
                    score: p.score + score,
                })),
                addingScore: null,
            };
            this.save(newState);
            return newState;
        });
    }

    getRankings() {
        let rankings = Array.from(this.state.players.values());

        rankings.sort((a, b) => b.score - a.score); // Ordenar por el dinero

        return rankings;
    }

    render() {
        let rankings = [];
        this.getRankings().forEach((players, rank) => {
            rankings.push(
                <li key={players.name}>
                    <span className="rank">{rank + 1}°</span>
                    <div>
                        <span className="name">{players.name}</span>
                        <span className="pts">{players.score}</span>
                    </div>
                </li>
            );
        });

        let names = [];
        let history = [];
        let totals = [];
        this.state.players.forEach((v: Player, k) => {
            names.push(<span key={k}>{v.name}</span>);

            let col = [];
            for (let s of v.prevScore) {
                col.push(<span key={col.length}>{s}</span>);
            }

            col.push(
                <span
                    key={k}
                    className="material-icons"
                    onClick={() => this.setState({ addingScore: v.name })}
                >
                    add
                </span>
            );

            history.push(<Column key={k}>{col}</Column>);

            totals.push(<span key={k}>{v.score}</span>);
        });

        return (
            <Wrapper>
                <Header mode="card">
                    <a
                        href="#"
                        className="material-icons"
                        onClick={() => {
                            this.setState({ players: Map() });
                        }}
                    >
                        group_add
                    </a>
                    <a
                        href="#"
                        className="material-icons"
                        onClick={() => {
                            this.setState((state) => ({
                                rankOpen: !state.rankOpen,
                            }));
                        }}
                    >
                        poll
                    </a>
                </Header>
                <Sidebar open={this.state.rankOpen}>
                    <ul className="rankings">{rankings}</ul>
                </Sidebar>

                <Sheet>
                    <Names>
                        {names}
                        <span
                            className="material-icons"
                            onClick={() =>
                                this.setState({ addingPlayer: true })
                            }
                        >
                            add
                        </span>
                    </Names>
                    <History>
                        {history}
                        <Column></Column>
                    </History>
                    <Totals>
                        {totals}
                        <span></span>
                    </Totals>
                </Sheet>

                {this.state.addingPlayer && (
                    <AddSimple callback={this.addPlayer.bind(this)} />
                )}
                {this.state.addingScore !== null && (
                    <AddScore
                        name={this.state.addingScore}
                        callback={this.addScore.bind(this)}
                    />
                )}
            </Wrapper>
        );
    }
}
