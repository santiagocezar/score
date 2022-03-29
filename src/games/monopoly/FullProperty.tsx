import { Card } from 'components/Card';
import { FC, Fragment, useState, memo, ComponentProps, ReactNode, useMemo, useCallback } from 'react';
import { BANK, mono, MonopolyProperty } from '.';
import { Button, ButtonGroup } from 'components/Button';
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
import { PlayerFor, PlayerID } from 'lib/bx';

interface PropertyActions {
    onPayRent: (amount: number) => void;
    onTransfer: () => void;
}

const Note = styled('p', {
    fontSize: '.8rem',
    textAlign: 'center',
    lineHeight: '1em',
    paddingX: '1rem',
});

interface ManagePropertyProps extends PropertyActions {
    prop: MonopolyProperty;
    fullBlock: boolean;
    housesInBlock: boolean;
    owner?: PlayerFor<typeof mono>;
}

const ManageProperty: FC<ManagePropertyProps>
    = ({ prop, fullBlock, housesInBlock, owner, onTransfer, onPayRent }) => {
        const board = mono.useBoard();


        const ownedProperty = owner?.fields.properties.get(prop.id);

        const changeHouses = useCallback((amount: number) => {
            if (ownedProperty && owner) {
                board.set(owner.pid, fields => {
                    const propertyField = fields.properties.get(prop.id)!;
                    propertyField.houses = Math.min(Math.max(0, propertyField.houses + amount), 5);
                    fields.money -= amount * (prop.housing ?? 0) / (amount > 0 ? 1 : 2);
                });
            }
        }, [ownedProperty, owner, prop]);

        const { houses = 0, mortgaged = false } = ownedProperty ?? {};

        const onMortgage = useCallback(() => {
            if (ownedProperty && owner) {
                board.set(owner.pid, fields => {
                    const propertyField = fields.properties.get(prop.id)!;
                    propertyField.mortgaged = !propertyField.mortgaged;
                    // when mortgaged it gives the player half the price of the property
                    // and to lift it half plus 10% interest
                    fields.money += propertyField.mortgaged ? prop.price * .5 : - prop.price * .55;
                });
            }
        }, [ownedProperty, owner, mortgaged]);

        const rentValue = useMemo(() => (
            houses > 0
                ? prop.rent?.[houses] ?? 0
                : (prop.rent?.[0] ?? 0) * (fullBlock ? 2 : 1)
        ), [onPayRent, houses]);

        const onPayRentClick = useCallback(() => {
            onPayRent(rentValue);
        }, [rentValue]);



        return (<>
            <Button color="green" disabled={housesInBlock || houses > 0} onClick={onTransfer}>Transferir</Button>
            {owner && (<>
                <Button disabled={housesInBlock || houses > 0} onClick={onMortgage}>{mortgaged ? 'Levantar hipoteca' : 'Hipotecar'}</Button>
                {houses > 0 && <Note>Para transferir o hipotecar, venda todos los edificios en esta propiedad.</Note>}
                {housesInBlock && houses <= 0 && <Note>Para transferir o hipotecar, venda los edificios en las otras propiedades del mismo color.</Note>}
                <Button onClick={onPayRentClick} color="blue">Pagar alquiler (${rentValue})</Button>
                <ButtonGroup>
                    <Button onClick={() => changeHouses(-1)} disabled={houses <= 0}> Vender {houses === 5 ? <MdHotel /> : <MdHome />}</Button>
                    <Button onClick={() => changeHouses(+1)} disabled={houses >= 5 || !fullBlock} color={houses >= 4 ? "blue" : "red"}>Comprar {houses >= 4 ? <MdHotel /> : <MdHome />}</Button>
                </ButtonGroup>
                {fullBlock || <Note>Para edificar, necesita el grupo completo de propiedades.</Note>}
            </>)}
        </>);
    };
const Rent = styled('div', {
    display: 'flex',
    flexDirection: 'column',
});
const Disclaimer = styled('div', {
    textAlign: 'center',
    paddingY: '1rem',
});

