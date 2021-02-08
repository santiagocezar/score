import { PropertyData } from 'components/Property';
import { List, OrderedMap, Set } from 'immutable';
import React, { createContext, ReactNode, useContext, useState } from 'react';

export const LOCALSTORAGE_KEY = 'moneysave';

type PlayerMap = OrderedMap<string, Player>;
function PlayerMap(...p: Parameters<typeof OrderedMap>): PlayerMap {
    return OrderedMap(...p);
}

type Transaction = { action: string; money: number; id: number };

type Player = {
    isBank: boolean;
    name: string;
    money: number;
    properties: Set<number>;
    prevScore: number[];
};

type PlayerSave = {
    isBank: boolean;
    name: string;
    money: number;
    properties: number[];
};

function writeSave(players: PlayerMap) {
    let saveData: Record<string, PlayerSave> = {};
    for (let [key, player] of players) {
        saveData[key] = {
            isBank: player.isBank,
            name: player.name,
            money: player.money,
            properties: player.properties.toArray(),
        };
    }
    console.log('saving ', saveData);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(saveData));
}

function isPlayer(player: any): player is PlayerSave {
    if (typeof player === 'object') {
        if (
            'name' in player &&
            typeof player.name === 'string' &&
            'money' in player &&
            typeof player.money === 'number' &&
            'properties' in player &&
            Array.isArray(player.properties)
        ) {
            return true;
        }
    }
    return false;
}

export function loadSave(save?: string): PlayerMap {
    save ??= localStorage.getItem(LOCALSTORAGE_KEY) ?? '{}';
    let players = PlayerMap();

    let savedPlayers: Record<string, any> = JSON.parse(save);
    let thereIsBank = false;
    for (let name in savedPlayers) {
        console.info(name);
        let player = savedPlayers[name];
        if (isPlayer(player)) {
            thereIsBank = thereIsBank || player.isBank;
            players = players.set(name, {
                isBank: player.isBank ?? false,
                name: player.name,
                money: player.money,
                properties: Set(player.properties),
                prevScore: [],
            });
        } else {
            console.warn('Player is not a player:\n', player);
        }
    }

    if (!thereIsBank && players.size > 0) {
        players = players.update(Array.from(players.keys())[0], (p) => ({
            ...p,
            isBank: true,
        }));
    }

    return players;
}

function getOwnedProperties(players: PlayerMap): Set<number> {
    return players.reduce((ids, player) => ids.merge(player.properties), Set());
}

type BankContextType = {
    players: PlayerMap;
    properties: PropertyData[];
    ownedProperties: Set<number>;
    history: List<Transaction>;
    sendMoney(
        from: string,
        to: string,
        amount: number,
        property?: number
    ): void;
    setPlayers(players: PlayerMap): void;
    createPlayer(name: string, amount: number): void;
    reloadProperties(): void;
    restart(): void;
};

export const BankContext = createContext<BankContextType>({
    players: PlayerMap(),
    properties: [],
    ownedProperties: Set(),
    history: List(),
    sendMoney(from: string, to: string, amount: number, property?: number) {},
    setPlayers(players: PlayerMap) {},
    createPlayer(name: string, amount: number) {},
    reloadProperties() {},
    restart() {},
});

function loadProperties(): PropertyData[] | null {
    let propertiesString = localStorage.getItem('properties');
    let properties = null;
    if (propertiesString) {
        let propfile = JSON.parse(propertiesString);
        properties = propfile.properties;
    }

    return properties;
}

export default function BankProvider(p: { children: ReactNode }) {
    const [players, setPlayers] = useState(() => loadSave());
    const [properties, setProperties] = useState(() => loadProperties());
    const [ownedProperties, setOwnedProperties] = useState(() =>
        getOwnedProperties(players)
    );
    const [history, setHistory] = useState(List<Transaction>());

    const value: BankContextType = {
        players,
        properties,
        ownedProperties,
        history,
        sendMoney(from: string, to: string, amount: number, property?: number) {
            // Si hay alguna propiedad seleccionada pero no un jugador
            // se retira el dinero del banco
            let actualFrom = from;
            if (property != null && actualFrom == null)
                actualFrom = players.find((p) => p.isBank).name;

            // El dinero se le suma al que vende la propiedad, no al que la recibe
            if (property != null) amount = -amount;

            let fromPlayer = players.get(actualFrom);
            let toPlayer = players.get(to);
            fromPlayer.money -= amount;
            toPlayer.money += amount;

            // Si hay alguna propiedad seleccionada
            if (property != null) {
                // Si se entrega la propiedad al banco, simplemente borrarla del
                // jugador
                if (!players.get(to).isBank) {
                    toPlayer.properties = toPlayer.properties.add(
                        properties[property].id
                    );
                }
                // Y si se entrega del banco, no borrarla (las propiedades no se
                // almacenan en el jugador banco)
                if (!players.get(actualFrom).isBank) {
                    fromPlayer.properties = fromPlayer.properties.delete(
                        properties[property].id
                    );
                }
            }

            let updatedPlayers = players
                .set(actualFrom, fromPlayer)
                .set(to, toPlayer);

            writeSave(updatedPlayers);
            setPlayers(updatedPlayers);
            setHistory(
                history.push({
                    action: actualFrom + ' a ' + to,
                    money: amount,
                    id: history.size,
                })
            );
        },
        setPlayers: (p: PlayerMap) => setPlayers(p),
        createPlayer(name: string, amount: number) {
            setPlayers(
                players.set(name, {
                    isBank: players.size == 0,
                    name: name,
                    money: amount,
                    properties: Set(),
                    prevScore: [],
                })
            );
        },
        reloadProperties() {
            setProperties(loadProperties());
        },
        restart() {
            setPlayers(PlayerMap());
        },
    };

    return (
        <BankContext.Provider value={value}>{p.children}</BankContext.Provider>
    );
}

export const useBank = () => useContext<BankContextType>(BankContext);
