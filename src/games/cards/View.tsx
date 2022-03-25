import { FC, useState } from 'react';
import styled, { css } from 'styled-components';
import { Panel, Paneled } from 'components/panels';
import { useAddPlayerPanel } from 'components/panels/AddPlayer';
import { PlayerID } from 'lib/bx';
import { AddScore } from './AddScore';
import { card } from '.';

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

const SAVE_NAME = 'sheetsave';

export const CardsView: FC = () => {
    const board = card.useBoard();
    const players = card.usePlayers();

    const [addingScore, setAddingScore] = useState<PlayerID | null>(null);

    // const rankings = [];
    // this.getRankings().forEach((players, rank) => {
    //     rankings.push(
    //         <li key={players.name}>
    //             <span className="rank">{rank + 1}°</span>
    //             <div>
    //                 <span className="name">{players.name}</span>
    //                 <span className="pts">{players.score}</span>
    //             </div>
    //         </li>
    //     );
    // });

    function addScore(score: PlayerID | null) {
        if (score !== null) {
            board.set(addingScore!, "prevScore", draft => {
                draft.push(score);
            });
        }
        setAddingScore(null);
    }

    const names: JSX.Element[] = [];
    const history: JSX.Element[] = [];
    const totals: JSX.Element[] = [];
    players.forEach((v, k) => {
        names.push(<span key={k}>{v.name}</span>);

        let total = 0;
        const col = [];
        for (const s of v.fields.prevScore) {
            total += s;
            col.push(<span key={col.length}>{s}</span>);
        }

        col.push(
            <span
                key={k}
                className="material-icons"
                onClick={() => setAddingScore(v.pid)}
            >
                add
            </span>
        );

        history.push(<Column key={k}>{col}</Column>);

        totals.push(<span key={k}>{total}</span>);
    });

    return (
        <Paneled
            mainView={(
                <Sheet>
                    <Names>
                        {names}
                    </Names>
                    <History>
                        {history}
                    </History>
                    <Totals>
                        {totals}
                    </Totals>
                    {addingScore !== null && (
                        <AddScore
                            pid={addingScore}
                            onConfirm={addScore}
                        />
                    )}
                </Sheet>
            )}
        >
            {/* <a
                href="#"
                className="material-icons"
                onClick={() => {
                    this.setState((state) => ({
                        rankOpen: !state.rankOpen,
                    }));
                }}
            >
                poll
            </a> */}
            {/* <Sidebar open={this.state.rankOpen}>
                <ul className="rankings">{rankings}</ul>
            </Sidebar> */}
            {useAddPlayerPanel()}
        </Paneled>
    );
};


//     constructor(props) {
//         super(props);
//         let save = localStorage.getItem(SAVE_NAME);
//         let players = Map<string, Player>();
//         if (save) {
//             players = Map(JSON.parse(save));
//         }
//         this.state = {
//             players,
//             addingPlayer: false,
//             addingScore: null,
//             rankOpen: false,
//         };
//     }

//     save = (state) =>
//         localStorage.setItem(SAVE_NAME, JSON.stringify(state.players));

//     addScore(cancelled: boolean, player: string, score: number) {
//         if (cancelled) return;

//         this.setState((state) => {
//             let newState = {
//                 players: state.players.update(player, (p) => ({
//                     ...p,
//                     prevScore: [...p.prevScore, score],
//                     score: p.score + score,
//                 })),
//                 addingScore: null,
//             };
//             this.save(newState);
//             return newState;
//         });
//     }

//     getRankings() {
//         let rankings = Array.from(this.state.players.values());

//         rankings.sort((a, b) => b.score - a.score); // Ordenar por el dinero

//         return rankings;
//     }

//     render() {
//         let rankings = [];
//         this.getRankings().forEach((players, rank) => {
//             rankings.push(
//                 <li key={players.name}>
//                     <span className="rank">{rank + 1}°</span>
//                     <div>
//                         <span className="name">{players.name}</span>
//                         <span className="pts">{players.score}</span>
//                     </div>
//                 </li>
//             );
//         });

//         let names = [];
//         let history = [];
//         let totals = [];
//         this.state.players.forEach((v: Player, k) => {
//             names.push(<span key={k}>{v.name}</span>);

//             let col = [];
//             for (let s of v.prevScore) {
//                 col.push(<span key={col.length}>{s}</span>);
//             }

//             col.push(
//                 <span
//                     key={k}
//                     className="material-icons"
//                     onClick={() => this.setState({ addingScore: v.name })}
//                 >
//                     add
//                 </span>
//             );

//             history.push(<Column key={k}>{col}</Column>);

//             totals.push(<span key={k}>{v.score}</span>);
//         });

//         return (
//             <Wrapper>
//                 <Header mode="card">
//                     <a
//                         href="#"
//                         className="material-icons"
//                         onClick={() => {
//                             this.setState({ players: Map() });
//                         }}
//                     >
//                         group_add
//                     </a>
//                     <a
//                         href="#"
//                         className="material-icons"
//                         onClick={() => {
//                             this.setState((state) => ({
//                                 rankOpen: !state.rankOpen,
//                             }));
//                         }}
//                     >
//                         poll
//                     </a>
//                 </Header>
//                 <Sidebar open={this.state.rankOpen}>
//                     <ul className="rankings">{rankings}</ul>
//                 </Sidebar>

//                 <Sheet>
//                     <Names>
//                         {names}
//                         <span
//                             className="material-icons"
//                             onClick={() =>
//                                 this.setState({ addingPlayer: true })
//                             }
//                         >
//                             add
//                         </span>
//                     </Names>
//                     <History>
//                         {history}
//                         <Column></Column>
//                     </History>
//                     <Totals>
//                         {totals}
//                         <span></span>
//                     </Totals>
//                 </Sheet>

//                 {this.state.addingPlayer && (
//                     <AddSimple callback={this.addPlayer.bind(this)} />
//                 )}
//                 {this.state.addingScore !== null && (
//                     <AddScore
//                         name={this.state.addingScore}
//                         callback={this.addScore.bind(this)}
//                     />
//                 )}
//             </Wrapper>
//         );
//     }