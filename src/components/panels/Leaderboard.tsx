import produce from 'immer';
import { PlayerID, Player, FieldGroup, BoardGameHooks } from 'lib/bx';
import { tuple } from 'lib/utils';
import { ComponentProps, FC, memo, PropsWithChildren, useEffect, useMemo } from 'react';
import { styled } from 'lib/theme';
import { Title6 } from 'components/Title';
import { PlayerNameCard } from 'games/monopoly/PlayerCard';
import { Palette, palettes } from 'lib/color';

const formatScore = (value: number) => value.toLocaleString() + ' pts';

const Podium = styled('div', {
    display: 'flex',
    alignItems: 'end',
});

const Names = styled('div', {
    display: 'grid',
    gap: '.5rem 2rem',
    paddingBottom: '.5rem',
    gridTemplateColumns: '1fr 1fr',
    justifyItems: 'center',
    '> *': {
        maxWidth: '100%',
    },
    '> *:first-child': {
        gridColumn: 'span 2',
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
    fontSize: '2rem',
    fontFamily: '$title',
    fontWeight: 'bold',
    height: '5rem',
    width: 0,
    flex: 1,
    variants: {
        first: {
            true: {
                height: '7rem',
                backgroundColor: '$yellow300',
            },
        }
    }
});

const FullLeaderboard = styled('ol', {
    overflow: 'hidden',
    borderBottomLeftRadius: '1rem',
    borderBottomRightRadius: '1rem',

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
            <Names>
                {first && <PlayerNameCard css={palettes[first.player.palette]}>{first.player.name}</PlayerNameCard>}
                {second && <PlayerNameCard css={palettes[second.player.palette]}>{second.player.name}</PlayerNameCard>}
                {third && <PlayerNameCard css={palettes[third.player.palette]}>{third.player.name}</PlayerNameCard>}
            </Names>
            <Podium>
                <Stand>2</Stand>
                <Stand first>1</Stand>
                <Stand>3</Stand>
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