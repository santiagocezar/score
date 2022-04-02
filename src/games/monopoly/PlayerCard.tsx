import { PlayerID } from 'lib/bx';
import { Palette, palettes } from 'lib/color';
import { CSS, keyframes, paletteShadow, styled, transitions } from 'lib/theme';
import { useContrastingColor, useContrastingPair } from 'lib/utils';
import React, { Component, ComponentProps, FC, memo, MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react';

import MdDownload from '~icons/ic/round-file-download';
import MdUpload from '~icons/ic/round-file-upload';
import MdTrash from '~icons/ic/round-delete';
import { SwitchTransition } from 'react-transition-group';
import { Dialog } from 'components/Dialog';
import { PlayerCardActions } from './CardActions';
import { ButtonGroup } from 'components/Button';


const StyledStatusIcon = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '0',
    height: '0',
    marginRight: '-.5rem',
    backgroundColor: '$$p30',
    color: '$$p90',
    borderRadius: '2rem',
    overflow: 'hidden',
    opacity: 0,
    transition: `
        opacity .4s,
        width .4s, height .4s,
        margin-right .4s
    `,


    variants: {
        active: {
            true: {
                height: '2rem',
                width: '2rem',
                marginRight: '0',
                opacity: 1,
            }
        }
    }
});

interface StatusIconProps {
    palette: Palette;
    icon: 'from' | 'to' | null;
}

const Scale = transitions({
    always: {
        transition: 'transform .2s ease',
        imageRendering: '-moz-crisp-edges'
    },
    enterStart: {
        transform: 'scale(0)',
    },
    enterEnd: {
        transform: 'scale(1)',
    },
});

export const StatusIcon = memo<StatusIconProps>(({ palette, icon }) => {

    return (
        <StyledStatusIcon css={palette} active={!!icon}>
            <SwitchTransition>
                <Scale
                    key={icon}
                    timeout={200}
                >
                    {icon === 'from'
                        ? <MdUpload />
                        : icon === 'to'
                            ? <MdDownload />
                            : <div />
                    }
                </Scale>
            </SwitchTransition>
        </StyledStatusIcon>
    );
});

StatusIcon.toString = StyledStatusIcon.toString;

export type Icon = ComponentProps<typeof StatusIcon>['icon'] | undefined;

const NameAndStatus = styled('div', {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
});

const StyledStripe = styled('div', {
    $$color: 'red',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '1rem',
    height: '1.5rem',
    padding: '.125rem',
    backgroundColor: '$$p10',
    boxShadow: '$e1',
    marginTop: '-.125rem',
    marginRight: '-.5rem',
    marginBottom: '-1.3rem',
    '&:nth-child(3n)': {
        marginTop: '.125rem',
    },
    '&:nth-child(3n+1)': {
        marginTop: 0,
    },
    '&::before': {
        content: '',
        backgroundColor: '$$color',
        height: '.25rem',
    }
});

const Stripe = memo<{ c: string; }>(({ c }) => <StyledStripe css={{ $$color: c }} />);

const Stripes = styled('div', {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'flex-start',
    flexWrap: 'wrap',

    'p': {
        color: '$$p70',
        fontStyle: 'italic',
    }
});

const StyledName = styled('span', {
    //backgroundColor: '$$p50',
    maxWidth: '100%',
    paddingX: '.5rem',
    height: '2rem',
    lineHeight: '2rem',
    alignItems: 'center',
    justifyContent: 'center',
    justifySelf: 'start',
    display: 'inline-block',
    verticalAlign: 'middle',
    textAlign: 'center',
    gap: '.5rem',
    fontSize: '1.5rem',
    fontFamily: '$title',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

interface NameProps {
    name: string;
    palette: Palette;
}

export const Name: FC<NameProps> = ({ name, palette }) => {
    return <StyledName css={palette}>
        {name}
    </StyledName>;
};
Name.toString = StyledName.toString;

export const PlayerNameCard = styled('p', {
    display: 'inline-block',
    verticalAlign: 'middle',
    height: '2rem',
    lineHeight: '2rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 0,
    textAlign: 'center',
    fontSize: '1rem',
    fontFamily: '$title',
    fontWeight: 'bold',
    color: '$$contrast',
    borderRadius: '1rem',
    paddingX: '1rem',
    backgroundImage: 'linear-gradient(30deg, $$p40, $$p50)',
    boxShadow: paletteShadow.e2,
});

export const PlayerTitleCard = styled(PlayerNameCard, {
    height: '3rem',
    lineHeight: '3rem',
    fontSize: '1.5rem',
    marginTop: '1rem',
    marginX: '-1rem',
    borderRadius: '0',
});

export const StyledPlayerCard = styled('li', {
    overflow: 'hidden',
    display: 'grid',
    gridTemplate: `
        "name money" min-content
        "properties status" 2rem
        / 1fr min-content
    `,
    alignItems: 'start',
    padding: '.5rem',
    borderRadius: '1rem',
    backgroundColor: '$$p30',
    backgroundImage: 'linear-gradient(30deg, $$p40, transparent)',
    color: '$$p90',
    userSelect: 'none',
    flexShrink: '0',
    gap: '.5rem',
    boxShadow: paletteShadow.e2,

    transition: `
        transform ease .4s, color .2s,
        filter .2s, box-shadow .4s,
        background-color .2s
    `,

    '.money': {
        justifySelf: 'end',
        whiteSpace: 'nowrap',
        fontSize: '1.2rem',
    },

    [`${ButtonGroup}`]: {
        justifySelf: 'end',
    },

    '&:hover': {
        //boxShadow: 0px 6px 12px #0004,
        filter: 'brightness(.95)',
        //boxShadow: '0 .4rem 1rem $$p30',
    },

    variants: {
        active: {
            true: {
                boxShadow: paletteShadow.e3,
                color: '$$contrast',
                backgroundColor: '$$p50',
                transform: 'translateY(-.25rem)',
            }
        }
    }
});

type PlayerCardProps = {
    pid: PlayerID;
    palette: number;
    name: string;
    money: number;
    properties: string[];
    onClick: (pid: PlayerID) => void;
    onIconClick: (pid: PlayerID) => void;
    from: boolean;
    to: boolean;
};

export const PlayerCard = memo<PlayerCardProps>(({ pid, palette, name, money, properties, onClick, onIconClick, from, to }) => {
    const stripes = useMemo(() => {
        const s = properties.map((c) => <Stripe c={c} />);
        return s.length ? s : <p>Sin propiedades</p>;
    }, [properties]);

    const statusClick = useCallback(() => onIconClick(pid), [pid, onIconClick]);

    return (
        <StyledPlayerCard css={palettes[palette]} active={from || to} onClick={() => onClick(pid)} >
            <NameAndStatus>
                <StatusIcon
                    palette={palettes[palette]}
                    icon={from ? 'from' : to ? 'to' : null}
                />
                <Name name={name} palette={palettes[palette]} />
            </NameAndStatus>
            <p className="money">$ {money}</p>
            <Stripes>
                {stripes}
            </Stripes>
            <ButtonGroup compact>
                <PlayerCardActions active={from} onDeleteClick={statusClick} />
            </ButtonGroup>
        </StyledPlayerCard>
    );
});
