import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { saveString, loadString, useCompareFn } from 'lib/utils';
import { Name, PlayerCard } from 'games/monopoly/PlayerCard';
//import OwnedProperties from 'components/OwnedProperties';
import { loadSave, LOCALSTORAGE_KEY, useBank } from 'lib/bankContext';
import { gameHooks, PlayerFor, PlayerID } from 'lib/bx';
import { mono, Monopoly, MonopolyProperty, MonopolySettings, Transaction } from '.';
import { useImmer } from 'use-immer';

import MdHistory from '~icons/ic/round-history';
import MdLeaderboard from '~icons/ic/round-leaderboard';
import MdBusiness from '~icons/ic/round-business';

import { properties as untypedProperties } from './hasbro_argentina.json';
import { Dialog } from 'components/Dialog';
import { Panel, Paneled } from 'components/panels';
import { MPProperties } from './MPProperties';
import { AddPlayer, useAddPlayerPanel } from 'components/panels/AddPlayer';
import { SendMoney } from './SendMoney';
import { styled } from 'lib/theme';
import { Status } from './Status';
import { BankCard } from './BankCard';
import { palettes } from 'lib/color';
import { Button, ButtonGroup } from 'components/Button';
import { Leaderboard } from 'components/panels/Leaderboard';
import { PlayerList } from './PlayerList';
import { SelectionProvider } from './Selection';
import { HEADER_HEIGHT } from 'components/Header';

const properties = untypedProperties as MonopolyProperty[];

const MainView = styled('div', {
    display: 'flex',
    position: 'relative',
    height: `calc(100% + ${HEADER_HEIGHT})`,
    flexDirection: 'column',
    gap: '.5rem',
    overflow: 'auto',
    alignItems: 'stretch',
    marginTop: `-${HEADER_HEIGHT}`,
});


const BANK = -1;
export const MonopolyView: FC<MonopolySettings> = ({ defaultMoney }) => {
    const board = mono.useBoard();
    const players = mono.usePlayers();

    const history = mono.useGlobal('history');

    function onPlayerAdded(pid: number) {
        board.set(pid, fields => {
            fields.money = defaultMoney;
        });
    }

    const calculatePlayerValue = useCallback((player: PlayerFor<typeof mono>) => {
        return player.fields.money + Array.from(
            player.fields.properties.values(),
            ({ id, ...rest }) => ({
                prop: properties[id],
                ...rest
            })
        ).reduce((acc, curr) => (
            acc + ((curr.mortgaged ? 0 : curr.prop.price) + curr.houses * (curr.prop.housing ?? 0))
        ), 0);
    }, [properties]);


    let rank = 1;
    const rankingElements = useMemo(() => (
        [...players]
            .sort((a, b) => b.fields.money - a.fields.money)
            .map(p => (
                <li key={p.name}>
                    <span className="rank">{rank++}°</span>
                    <div>
                        <span className="name">{p.name}</span>
                        <span className="pts">$ {p.fields.money}</span>
                    </div>
                </li>
            ))
    ), [players]);

    const transactionItems = useMemo(() => (
        history.map(h => (
            <li key={h.id}>
                <div>
                    <span className="name">{h.action}</span>
                    <span className="pts">${h.money}</span>
                </div>
            </li>
        ))
    ), [history]);

    return (
        <SelectionProvider>
            <Paneled
                mainView={(
                    <MainView>
                        <SendMoney {...{ properties }} />
                        <PlayerList {...{ properties }} />
                    </MainView>
                )}
            >
                <Panel
                    icon={<MdHistory />}
                    name="Historial"
                >
                    <ul className="history">
                        {transactionItems.reverse()}
                        <p className="empty">Historial vacío.</p>
                    </ul>
                </Panel>
                <Panel
                    icon={<MdLeaderboard />}
                    name="Rankings"
                >
                    <Leaderboard hooks={mono} calculate={calculatePlayerValue} />
                </Panel>
                <Panel
                    icon={<MdBusiness />}
                    name="Propiedades"
                >
                    <MPProperties
                        properties={properties}
                    />
                </Panel>
                {useAddPlayerPanel(onPlayerAdded)}
            </Paneled>
        </SelectionProvider>
        //<div className="_MP">

        //     <Sidebar open={openedSidebar == Sidebars.History}>
        //         <ul className="history">
        //             {transactionItems.reverse()}
        //             <p className="empty">Historial vacío.</p>
        //         </ul>
        //     </Sidebar>

        //     <Sidebar open={openedSidebar == Sidebars.Ranks}>
        //         <ul className="rankings">{rankingElements}</ul>
        //     </Sidebar>

        //     {defaultMoney}
        //     <OwnedProperties
        //         properties={shownProperties}
        //         selected={selectedProperty}
        //         // empty={properties == null || properties.length == 0}
        //         // onImport={importProperties}
        //         onPropertyClicked={(id) => setSelectedProperty(id)}
        //     />
        // </div>
    );
};
