import { styled } from 'lib/theme';
import { ComponentProps, FC } from 'react';
const StyledGameCard = styled('div', {
    display: 'grid',
    padding: '1rem',
    borderRadius: '1rem',
    color: '$textContrast',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '6rem auto auto',

    'img': {
        alignSelf: 'center',
        justifySelf: 'center',
        height: '100%',
        paddingBottom: '1rem',
    },

    '@sm': {
        gridTemplateColumns: '5rem 1fr',
        gridTemplateRows: 'auto auto',
        gap: '0 1rem',
        'img': {
            width: '100%',
            gridRow: 'span 2',
            paddingBottom: '0',
        },
    },

    variants: {
        mode: {
            Monopoly: {
                background: 'linear-gradient(to bottom, #c45cc7, #494992)',
            },
            Cards: {
                background: 'linear-gradient(to bottom, #ee9140, #ad4040)',
            },
            Bingo: {
                background: 'linear-gradient(to bottom, #c45cc7, #ad4040)',
            },
        }
    }
});

export type Modes = Extract<ComponentProps<typeof StyledGameCard>['mode'], string>;

import monopolyURL from './icons/monopoly.svg';
import cardsURL from './icons/cards.svg';
import bingoURL from './icons/bingo.svg';
import { Title3 } from 'components/Title';

const gameModeToURL: Record<Modes, string> = {
    Monopoly: monopolyURL,
    Cards: cardsURL,
    Bingo: bingoURL,
};

interface GameCardProps extends ComponentProps<typeof StyledGameCard> {
    name: string,
    description: string,
    mode: Modes,
}
export const GameCard: FC<GameCardProps> = ({ name, description, mode, ...rest }) => {
    return (
        <StyledGameCard mode={mode} {...rest}>
            <img src={gameModeToURL[mode]} alt={mode} />
            <Title3>{name}</Title3>
            <p>{description}</p>
        </StyledGameCard>
    );
};