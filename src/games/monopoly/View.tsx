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

function usePlayerProperties() {
    const players = mono.usePlayers();

    const playerProperties = useMemo(() => (
        players
            .map(p => p.fields.properties)
            .filter(set => !!set.size)
    ), [players]);

    return useCompareFn(
        playerProperties,
        (prev, next) => prev.every((prevItem, i) => prevItem === next[i]),
        [players]
    );
}

const BANK = -1;
export const MonopolyView: FC<MonopolySettings> = ({ defaultMoney }) => {
    const board = mono.useBoard();
    const players = mono.usePlayers();

    const [sendingFrom, setFrom] = useState<PlayerID | null>(null);
    const [sendingTo, setTo] = useState<PlayerID | null>(null);
    const [defaultAmount, setDefaultAmount] = useState(0);
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

    const [history, produceHistory] = useImmer<Transaction[]>([]);

    const playerProperties = usePlayerProperties();

    const orphanProperties = useMemo(() => (
        properties
            .map(({ id }) => id)
            .filter(id => !playerProperties.some(set => set.has(id)))
    ), [playerProperties]);

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
        // TODO: Restore properties
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

    function onPlayerClicked(pid: PlayerID) {
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
        board.set(pid, fields => {
            fields.money = defaultMoney;
        });
    }

    const sendMoney = useCallback((money: number) => {
        const from = board.get(sendingFrom ?? -1);
        const to = board.get(sendingTo ?? -1);

        let names = [from?.name ?? 'Banco', to?.name ?? 'Banco'] as [string, string];

        if (from) board.set(from.pid, fields => {
            fields.money -= money;
        });
        if (to) board.set(to.pid, fields => {
            fields.money += money;
        });

        if (selectedProperty !== null) {
            if (from) {
                board.set(from.pid, fields => {
                    fields.properties.set(selectedProperty, {
                        id: selectedProperty,
                        houses: 0,
                    });
                });
            }
            if (to) {
                board.set(to.pid, fields => {
                    fields.properties.delete(selectedProperty);
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
        if (sendingFrom === null && sendingTo === null) {
            setSelectedProperty(null);
            setDefaultAmount(0);
        }
    }, [sendingFrom, sendingTo]);

    const calculatePlayerValue = useCallback((player: PlayerFor<typeof mono>) => {
        return player.fields.money + Array.from(
            player.fields.properties.values(),
            ({ id, ...rest }) => ({
                prop: properties[id],
                ...rest
            })
        ).reduce((acc, curr) => (
            acc + (curr.prop.price + curr.houses * (curr.prop.housing ?? 0))
        ), 0);
    }, [properties]);


    const playerElements = useMemo(() => (
        players.map(p => {
            const propertyColors: string[] = [];
            for (const property of p.fields.properties.values()) {
                const prop = properties[property.id];
                if (prop) propertyColors.push(prop.block);
            }

            return (
                <PlayerCard
                    key={p.pid}
                    pid={p.pid}
                    palette={p.palette}
                    name={p.name}
                    properties={propertyColors}
                    money={p.fields.money}
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

    function onSendProperty(from: PlayerID, prop: number) {
        setTo(from);
        setSelectedProperty(prop);
        setDefaultAmount(properties[prop].price);
    }

    function onPayRent(to: PlayerID, amount: number) {
        setTo(to);
        setDefaultAmount(amount);
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
                                    defaultValue={defaultAmount}
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
                    <Leaderboard hooks={mono} calculate={calculatePlayerValue} />
                </Panel>
                <Panel
                    icon={<MdBusiness />}
                    name="Propiedades"
                >
                    <MPProperties
                        orphans={orphanProperties}
                        properties={properties}
                        onSendProperty={onSendProperty}
                        onPayRent={onPayRent}
                    />
                </Panel>
                {useAddPlayerPanel(onPlayerAdded)}
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
