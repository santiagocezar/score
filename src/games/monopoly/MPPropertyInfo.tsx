import { Card } from 'components/Card';
import { FC, Fragment, useState, memo, ComponentProps, ReactNode } from 'react';
import { MonopolyProperty } from '.';
import { Button } from 'components/Button';
import { iconCSS, styled } from 'lib/theme';
import { Title5, Title6 } from 'components/Title';
import { plural, useContrastingColor } from 'lib/utils';

import MdBack from '~icons/ic/round-arrow-back';
import MdHome from '~icons/ic/round-home';
import MdHotel from '~icons/ic/round-maps-home-work';
import MdPay from '~icons/ic/attach-money';
import MdTrain from '~icons/ic/round-train';
import { HEADER_HEIGHT } from 'components/Header';
import { createPalette } from 'lib/color';
import { DynamicIcon } from './MPPropertyItem';

const RedHome = styled(MdHome, {
    ...iconCSS,
    color: '$red500',
    marginRight: '.5rem',
});
const BlueHotel = styled(MdHotel, {
    ...iconCSS,
    color: '$blue500',
    marginRight: '.5rem',
});
const BlackTrain = styled(MdTrain, {
    ...iconCSS,
    color: '$text',
    marginRight: '.5rem',
});

const PropertyContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '.5rem',
});
const PropertyHeader = styled('header', {
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'column',
    padding: '.5rem',
    gap: '.5rem',
    backgroundColor: '$$p30',
    color: '$$p90',
    borderRadius: '1rem',
    margin: '1rem',
});
const Actions = styled('div', {
    display: 'flex',
    gap: '.5rem',
    alignSelf: 'end',
});
const Rent = styled('table', {
    borderCollapse: 'collapse',
    alignSelf: 'stretch',
    textAlign: 'right',

    '& td': {
        border: '1px solid $bg200',
        padding: '.25rem .5rem'
    },
    '& tr:first-child td': {
        borderTop: 0,
    },
    '& tr:last-child td': {
        borderBottom: 0,
    },
    '& tr td:first-child': {
        borderLeft: 0,
        textAlign: 'left',
    },
    '& tr td:last-child': {
        borderRight: 0,
        width: '1%',
    },
});
const Disclaimer = styled('div', {
    textAlign: 'center',
    paddingY: '1rem',
});

interface RowProps extends ComponentProps<'tr'> {
    left: ReactNode;
    price: number;
}
const Row: FC<RowProps> = ({ left, price }) => (
    <tr>
        <td>
            <p>{left}</p>
        </td>
        <td>
            <p>${price}</p>
        </td>
    </tr>
);

const BigDynamicIcon = styled(DynamicIcon, {
    width: '6rem',
    height: '6rem',
    borderRadius: '6rem',
    '.u-icon': {
        width: '48px',
        height: '48px',
    }
});

interface MPPropetyInfoProps extends ComponentProps<typeof PropertyContainer> {
    prop: MonopolyProperty;
    banks?: boolean;
    onGoBack: () => void;
    onPayRent: (idx: number) => void;
    onTransfer: () => void;
}


export const MPPropertyInfo: FC<MPPropetyInfoProps>
    = memo(({ prop, banks, onGoBack, onPayRent, onTransfer, ...rest }) => {
        const palette = createPalette(prop.block);

        const pay = (idx: number) => banks
            ? undefined
            : () => onPayRent(idx);

        return (
            <PropertyContainer {...rest}>
                <PropertyHeader css={palette}>
                    <Button
                        color="palette"
                        onClick={onGoBack}
                        css={{ alignSelf: 'start' }}
                    >
                        <MdBack />
                        Volver al listado
                    </Button>
                    <BigDynamicIcon prop={prop} />
                    <Title5>
                        {prop.name}
                    </Title5>
                    <Actions>
                        <Button color="palette" onClick={onTransfer}>Transferir</Button>
                        {false && <Button color="palette" >Hipotecar (${prop.price / 2})</Button>}
                    </Actions>
                </PropertyHeader>
                <Rent>
                    {prop.special === 'station'
                        ? (
                            <>
                                {prop.rent?.map((price, i) => (
                                    <Row
                                        key={i}
                                        price={price}
                                        left={
                                            <>
                                                <BlackTrain />
                                                Con {i + 1} {plural('estacion', 'es', i)}
                                            </>
                                        }
                                    />
                                ))}
                            </>
                        )
                        : (
                            <>
                                <Row left="Alquiler" price={prop.rent?.[0] ?? 0} />
                                <Row left="Con el grupo completo" price={(prop.rent?.[0] ?? 0) * 2} />
                                {prop.rent?.map((price, i) => i != 0 && (
                                    <Row
                                        key={i}
                                        price={price}
                                        left={
                                            <>
                                                {i == 5 ? <BlueHotel /> : <RedHome />}
                                                {i != 5 ? `Con ${i} ${plural('casa', i)}` : 'Con hotel'}
                                            </>
                                        }
                                    />
                                ))}
                            </>
                        )
                    }
                </Rent>
                <Disclaimer>
                    <p>Costo de compra de la propiedad: ${prop.price}</p>
                    {prop.housing &&
                        <p>Costo de cada casa u hotel: ${prop.housing}</p>
                    }
                </Disclaimer>
            </PropertyContainer>
        );
    });