import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { saveString, loadString } from 'lib/utils';
import { Name, PlayerCard } from 'games/monopoly/PlayerCard';
//import OwnedProperties from 'components/OwnedProperties';
import { loadSave, LOCALSTORAGE_KEY, useBank } from 'lib/bankContext';
import { gameHooks, PlayerID } from 'lib/bx';
import { mono, Monopoly, MonopolyProperty, MonopolySettings, Transaction } from '.';
import { useImmer } from 'use-immer';

import MdHistory from '~icons/ic/round-history';
import MdLeaderboard from '~icons/ic/round-leaderboard';
import MdBusiness from '~icons/ic/round-business';
import MdAdd from '~icons/ic/round-add';

import { properties as untypedProperties } from './hasbro_argentina.json';
import { Dialog } from 'components/Dialog';
import { Panel, Paneled } from 'components/Paneled';
import { MPProperties } from './MPProperties';
import { AddPlayer } from './AddPlayer';
import { SendMoney } from './SendMoney';
import { styled } from 'lib/theme';
import { Status } from './Status';
import { BankCard } from './BankCard';
import { palettes } from 'lib/color';
import { Button, ButtonGroup } from 'components/Button';

const properties = untypedProperties as MonopolyProperty[];

const MainView = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    gap: '.5rem',
    alignItems: 'stretch',
});

