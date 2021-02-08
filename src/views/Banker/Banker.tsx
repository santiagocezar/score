'use strict';

import React, { useState, FC } from 'react';
import { List, OrderedMap, Set } from 'immutable';
import { saveString, loadString } from 'lib/utils';
import PlayerCard, { Selection } from 'components/PlayerCard';
import { Header, Sidebar } from 'components/Header';
import Property, { PropertyData } from 'components/Property';
import OwnedProperties from 'components/OwnedProperties';
import { loadSave, LOCALSTORAGE_KEY, useBank } from 'lib/bankContext';
import { connect, ConnectedProps } from 'react-redux';

enum Sidebars {
    None,
    History,
    Ranks,
}

export default function Banker() {
    const [sendingFrom, setFrom] = useState<string>(null);
    const [sendingTo, setTo] = useState<string>(null);
    const [addingPlayer, setAddingPlayer] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<number>(null);
    const [openedSidebar, openSidebar] = useState(Sidebars.None);

    const {
        players,
        properties,
        history,
        createPlayer,
        setPlayers,
        restart,
        sendMoney,
        reloadProperties,
    } = useBank();

    const toggleSidebar = (s: Sidebars) => {
        openSidebar(openedSidebar == Sidebars.None ? s : Sidebars.None);
    };
    const getBank = () => players.find((p) => p.isBank);

    function onPlayerClicked(name: string) {
        if (sendingFrom == null && selectedProperty == null) {
            setFrom(name);
        } else {
            setTo(name);
        }
    }

    function onCreatePlayer(cancelled: boolean, name: string, amount: number) {
        if (!cancelled) createPlayer(name, amount);
        setAddingPlayer(false);
    }

    function onTransactionConfirmed(money: number) {
        if (money != null)
            sendMoney(sendingFrom, sendingTo, money, selectedProperty);
        setFrom(null);
        setTo(null);
        setSelectedProperty(null);
    }

    function getRankings() {
        // El banco es filtrado de los rankings ya que no es un jugador normal
        let actualPlayers = players
            .filter((p) => !p.isBank)
            .sort((a, b) => b.money - a.money);
        return actualPlayers;
    }

    function importProperties() {
        loadString((s) => {
            localStorage.setItem('properties', s);
            reloadProperties();
        });
    }

    // Rendering

    let playerElements = [];
    let ownedPropertyIDs = [];

    for (let [key, player] of players.entries()) {
        // Style applied to player
        let selection =
            sendingFrom == player.name
                ? Selection.From
                : sendingTo == player.name
                ? Selection.To
                : Selection.Unselected;

        let defaultInputValue = selectedProperty
            ? properties[selectedProperty].cost.toString()
            : '';

        let propertyStripes: string[] = [];
        if (properties && player.properties) {
            propertyStripes = player.properties
                .map((v) => properties[v].group)
                .toArray();
            ownedPropertyIDs = [
                ...ownedPropertyIDs,
                ...player.properties.toArray(),
            ];
        }

        console.log(key);

        playerElements.push(
            <PlayerCard
                key={key}
                name={player.name}
                money={player.money}
                isBank={player.isBank}
                selection={selection}
                stripes={propertyStripes}
                inputCallback={(_, m) => onTransactionConfirmed(m)}
                defaultInputValue={defaultInputValue}
                onSelection={onPlayerClicked}
            />
        );
    }

    let rankingElement = [];

    let rank = 1;
    for (let p of getRankings().values()) {
        rankingElement.push(
            <li key={p.name}>
                <span className="rank">{rank}°</span>
                <div>
                    <span className="name">{p.name}</span>
                    <span className="pts">$ {p.money}</span>
                </div>
            </li>
        );
        rank++;
    }

    let transactionItems = [];

    for (let t of history) {
        transactionItems.push(
            <li key={t.id}>
                <div>
                    <span className="name">{t.action}</span>
                    <span className="pts">${t.money}</span>
                </div>
            </li>
        );
    }

    let shownProperties = [];

    if (properties) {
        if (sendingFrom != null) {
            let p = players.get(sendingFrom).properties;
            if (p) {
                for (let id of p) {
                    shownProperties.push(properties[id]);
                }
            }
        } else {
            for (let data of properties) {
                if (!ownedPropertyIDs.includes(data.id))
                    shownProperties.push(data);
            }
        }
    }

    return (
        <div className="_MP">
            <Header mode="money">
                <a
                    about="Abrir"
                    className="material-icons"
                    onClick={() => {
                        loadString((s) => {
                            setPlayers(loadSave(s));
                        });
                    }}
                >
                    publish
                </a>
                <a
                    href="#"
                    about="Guardar"
                    className="material-icons"
                    onClick={() => {
                        saveString(
                            `score_save${Date.now()}.txt`,
                            localStorage.getItem(LOCALSTORAGE_KEY)
                        );
                    }}
                >
                    get_app
                </a>
                <a
                    href="#"
                    about="Reiniciar"
                    className="material-icons"
                    onClick={() => restart()}
                >
                    restore_page
                </a>
                <a
                    href="#"
                    about="Historial"
                    className="material-icons"
                    onClick={() => {
                        toggleSidebar(Sidebars.History);
                    }}
                >
                    history
                </a>
                <a
                    href="#"
                    about="Puestos"
                    className="material-icons"
                    onClick={() => {
                        toggleSidebar(Sidebars.Ranks);
                    }}
                >
                    emoji_events
                </a>
            </Header>

            <Sidebar open={openedSidebar == Sidebars.History}>
                <ul className="history">
                    {transactionItems.reverse()}
                    <p className="empty">Historial vacío.</p>
                </ul>
            </Sidebar>

            <Sidebar open={openedSidebar == Sidebars.Ranks}>
                <ul className="rankings">{rankingElement}</ul>
            </Sidebar>

            <ul>
                {playerElements}
                <PlayerCard
                    name="Add"
                    money={0}
                    isBank={false}
                    selection={Selection.Unselected}
                    add={addingPlayer}
                    inputCallback={(n, m) => {
                        onCreatePlayer(n == null, n, m);
                    }}
                    defaultInputValue={''}
                    onSelection={(_) => setAddingPlayer(true)}
                />
            </ul>
            <OwnedProperties
                properties={shownProperties}
                empty={properties == null || properties.length == 0}
                selected={selectedProperty}
                onImport={importProperties}
                onPropertyClicked={(id) => setSelectedProperty(id)}
            />
        </div>
    );
}
