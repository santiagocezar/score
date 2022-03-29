import { styled } from 'lib/theme';
import { ComponentProps, FC, useState } from 'react';
import monopolyURL from './icons/monopoly.svg';
import cardsURL from './icons/cards.svg';
import bingoURL from './icons/bingo.svg';
import { Title3 } from 'components/Title';
import { Button, ButtonGroup } from 'components/Button';
import { MatchItemType } from './Home';
import { GameIcon, gameModeToCSS, gameModeToIcon, gameModeToName } from './GameCard';
import { MatchData } from 'lib/bx';
import { listPlayers } from 'lib/utils';
import { Modes } from 'games';


const MatchChip = styled('div', {
    display: 'flex',
    paddingX: '1rem',
    gap: '.5rem',
    height: '2rem',
    borderRadius: '2rem',
    alignSelf: 'start',
    alignItems: 'center',
    fontWeight: 'bold',

    [`${GameIcon}`]: {
        width: '1.25rem',
    },

    variants: {
        mode: gameModeToCSS
    },
});

const ButtonChip = styled(Button, {
    paddingX: '1rem',
    height: '2rem',
    borderRadius: '2rem',
});
const StyledMatchCard = styled('div', {
    display: 'flex',
    userSelect: 'none',
    flexDirection: 'column',
    borderRadius: '1rem',
    padding: '1rem',
    gap: '.5rem',
    backgroundColor: '$bg200',

    [`${ButtonChip}`]: {
        alignSelf: 'end',
    }
});

interface MatchCardProps extends ComponentProps<typeof StyledMatchCard> {
    match: MatchItemType,
    onDeleteClick?: (id: string) => void;
}
export const MatchCard: FC<MatchCardProps> = ({ match, onDeleteClick, ...rest }) => {
    const mode = match.mode as Modes;
    const item = localStorage.getItem(match.id) ?? '{}';
    const parsed = MatchData.safeParse(JSON.parse(item));

    if (parsed.success) {
        const players = parsed.data.game.players.map(p => p.name);
        return (
            <StyledMatchCard  {...rest}>
                <MatchChip mode={mode}>
                    <img src={gameModeToIcon[mode]} alt={mode} />
                    {gameModeToName[mode]}
                </MatchChip>
                <div>
                    <Title3>{match.name}</Title3>
                    <p>{listPlayers(players)}</p>
                </div>
                <ButtonChip
                    onClick={ev => {
                        onDeleteClick?.(match.id);
                        ev.stopPropagation();
                    }}
                    color="red"
                >
                    Borrar
                </ButtonChip>
            </StyledMatchCard>
        );
    } else {
        return null;
    }

};
