import { styled } from 'lib/theme';
import { FC, FormEvent, useState } from 'react';
import { Paneled } from 'components/panels';
import { Swatch, useAddPlayerPanel } from 'components/panels/AddPlayer';
import { PlayerFor, PlayerID } from 'lib/bx';
import { AddScore } from './AddScore';
import { truco } from '.';
import { palettes } from "lib/color";
import { Input } from "components/Forms";
import { HEADER_HEIGHT } from "components/Header";
import { range } from "lib/utils";



const Swatches = styled('div', {
    padding: '1rem',
    display: 'grid',
    alignSelf: 'center',
    width: '100%',
    flexGrow: 1,
    alignContent: 'center',
    maxWidth: '10rem',
    gridTemplateColumns: '1fr 1fr',
    '*': {
        aspectRatio: '1 / 1'
    },
});

const TeamBackground = styled('div', {
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
    borderRadius: '2rem',
    backgroundColor: '$$p30',
    transition: 'background-color .5s ease',
    width: 0,
    flexGrow: 1,
});

const AddTeamLayout = styled(TeamBackground, {
    overflowY: 'auto',
    'label': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        padding: '1rem',

    },
    'input': {
        width: '100%',
        fontSize: '1.5rem',
        backgroundColor: 'transparent',
        outline: 'none',
        fontWeight: 'bold',
        textAlign: 'center',
        borderBottom: '.25rem solid $$p50',
    },
});

const Actions = styled('div', {
    display: 'flex',
    'button': {
        width: 0,
        flexGrow: 1,
        backgroundColor: '$$p70',
        color: 'white',
        fontSize: '2rem',
        padding: '1rem',
    }
})


const AddTeam: FC = () => {
    const board = truco.useBoard();

    const [palette, setPalette] = useState(() => Math.floor(Math.random() * palettes.length));

    function create(event: FormEvent) {
        event.preventDefault()
        if (!(event.target instanceof HTMLFormElement)) return

        const data = new FormData(event.target);

        const name = data.get("name")?.toString() || "Motobug"

        board.add({
            name,
            palette,
        });

        console.log(name)
    }

    return (
        <AddTeamLayout as="form" onSubmit={create} css={palettes[palette]}>
            <label>
                <p>Nombre:</p>
                <input name="name" type="text" />
            </label>
            <Swatches>
                {palettes.map((_, i) => (
                    <Swatch key={i} palette={i} active={i === palette} onClick={setPalette} />
                ))}
            </Swatches>
            <Actions>
                <button type="submit">Agregar</button>
            </Actions>
        </AddTeamLayout>
    )
};


const TeamLayout = styled(TeamBackground, {
    'h2': {
        alignSelf: 'center',
        paddingY: '1rem',
        fontSize: '2rem'
    },
    '.boxes': {
        display: 'flex',
        alignItems: 'center',
        overflowY: 'auto',
        flexDirection: 'column',
        flexGrow: 1,
    },
});


const Fosforo = styled('div', {
    display: 'block',
    width: '.5rem',
    height: '5rem',
    backgroundColor: '$$p90',

    '&::before': {
        content: '""',
        display: 'block',
        backgroundColor: '$$p50',
        height: '1.5rem',
        margin: '-.125rem',
        width: '.75rem',
        borderRadius: '.25rem',
    }
});


const FosforoBox = styled('div', {
    position: 'relative',
    width: '7rem',
    flexShrink: 0,
    height: '9rem',
    '*': {
        position: 'absolute',
    },
    ':nth-child(1)': {
        top: "2rem",
    },
    ':nth-child(2)': {
        left: "3.25rem",
        top: "-1.25rem",
        transform: 'rotate(90deg)'
    },
    ':nth-child(3)': {
        top: "2rem",
        right: "0",
        transform: 'rotate(180deg)'
    },
    ':nth-child(4)': {
        left: "3.25rem",
        top: "5.25rem",
        transform: 'rotate(270deg)'
    },
    ':nth-child(5)': {
        left: "3.25rem",
        top: "2rem",
        transform: 'rotate(45deg)'
    },
});


interface TeamProps {
    team: PlayerFor<typeof truco>
}

const Team: FC<TeamProps> = ({ team }) => {
    const board = truco.useBoard();

    function increase() {
        board.set(team.pid, d => d.score++);
        console.trace()
    }
    function decrease() {
        board.set(team.pid, d => d.score > 0 && d.score--);
        console.log("click" + team.fields.score)
    }

    return (
        <TeamLayout css={palettes[team.palette]}>
            <h2>
                {team.name}
            </h2>
            <div className="boxes">
                {range(team.fields.score / 5).map(() => (
                    <FosforoBox>
                        <Fosforo />
                        <Fosforo />
                        <Fosforo />
                        <Fosforo />
                        <Fosforo />
                    </FosforoBox>
                ))}
                <FosforoBox>
                    {range(team.fields.score % 5).map(() => (
                        <Fosforo />
                    ))}
                </FosforoBox>
            </div>
            <Actions>
                <button onClick={decrease}>-</button>
                <button onClick={increase}>+</button>
            </Actions>
        </TeamLayout >
    )
};

const Split = styled('div', {
    display: 'flex',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: '1rem',
    paddingTop: `calc(${HEADER_HEIGHT} + 1rem)`,
    flexBasis: 0,
    gap: '1rem'
})

export const TrucoView: FC = () => {
    const board = truco.useBoard();
    const players = truco.usePlayers();

    // function addScore(score: PlayerID | null) {
    //     if (score !== null) {
    //         board.set(addingScore!, fields => {
    //             fields.prevScore.push(score);
    //         });
    //     }
    //     setAddingScore(null);
    // }

    // const names: JSX.Element[] = [];
    // const history: JSX.Element[] = [];
    // const totals: JSX.Element[] = [];
    // players.forEach((v, k) => {
    //     names.push(<span key={k}>{v.name}</span>);

    //     let total = 0;
    //     const col = [];
    //     for (const s of v.fields.prevScore) {
    //         total += s;
    //         col.push(<span key={col.length}>{s}</span>);
    //     }

    //     col.push(
    //         <span
    //             key={k}
    //             className="material-icons"
    //             onClick={() => setAddingScore(v.pid)}
    //         >
    //             add
    //         </span>
    //     );

    //     history.push(<Column key={k}>{col}</Column>);

    //     totals.push(<span key={k}>{total}</span>);
    // });

    return (
        <Split>
            {players[0] ? players[1] ? <><Team team={players[0]} /><Team team={players[1]} /></> : <><Team team={players[0]} /><AddTeam /></> : <><AddTeam /><TeamBackground /></>}


        </Split>
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