const PlayerList = styled('div', {
    display: 'grid',
    padding: '1rem',
    gridAutoFlow: 'row',
    gridTemplateColumns: '1fr',
    gap: '.5rem',
    '@md': {
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    '@lg': {
        gridTemplateColumns: '1fr 1fr 1fr',
    },
});


const BANK = -1;
export const MonopolyView: FC<MonopolySettings> = ({ defaultMoney }) => {
    const board = mono.useBoard();
    const players = mono.usePlayers();

    const [sendingFrom, setFrom] = useState<PlayerID | null>(null);
    const [sendingTo, setTo] = useState<PlayerID | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
    const [history, produceHistory] = useImmer<Transaction[]>([]);

    const [deletingPlayer, setDeletingPlayer] = useState<PlayerID | null>(null);
    const deletingPlayerInfo = useMemo(() => {
        if (deletingPlayer != null) {
            const { name = '', palette = 0 } = board.get(deletingPlayer) ?? {};
            return { name, palette: palettes[palette] };
        } else {
            return { name: '', palette: palettes[0] };
        }
    }, [deletingPlayer]);

    const doDelete = useCallback(() => {
        if (deletingPlayer !== null) {
            board.remove(deletingPlayer);
            if (sendingFrom === deletingPlayer)
                setFrom(null);
            if (sendingTo === deletingPlayer)
                setTo(null);
            setDeletingPlayer(null);
        }
    }, [deletingPlayer]);

    function deletingDialogOpenChange() {
        setDeletingPlayer(null);
    }

    const [propertyOwners, produceProperyOwners] = useImmer(() => {
        const po = new Map<number, PlayerID>();
        for (const player of players) {
            for (const prop of player.facets.properties) {
                po.set(prop, player.pid);
            }
        }
        return po;
    });

    const orphanProperties = useMemo(() => (
        properties
            .map(({ id }) => id)
            .filter(id => !propertyOwners.has(id))
    ), [propertyOwners]);

    function onPlayerClicked(pid: PlayerID) {
        console.log('hwar');
        if (pid === sendingFrom) {
            setFrom(null);
        } else if (pid === sendingTo) {
            setTo(null);
        } else if (sendingFrom !== null) {
            setTo(pid);
        } else {
            setFrom(pid);
        }
    }

    function onPlayerIconClicked(pid: PlayerID) {
        setDeletingPlayer(pid);
    }

    function onPlayerAdded(pid: number) {
        board.set(pid, 'money', defaultMoney);
    }

    const sendMoney = useCallback((money: number) => {
        //TODO: properties duplicate when deselecting the [to] player

        const from = board.get(sendingFrom ?? -1);
        const to = board.get(sendingTo ?? -1);

        let names = [from?.name ?? 'Banco', to?.name ?? 'Banco'] as [string, string];

        if (from) board.set(from.pid, "money", from.facets.money - money);
        if (to) board.set(to.pid, "money", to.facets.money + money);

        if (selectedProperty !== null) {
            if (from) {
                board.set(from.pid, "properties", set => {
                    set.add(selectedProperty);
                });
                produceProperyOwners(draft => {
                    draft.set(selectedProperty, from.pid);
                });
            }
            if (to) {
                board.set(to.pid, "properties", set => {
                    set.delete(selectedProperty);
                });
                produceProperyOwners(draft => {
                    draft.delete(selectedProperty);
                });
            }
        }

        produceHistory(draft => {
            draft.push({
                id: draft.length,
                action: `${names[0]} le envio a ${names[1]}`,
                money,
            });
        });
        setFrom(null);
        setTo(null);
    }, [sendingFrom, sendingTo, selectedProperty]);

    function onTransactionConfirmed(money: number | null) {
        if (money === null) {
            setFrom(null);
            setTo(null);
        } else {
            sendMoney(money);
        }
    }

    useEffect(() => {
        if (sendingFrom === null && sendingTo === null)
            setSelectedProperty(null);
    }, [sendingFrom, sendingTo]);


    const playerElements = useMemo(() => (
        players.map(p => {
            const propertyColors: string[] = [];
            for (const property of p.facets.properties) {
                const prop = properties[property];
                if (prop) propertyColors.push(prop.block);
            }

            return (
                <PlayerCard
                    key={p.pid}
                    pid={p.pid}
                    palette={p.palette}
                    name={p.name}
                    properties={propertyColors}
                    money={p.facets.money}
                    from={sendingFrom === p.pid}
                    to={sendingTo === p.pid}
                    onClick={onPlayerClicked}
                    onIconClick={onPlayerIconClicked}
                />
            );
        })
    ), [players, sendingFrom, sendingTo]);

    let rank = 1;
    const rankingElements = useMemo(() => (
        [...players]
            .sort((a, b) => b.facets.money - a.facets.money)
            .map(p => (
                <li key={p.name}>
                    <span className="rank">{rank++}°</span>
                    <div>
                        <span className="name">{p.name}</span>
                        <span className="pts">$ {p.facets.money}</span>
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

    function onSendProperty(from: PlayerID, prop: number) {
        setTo(from);
        setSelectedProperty(prop);
    }

    return (
        <>
            <Paneled
                mainView={(
                    <MainView>
                        <Status
                            from={sendingFrom}
                            to={sendingTo}
                        />
                        {sendingFrom !== null && sendingTo !== null
                            ? (
                                <SendMoney
                                    from={sendingFrom}
                                    to={sendingTo}
                                    defaultValue={0}
                                    onConfirm={onTransactionConfirmed}
                                />
                            ) : (
                                <PlayerList>
                                    <BankCard onClick={onPlayerClicked} from={sendingFrom === BANK} to={sendingTo === BANK} />
                                    {playerElements}
                                </PlayerList>
                            )
                        }
                        <Dialog
                            open={deletingPlayer !== null}
                            palette={deletingPlayerInfo.palette}
                            onOpenChange={deletingDialogOpenChange}
                            titlebar={`Seguro que quiere borrar a ${deletingPlayerInfo.name}`}
                        >

                            <ButtonGroup>
                                <Button color="red" onClick={deletingDialogOpenChange}>No</Button>
                                <Button color="green" onClick={doDelete}>Borrar</Button>
                            </ButtonGroup>
                        </Dialog>
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
                    <ul className="rankings">{rankingElements}</ul>
                </Panel>
                <Panel
                    icon={<MdBusiness />}
                    name="Propiedades"
                >
                    <MPProperties
                        orphans={orphanProperties}
                        properties={properties}
                        onSendProperty={onSendProperty}
                        onPayRent={() => { }}
                    />
                </Panel>
                <Panel
                    icon={<MdAdd />}
                    name="Agregar"
                >
                    <AddPlayer afterAddingPlayer={onPlayerAdded} />
                </Panel>
            </Paneled>
        </>
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
