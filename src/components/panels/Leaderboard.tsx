import produce from 'immer';
import { PlayerID, Player, FieldGroup, BoardGameHooks } from 'lib/bx';
import { tuple } from 'lib/utils';
import { ComponentProps, FC, memo, PropsWithChildren, useEffect, useMemo } from 'react';
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
    value: number;
    name: string;
    bigger?: boolean;
    pos: number;
}

const formatScore = (value: number) => value.toLocaleString() + ' pts';

const PodiumPlayer = memo<PodiumPlayerProps>(({ value, name, bigger, pos }) => {
    const format = formatScore(value);
    const color = (['gold', 'silver', 'bronze'] as const)[pos - 1];

    return (
        <PodiumPlayerContainer>
            <MedalContainer>
                <Medal bigger color={color}>
                    {pos}
                </Medal>
            </MedalContainer>

            <Title6>
                {name}
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
});

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

export interface LeaderboardProps<F extends FieldGroup, G extends FieldGroup> {
    hooks: BoardGameHooks<F, G>;
    calculate: (player: Player<F>) => number;
    reverse?: boolean,
}

function LeaderboardNoMemo<F extends FieldGroup, G extends FieldGroup>
    ({ hooks, calculate, reverse }: LeaderboardProps<F, G>) {
    const players = hooks.usePlayers();

    const sorted = useMemo(() => {
        const calculated = players.map((player) => ({
            player,
            value: calculate(player),
        }));
        calculated.sort((a, b) => (
            (b.value - a.value) * (reverse ? -1 : 1)
        ));
        return calculated;
    }, [players, calculate, reverse]);

    useEffect(() => {
        console.dir(players);
    }, [players]);

    //const [first, second, third, ...rest] = sorted;


    return (
        <LeaderboardContainer>
            {/* <Podium>
                <PodiumPlayer pos={3} value={third.value} name={third.player.name} />
                <PodiumPlayer pos={1} value={first.value} name={first.player.name} bigger />
                <PodiumPlayer pos={2} value={second.value} name={second.player.name} />
            </Podium> */}

            {sorted.map(({ player, value }, i) => (
                <RankItem key={player.pid} >

                    <Title6>
                        {i + 1}°
                    </Title6>

                    <Title6 css={{ flexGrow: 1 }}>
                        {player.name}
                    </Title6>
                    <Title6
                        css={{
                            fontWeight: 'normal',
                            color: 'GrayText',
                        }}
                    >
                        {formatScore(value)}
                    </Title6>
                </RankItem>
            ))}
        </LeaderboardContainer>

    );
};

export const Leaderboard = memo(LeaderboardNoMemo) as typeof LeaderboardNoMemo;