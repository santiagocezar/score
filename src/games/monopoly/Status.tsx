import { Card } from 'components/Card';
import { PlayerID } from 'lib/bx';
import { styled } from 'lib/theme';
import { useContrastingPair } from 'lib/utils';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { BANK, mono } from '.';
import { BANK_PALETTE } from './BankCard';
import { SendMoney, SendMoneyProps } from './SendMoney';

import MdRight from '~icons/ic/baseline-chevron-right';
import MdPay from '~icons/ic/attach-money';
import { HEADER_HEIGHT } from 'components/Header';
import { Palette, palettes } from 'lib/color';


const Arrow = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3rem',
    height: '3rem',
    borderRadius: '3rem',
    marginX: '-1.5rem',
    backgroundColor: 'white',
    backgroundImage: 'linear-gradient(to right, $$l, $$r)',
    color: 'black',
    flexShrink: 0,
    transform: 'scale(0)',
    transition: 'transform .2s cubic-bezier(0.79,0.14,0.15,0.86)',

    variants: {
        show: {
            true: {
                transform: 'scale(1)'
            }
        }
    }
});

const NameBar = styled('div', {
    gridColumnStart: '1',
    gridColumnEnd: '-1',
    backgroundColor: '$bg200',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: '0',
    overflow: 'hidden',
    transition: 'height .2s cubic-bezier(0.79,0.14,0.15,0.86)',

    variants: {
        show: {
            true: {
                height: '3rem'
            }
        }
    }
});

const StyledName = styled('p', {
    $$color: 'transparent',
    $$text: 'inherit',
    backgroundColor: '$$p50',
    color: '$$contrast',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '1.2rem',
    transition: 'color .2s, background-color .2s, flex .2s cubic-bezier(0.79,0.14,0.15,0.86)',
    width: 0,
    flexGrow: 0,

    variants: {
        show: {
            true: {
                flexGrow: 1,
            }
        }
    }
});

interface NameProps {
    mode: 'from' | 'to';
    name?: string;
    palette?: Palette;
    show?: boolean;
}

const Name: FC<NameProps> = ({ mode, name, palette, show }) => {
    const [lastPalette, setLastPalette] = useState(palette);
    const [lastName, setLastName] = useState(name);

    useEffect(() => {
        if (show) setLastPalette(palette);
    }, [palette, show]);
    useEffect(() => {
        if (show) setLastName(name);
    }, [name, show]);



    return (
        <StyledName css={lastPalette ?? {}} show={show}>
            <span>{lastName && (mode === 'from' ? 'paga' : 'cobra')} <b>{lastName ?? 'Jugadores'}</b></span>
        </StyledName>
    );
};

const TopCard = styled('div', {
    position: 'sticky',
    backgroundColor: '$bg200',
    top: `-${HEADER_HEIGHT}`,
    marginTop: `-${HEADER_HEIGHT}`,
    padding: '1rem',
    paddingTop: `calc(${HEADER_HEIGHT} + 1rem)`,
    zIndex: '$header',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
});

interface StatusProps {
    from: number | null;
    to: number | null;
}

export const Status: FC<StatusProps> = ({ from, to }) => {
    const board = mono.useBoard();
    const players = mono.usePlayers();

    const get = useCallback((pid: PlayerID | null) => {
        if (pid === BANK)
            return ["Banco", BANK_PALETTE] as const;

        const player = pid === null ? undefined : board.get(pid);

        return [player?.name, player?.palette !== undefined ? palettes[player.palette] : undefined] as const;
    }, [players]);

    const [nameF, paletteF] = useMemo(() => get(from), [get, from]);
    const [nameT, paletteT] = useMemo(() => get(to), [get, to]);

    const showF = useMemo(() => !!nameF, [nameF]);
    const showT = useMemo(() => !!nameT, [nameT]);

    const noneShowing = useMemo(() => (!showF && !showT), [showF, showT]);


    return (
        <TopCard>
            <NameBar show>
                <Name mode="from" name={nameF} palette={paletteF} show={showF || noneShowing} />
                <Arrow
                    show={showF && showT}
                    css={{ $$l: paletteF?.$$p30, $$r: paletteT?.$$p30 }}
                ><MdPay /></Arrow>
                <Name mode="to" name={nameT} palette={paletteT} show={showT} />
            </NameBar>
        </TopCard>
    );
};