const StyledRow = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingX: '1rem',
    height: '2rem',
    border: '.125rem solid transparent',
    borderRadius: '1rem',
    $$color: '$colors$text',

    '.u-icon': {
        color: '$$color',
        marginRight: '.5rem',
    },
    variants: {
        type: {
            house: {
                $$color: '$colors$red500',
            },
            hotel: {
                $$color: '$colors$blue500',
            },
            train: {
                $$color: '$colors$text',
            },
        },
        active: {
            true: {
                fontWeight: 'bold',
                borderColor: '$$color',
            }
        }
    }
});
interface RowProps extends ComponentProps<typeof StyledRow> {
    left: ReactNode;
    price: number;
}
const Row: FC<RowProps> = ({ left, price, ...rest }) => (
    <StyledRow {...rest}>
        <div>{left}</div>
        <p>${price}</p>
    </StyledRow>
);

interface PropertyInformationProps {
    prop: MonopolyProperty;
    owned?: boolean;
    houses?: number;
    fullBlock?: boolean;
}

const PropertyInformation: FC<PropertyInformationProps>
    = ({ prop, owned, houses, fullBlock }) => (<>
        <Rent>
            {prop.special === 'station'
                ? (<>
                    {prop.rent?.map((price, i) => (
                        <Row
                            key={i}
                            price={price}
                            left={
                                <>
                                    <MdTrain />
                                    Con {i + 1} {plural('estacion', 'es', i)}
                                </>
                            }
                        />
                    ))}
                </>)
                : (<>
                    <Row active={owned && !fullBlock && !houses} left="Alquiler" price={prop.rent?.[0] ?? 0} />
                    <Row active={fullBlock && !houses} left="Con el grupo completo" price={(prop.rent?.[0] ?? 0) * 2} />
                    {prop.rent?.map((price, i) => i != 0 && (
                        <Row
                            key={i}
                            price={price}
                            active={houses === i}
                            type={i == 5 ? "hotel" : "house"}
                            left={
                                <>
                                    {i == 5 ? <MdHotel /> : <MdHome />}
                                    {i != 5 ? `Con ${i} ${plural('casa', i)}` : 'Con hotel'}
                                </>
                            }
                        />
                    ))}
                </>)
            }
        </Rent>
        <Disclaimer>
            <p>Costo de compra de la propiedad: ${prop.price}</p>
            {prop.housing !== undefined &&
                <p>Costo de cada casa u hotel: ${prop.housing}</p>
            }
        </Disclaimer>
    </>);


const BigDynamicIcon = styled(DynamicIcon, {
    width: '6rem',
    height: '6rem',
    borderRadius: '6rem',
    '.u-icon': {
        width: '48px',
        height: '48px',
    }
});

const PropertyContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '1rem',
    gap: '.5rem'
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
});
const Actions = styled('div', {
    display: 'flex',
    gap: '.5rem',
    alignSelf: 'end',
});

interface MPPropetyInfoProps extends PropertyActions {
    properties: MonopolyProperty[];
    prop: MonopolyProperty;
    owner: PlayerID;
    onGoBack: () => void;
}


export const MPPropertyInfo: FC<MPPropetyInfoProps>
    = memo(({ properties, prop, owner, onGoBack, ...actions }) => {
        console.log(owner);
        const player = mono.usePlayer(owner);

        const [fullBlock = false, housesInBlock = false] = useMemo(() => {
            if (!player) return [];
            let housesInBlock = false;

            let propertiesForBlock = 0;
            for (const p of properties) {
                if (p.block === prop.block)
                    propertiesForBlock++;
            }

            let ownedOfBlock = 0;
            for (const p of player.fields.properties.values()) {
                if (properties[p.id].block === prop.block) {
                    if (p.id !== prop.id && p.houses > 0)
                        housesInBlock = true;
                    ownedOfBlock++;
                }
            }

            return [ownedOfBlock === propertiesForBlock, housesInBlock];
        }, [player, prop, properties]);

        const houses = useMemo(() => {
            return player?.fields.properties.get(prop.id)?.houses;
        }, [player]);

        const palette = createPalette(prop.block);

        return (
            <PropertyContainer>
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
                </PropertyHeader>
                <ManageProperty
                    prop={prop}
                    owner={player}
                    housesInBlock={housesInBlock}
                    fullBlock={fullBlock}
                    {...actions}
                />
                <PropertyInformation prop={prop} owned={owner !== BANK} fullBlock={fullBlock} houses={houses} />
            </PropertyContainer>
        );
    });