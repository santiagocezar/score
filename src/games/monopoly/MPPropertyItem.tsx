import { FC, memo, ComponentProps } from 'react';
import { MonopolyProperty } from '.';
import { styled } from 'lib/theme';
import { plural } from 'lib/utils';

import MdHome from '~icons/ic/round-home';
import MdTrain from '~icons/ic/round-train';
import MdServices from '~icons/ic/round-miscellaneous-services';
import { createPalette } from 'lib/color';

const Property = styled('div', {
    display: 'grid',
    gridTemplateColumns: 'fit-content 1fr',
    gridTemplateRows: 'min-content min-content',
    alignItems: 'center',
    userSelect: 'none',
    overflow: 'hidden',
    cursor: 'pointer',
    borderRadius: '1rem',
    boxShadow: '$e2',
    padding: '.5rem',
    color: '$$p90',
    variants: {
        mortgaged: {
            true: {
                border: '.5rem solid $bg100',
                paddingY: '0',
                backgroundColor: '$blue800',
                color: '$textContrast',
            }
        }
    },
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

DynamicIcon.displayName = "DynamicIcon";
DynamicIcon.toString = Icon.toString;

const Name = styled('p', {
    display: 'flex',
    gridColumn: 'span 2',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: '2rem',
    backgroundImage: 'linear-gradient(30deg, $$p40, $$p50)',
    color: '$$contrast',
    borderRadius: '.5rem',

    flexGrow: 1,
    lineHeight: '1rem',

    fontWeight: 'bold',
    fontFamily: '$title',
    fontSize: '1rem',
    variants: {
        mortgaged: {
            true: {
                background: 'none',
                color: 'inherit',
            }
        }
    },
});
const Price = styled('p', {
    flexShrink: 0,

    justifySelf: 'end',
    fontSize: '1.5rem',
});
const Houses = styled('p', {
    color: '$$p70',
    fontStyle: 'italic',
    variants: {
        mortaged: {
            true: {
                color: 'inherit',
            }
        }
    }
});

interface MPPropetyItemProps extends ComponentProps<typeof Property> {
    prop: MonopolyProperty;
    houses?: number;
    mortgaged?: boolean;
}

export const MPPropertyItem: FC<MPPropetyItemProps>
    = memo(({ prop, houses, mortgaged: mortaged, ...rest }) => {
        return (
            <Property {...rest} mortgaged={mortaged} css={createPalette(prop.block)}>
                <Name mortgaged={mortaged}>
                    {prop.name}
                </Name>
                <Houses mortaged={mortaged}>
                    {mortaged
                        ? 'Hipotecada'
                        : houses === undefined
                            ? 'Sin dueño'
                            : houses === 5
                                ? 'Con hotel'
                                : houses
                                    ? `Con ${houses} ${plural('casa', houses)}`
                                    : 'Sin casas'
                    }
                </Houses>
                <Price>
                    ${prop.price}
                </Price>
            </Property>
        );
    });

MPPropertyItem.displayName = "MPPropertyItem";