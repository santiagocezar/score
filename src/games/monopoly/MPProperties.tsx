import { FC, Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react';
//import { PlayerID, PlayerInfo, useGame } from 'lib/game';
import { MPPropertyItem } from './MPPropertyItem';
//import { Avatar, PlayerAvatar } from 'components/PlayerAvatar';
import { Title5, Title6 } from 'components/Title';
import { styled } from 'lib/theme';
//import { Divider } from 'ui/Blocks';
import { MPPropertyInfo } from './FullProperty';
//import { useContextSelector } from 'use-context-selector';

import MdBank from '~icons/ic/round-account-balance';
import { BANK, mono, MonopolyProperty } from '.';
import { Name, PlayerTitleCard } from './PlayerCard';
import { PlayerID } from 'lib/bx';
import { usePanelGoTo } from 'components/panels';
import { BANK_PALETTE } from './BankCard';
import { Card } from 'components/Card';
import { palettes } from 'lib/color';

const PropertiesContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '1rem',
    gap: '.5rem',

    [`${Name}`]: {
        marginTop: '1rem',
    }
});
const PropertiesList = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    gap: '.5rem',

});


interface MPPropertiesProps {
    properties: MonopolyProperty[];
    onSendProperty: (from: PlayerID, prop: number) => void;
    onPayRent: (to: PlayerID, amount: number) => void;
    orphans: number[];
}

export const MPProperties = memo<MPPropertiesProps>(({ properties, orphans, onPayRent, onSendProperty }) => {
    const players = mono.usePlayers();

    const [viewingProperty, viewProperty] = useState<MonopolyProperty | null>(null);
    const ownerOfProperty = useMemo(() => {
        if (viewingProperty) {
            const owner = players.find(p => p.fields.properties.has(viewingProperty.id));
            return owner?.pid ?? BANK;
        } else {
            return BANK;
        }
    }, [players, viewingProperty]);

    const goTo = usePanelGoTo();

    const ownedProperties = useMemo(() => (
        players.filter(p => p.fields.properties.size > 0)
            .map(p => ({
                player: p,
                properties: Array.from(
                    p.fields.properties.values(),
                    ({ id, ...rest }) => ({
                        prop: properties[id],
                        ...rest,
                    })
                )
            }))
    ), [properties, players]);

    const disownedProperties = useMemo(() => (
        orphans.map(i => [properties[i], i] as const)
    ), [properties, orphans]);

    const transferProperty = useCallback(() => {
        onSendProperty(ownerOfProperty, viewingProperty!.id);
        goTo('-1');
    }, [ownerOfProperty, viewingProperty]);

    const payPropertyRent = useCallback((amount: number) => {
        onPayRent(ownerOfProperty, amount);
        goTo('-1');
    }, [ownerOfProperty, onPayRent]);
    // function payPropertyRent(idx: number) {
    //     const prop = monopoly.properties.get(viewingProperty!)!;
    //     console.log(idx);
    //     console.log(prop.rent);
    //     transfer({
    //         to: monopoly.propertiesOwner.get(viewingProperty!) ?? BANK,
    //         defaultValue: prop.rent?.[idx] ?? 0
    //     });
    // }

    if (viewingProperty !== null) {
        return (
            <MPPropertyInfo
                properties={properties}
                prop={viewingProperty}
                owner={ownerOfProperty}
                onGoBack={() => viewProperty(null)}
                onPayRent={payPropertyRent}
                onTransfer={transferProperty}
            />
        );
    }

    return (
        <PropertiesContainer>
            <Title5>Propiedades</Title5>
            {ownedProperties.map(({ player, properties }) => (
                <Fragment key={player.pid}>
                    <PlayerTitleCard children={'de ' + player.name} css={palettes[player.palette]} />
                    <PropertiesList>
                        {properties.map(({ prop, houses, mortgaged }) => (
                            <MPPropertyItem
                                key={prop.id}
                                onClick={() => {
                                    viewProperty(prop);
                                }}
                                houses={houses}
                                mortgaged={mortgaged}
                                prop={prop}
                            />
                        ))}
                    </PropertiesList>
                    <br />
                </Fragment>
            ))}
            <PlayerTitleCard children="del Banco" css={BANK_PALETTE} />
            <PropertiesList>
                {disownedProperties.map(([prop, id]) => (
                    <MPPropertyItem
                        key={id}
                        onClick={() => {
                            viewProperty(prop);
                        }}
                        prop={prop}
                    />
                ))}
            </PropertiesList>
        </PropertiesContainer>
    );
});

