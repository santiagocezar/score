import { PlayerID } from 'lib/bx';
import { Palette, palettes } from 'lib/color';
import { CSS, keyframes, styled, transitions } from 'lib/theme';
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
    width: '2rem',
    height: '2rem',
    border: '.125rem solid transparent',
    borderRadius: '2rem',
    color: 'currentColor',
    overflow: 'hidden',
    transition: 'border-color .4s, color .2s .2s',

    variants: {
        active: {
            true: {
                color: '$$p50',
                borderColor: '$$p50',
            }
        }
    }
});

interface StatusIconProps {
    palette: Palette;
    icon: 'from' | 'to' | null;
}

const RocketInOut = transitions({
    always: {
        transition: 'transform .2s cubic-bezier(0.79,0.14,0.15,0.86)',
    },
    enterStart: {
        transform: 'translateY(120%)',
    },
    enterEnd: {
        transform: 'none',
    },
    exitEnd: {
        transform: 'translateY(-120%)',
    }
});

export const StatusIcon = memo<StatusIconProps>(({ palette, icon }) => {

    return (
        <StyledStatusIcon css={palette} active={!!icon}>
            <SwitchTransition>
                <RocketInOut
                    key={icon}
                    timeout={200}
                >
                    {icon === 'from'
                        ? <MdUpload />
                        : icon === 'to'
                            ? <MdDownload />
                            : <div />
                    }
                </RocketInOut>
            </SwitchTransition>
        </StyledStatusIcon>
    );
});

StatusIcon.toString = StyledStatusIcon.toString;

export type Icon = ComponentProps<typeof StatusIcon>['icon'] | undefined;

const NameAndStatus = styled('div', {
    display: 'flex',
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
    backgroundColor: '$$p50',
    color: '$$contrast',
    maxWidth: '100%',
    paddingX: '1rem',
    height: '2rem',
    lineHeight: '2rem',
    borderRadius: '2rem',
    alignItems: 'center',
    justifyContent: 'center',
    justifySelf: 'start',
    display: 'inline-block',
    verticalAlign: 'middle',
    textAlign: 'center',
    gap: '.5rem',
    fontSize: '1.2rem',
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

const StyledCard = styled('li', {
    overflow: 'hidden',
    display: 'grid',
    gridTemplate: `
        "name money" min-content
        "properties status" 2rem
        / 1fr min-content
    `,
    flexDirection: 'row',
    alignItems: 'start',
    padding: '.5rem',
    border: '.125rem solid $$p30',
    borderRadius: '1rem',
    backgroundColor: '$$p30',
    color: '$$p90',
    userSelect: 'none',
    flexShrink: '0',
    gap: '.5rem',

    transition: 'transform ease 0.2s, border-color .2s',

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
        transform: 'translateY(-2px)',
    },

    variants: {
        active: {
            true: {
                borderColor: '$$p50',
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
        <StyledCard css={palettes[palette]} active={from || to} onClick={() => onClick(pid)} >
            <NameAndStatus>
                <Name name={name} palette={palettes[palette]} />
                <StatusIcon
                    palette={palettes[palette]}
                    icon={from ? 'from' : to ? 'to' : null}
                />
            </NameAndStatus>
            <p className="money">$ {money}</p>
            <Stripes>
                {stripes}
            </Stripes>
            <ButtonGroup compact>
                <PlayerCardActions active={from} onDeleteClick={statusClick} />
            </ButtonGroup>
        </StyledCard>
    );
});
