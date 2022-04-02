import produce from 'immer';
import { PlayerID, Player, FieldGroup, BoardGameHooks } from 'lib/bx';
import { tuple } from 'lib/utils';
import { ComponentProps, FC, memo, PropsWithChildren, useEffect, useMemo } from 'react';
import { styled } from 'lib/theme';
import { Title6 } from 'components/Title';
import { PlayerNameCard } from 'games/monopoly/PlayerCard';
import { Palette, palettes } from 'lib/color';

interface StandingPlayerProps {
    value: number;
    name?: string;
    palette: number;
    pos: 1 | 2 | 3;
}

const formatScore = (value: number) => value.toLocaleString() + ' pts';

const StandingPlayer = memo<StandingPlayerProps>(({ value = 0, name, palette, pos }) => {
    const format = formatScore(value);

    return (
        <Standing>
            {/* <MedalContainer>
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
            </Title6> */}
            {name && <div>
                <PlayerNameCard css={palettes[palette]}>{name}</PlayerNameCard>
                <p><small>{format}</small></p>
            </div>}
            <Stand position={pos}>{pos}</Stand>
        </Standing >
    );
});

const Podium = styled('div', {
    display: 'flex',
    alignItems: 'end',
});

const Standing = styled('div', {
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '2rem',
    gap: '.5rem',
    textAlign: 'center',
    width: 0,
    flex: 1,
    '*': {
        width: '100%',
    }
});

const Stand = styled('div', {
    display: 'block',
    paddingTop: '1rem',
    color: '$yellow900',
    textAlign: 'center',
    backgroundColor: '$yellow500',
    borderTopLeftRadius: '1rem',
    borderTopRightRadius: '1rem',
    alignSelf: 'stretch',
    fontSize: '2rem',
    fontFamily: '$title',
    fontWeight: 'bold',
    variants: {
        position: {
            1: {
                height: '8rem',
                backgroundColor: '$yellow300',
            },
            2: {
                height: '6.5rem',
            },
            3: {
                height: '5rem',
            },
        }
    }
});

const FullLeaderboard = styled('ol', {
    '> li': {
        display: 'flex',
        maxWidth: '100%',
        backgroundColor: '$yellow300',
        color: '$yellow900',
        justifyContent: 'space-between',
        padding: '.5rem 1rem',
        '> strong': {
            width: 0,
            flexGrow: 1,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        }
    },
    '> li:nth-child(2n)': {
        backgroundColor: '$yellow500',
    }
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
    overflow: 'hidden',
    padding: '1rem',
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

    const [first, second, third] = sorted;

    return (
        <LeaderboardContainer>
            <Podium>
                <StandingPlayer pos={3} palette={third?.player.palette} value={third?.value} name={third?.player.name} />
                <StandingPlayer pos={1} palette={first?.player.palette} value={first?.value} name={first?.player.name} />
                <StandingPlayer pos={2} palette={second?.player.palette} value={second?.value} name={second?.player.name} />
            </Podium>
            <FullLeaderboard>
                {sorted.map(({ player, value }, i) => (
                    <li key={player.pid}>
                        <strong>{i + 1}° {player.name}</strong>
                        <span>{formatScore(value)}</span>
                    </li>
                ))}
            </FullLeaderboard>
        </LeaderboardContainer>

    );
};

export const Leaderboard = memo(LeaderboardNoMemo) as typeof LeaderboardNoMemo;