import { Card } from 'components/Card';
import { FC, Fragment, useState, memo, ComponentProps } from 'react';
import { MonopolyProperty } from '.';
import { Button } from 'components/Button';
import { styled } from 'lib/theme';
import { Title5, Title6 } from 'components/Title';
import { useContrastingColor, useContrastingPair } from 'lib/utils';

import MdHome from '~icons/ic/round-home';
import MdTrain from '~icons/ic/round-train';
import MdServices from '~icons/ic/round-miscellaneous-services';
import { createPalette } from 'lib/color';

const Property = styled('div', {
    display: 'flex',
    flexDirection: 'row',
    userSelect: 'none',
    overflow: 'hidden',
    cursor: 'pointer',
    borderRadius: '1rem',
    padding: '.75rem .5rem .5rem .5rem',
    height: '5rem',
    backgroundColor: '$$p30',
    color: '$$p90',
});
const Icon = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '2rem',
    height: '2rem',
    borderRadius: '2rem',
    backgroundColor: '$$p50',
    marginRight: '.5rem',
    color: '$$contrast',
});
export const DynamicIcon = memo<{ prop: MonopolyProperty; className?: string; }>(({ prop, className }) => (
    <Icon className={className}>
        {prop.special === 'station'
            ? <MdTrain />
            : prop.special === 'service'
                ? <MdServices />
                : <MdHome />
        }
    </Icon>
));
DynamicIcon.toString = Icon.toString;

const Name = styled('p', {
    flexGrow: 1,
    lineHeight: '1.2rem',
    fontWeight: 'bold',
    fontSize: '1.2rem',
});
const Price = styled('p', {
    flexShrink: 0,
    alignSelf: 'end',
    fontSize: '1.5rem',
});

interface MPPropetyItemProps extends ComponentProps<typeof Property> {
    prop: MonopolyProperty;
}

export const MPPropertyItem: FC<MPPropetyItemProps>
    = memo(({ prop, ...rest }) => {
        return (
            <Property {...rest} css={createPalette(prop.block)}>
                <DynamicIcon prop={prop} />
                <Name>
                    {prop.name}
                </Name>
                <Price>
                    ${prop.price}
                </Price>
            </Property>
        );
    });