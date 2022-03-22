import produce from 'immer';
import { PlayerID, Player } from 'lib/bx';
import { tuple } from 'lib/utils';
import { ComponentProps, FC, memo, PropsWithChildren, useEffect } from 'react';
import { styled } from 'lib/theme';
import { Title6 } from 'components/Title';


const MedalContainer = styled('div', {
    position: 'relative',
});
const Medal = styled('div', {
    position: 'absolute',
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1rem',
    height: '1rem',
    borderRadius: '1rem',
    fontSize: '.75rem',
    fontWeight: 'bold',
    backgroundColor: '$foreA100',
    border: '.1rem solid $bg100',
    color: '$darkForeA100',
    variants: {
        bigger: {
            true: {
                width: '2rem',
                height: '2rem',
                borderRadius: '2rem',
                fontSize: '1.2rem',
            }
        },
        color: {
            gold: {
                background: 'linear-gradient(135deg, #ebb729 0%, #f3e9b7 50%, #f5d745 100%)',
                color: 'black',
            },
            silver: {
                background: 'linear-gradient(135deg, #a8aeb3 0%, #ffffff 50%, #a8aeb3 100%)',
                color: 'black',
            },
            bronze: {
                background: 'linear-gradient(135deg, #eb3d1e 0%, #ff815b 50%, #eb691e 100%)',
                color: 'black',
            },
        },
    }
});

const PodiumPlayerContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    userSelect: 'none',
});

interface PodiumPlayerProps {
    value: readonly [PlayerID, PlayerInfo | undefined, string];
    bigger?: boolean;
    pos: number;
}

const PodiumPlayer: FC<PodiumPlayerProps>
    = ({ value, bigger, pos }) => {
        console.log(value);
        const id = value?.[0] ?? null;
        const info = value?.[1] ?? {
            color: '#000',
            id: null,
            name: 'Nadie'
        };
        const format = value?.[2] ?? '—';
        const color = (['gold', 'silver', 'bronze'] as const)[pos - 1];

        return (
            <PodiumPlayerContainer>
                <MedalContainer>
                    {id !== null
                        ? (
                            <>
                                <Medal bigger color={color}>
                                    {pos}
                                </Medal>
                                <PlayerAvatar size={bigger ? 'large' : 'big'} pid={id} />
                            </>
                        )
                        : <Avatar icon={null} color="$bg200" size={bigger ? 'large' : 'big'} />}
                </MedalContainer>

                <Title6>
                    {info.name}
                </Title6>

                <Title6
                    css={{
                        marginTop: '-.25rem',
                        fontWeight: 'normal',
                        color: '$secondaryText',
                    }}
                >
                    {format}
                </Title6>
            </PodiumPlayerContainer >
        );
    };

const Podium = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
});

const RankItem = styled('div', {
    display: 'flex',
    gap: '.25rem',
    userSelect: 'none',
});

const LeaderboardContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '.5rem',
});

export interface LeaderboardProps<D extends DataTuple> extends ComponentProps<typeof LeaderboardContainer> {
    deps: D;
    scoreSort: (a: DataTuplePartial<D>, b: DataTuplePartial<D>) => number;
    scoreFormat: (...args: DataTuplePartial<D>) => string;
}

function LeaderboardNoMemo<D extends DataTuple>
    ({ deps, scoreSort, scoreFormat }: LeaderboardProps<D>) {
    const store = useGame();

    const players = store.useMap(PlayerInfo, ...deps);

    useEffect(() => {
        console.log('update');
        console.dir(players);
    }, [players]);

    const sorted = produce(players,
        (players: [PlayerID, PlayerInfo | undefined, ...OrUndefined<DataTupleValues<D>>][]) => {
            players.sort((a, b) => {
                const [, , ...dataA] = a;
                const [, , ...dataB] = b;
                return scoreSort(dataA, dataB);
            });
        }
    );

    const [first, second, third, ...rest] = sorted.map(([id, info, ...data]) => tuple(id, info, scoreFormat(...data)));


    return (
        <LeaderboardContainer>
            <Podium>
                <PodiumPlayer pos={3} value={third} />
                <PodiumPlayer pos={1} value={first} bigger />
                <PodiumPlayer pos={2} value={second} />
            </Podium>
            <Divider />
            {rest.map(([id, info, format], i) => (
                <RankItem key={id} >

                    <Title6>
                        {i + 4}°
                    </Title6>
                    <PlayerAvatar pid={id} />

                    <Title6 css={{ flexGrow: 1 }}>
                        {info?.name}
                    </Title6>
                    <Title6
                        css={{
                            fontWeight: 'normal',
                            color: 'GrayText',
                        }}
                    >
                        {format}
                    </Title6>
                </RankItem>
            ))}
        </LeaderboardContainer>

    );
};

export const Leaderboard = memo(LeaderboardNoMemo) as typeof LeaderboardNoMemo;