import { CSS, styled } from 'lib/theme';
import { ComponentProps, FC } from 'react';

import monopolyURL from './icons/monopoly.svg';
import cardsURL from './icons/cards.svg';
import bingoURL from './icons/bingo.svg';
import { Title3 } from 'components/Title';
import { Button } from 'components/Button';
import { Modes } from 'games';

const StyledGameIcon = styled('img', {
    flexShrink: 0,
    width: '5rem',
});

export const gameModeToIcon: Record<Modes, string> = {
    Monopoly: monopolyURL,
    Cards: cardsURL,
    Truco: cardsURL,
    Bingo: bingoURL,
};

export const GameIcon: FC<{ mode: Modes; }> = ({ mode }) => (
    <StyledGameIcon src={gameModeToIcon[mode]} alt={mode} />
);

export const gameModeToCSS: Record<Modes, CSS> = {
    Monopoly: {
        backgroundColor: '#a0b3de',
    },
    Cards: {
        backgroundColor: '#b3e4f2',
    },
    Truco: {
        backgroundColor: '#b3f2db',
    },
    Bingo: {
        backgroundColor: '#d993bc',
    },
};

const StyledGameCard = styled('div', {
    display: 'flex',
    padding: '1rem',
    borderRadius: '1rem',
    fontSize: '.8rem',
    gap: '1rem',

    '> img': {
        alignSelf: 'center',
        justifySelf: 'center',
        gridRow: 'span 2',
    },
    '> div': {
        alignSelf: 'center',
        flexGrow: 1,
    },
    [`> ${Button}`]: {
        alignSelf: 'end',
    },


    '@sm': {
        padding: '1rem',
        gridTemplateColumns: '5rem 1fr',
        fontSize: '1rem',
        height: '8rem',
    },

    variants: {
        compact: {
            true: {
                height: '6rem',
                'img': {
                    width: '1.25rem',
                    alignSelf: 'baseline'
                }
            }
        },
        mode: gameModeToCSS,
    }
});


export const gameModeToName: Record<Modes, string> = {
    Monopoly: "Monopolio",
    Cards: "Cartas",
    Truco: "Trucomatic",
    Bingo: "Lotería",
};

const gameModeToDescription: Record<Modes, string> = {
    Monopoly:
        `Un banco virtual que permite administrar el dinero y propiedades que
        pertenecen a cada jugador, transferirlas entre ellos, manteniendo un historial.`,
    Cards:
        `(trabajo en proceso) La tabla de puntaje tradicional. 
Agregue a los jugadores y sume puntos`,
    Truco:
        `Un elegante contador de puntos para el Truco, el tradicional juego de cartas argentino.`,
    Bingo:
        `Un bolillero virtual para usar en algún evento. Puede
usar la tecla espacio para sacar un numero`,
};

interface GameCardProps extends ComponentProps<typeof StyledGameCard> {
    mode: Modes,
}
export const GameCard: FC<GameCardProps> = ({ mode, ...rest }) => {
    return (
        <StyledGameCard mode={mode} {...rest}>
            <GameIcon mode={mode} />
            <div>
                <Title3>{gameModeToName[mode]}</Title3>
                <p>{gameModeToDescription[mode]}</p>
            </div>
        </StyledGameCard>
    );
};
