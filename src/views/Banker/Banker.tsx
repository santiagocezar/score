import React, { useState, FC } from 'react';
import { OrderedMap, Set } from 'immutable';
import { saveString, loadString } from 'lib/utils';
import PlayerCard, { sel } from 'components/PlayerCard';
import { Header, Sidebar } from 'components/Header';
import Property, { PropertyData } from 'components/Property';
import OwnedProperties from 'components/OwnedProperties';

const SAVE_NAME = 'moneysave';

type Transaction = { action: string; money: number; id: number };

type Player = {
    isBank?: boolean;
    name: string;
    score: number;
    properties: Set<number>;
    prevScore: number[];
};

type PlayerMap = OrderedMap<string, Player>;

const SIDE_PROP = 0;
const SIDE_HIST = 1;
const SIDE_RANK = 2;

function loadSave(): PlayerMap {
    let save = localStorage.getItem(SAVE_NAME);
    let players: PlayerMap = OrderedMap();
    if (save) {
        players = OrderedMap(JSON.parse(save));
    }

    let thereIsBank = false;

    players.forEach((p, k) => {
        thereIsBank = thereIsBank || p.isBank == true;

        // Compatibilidad con guardados viejos (sin propiedades)
        if (!p.properties) {
            p.properties = Set();
        } else {
            // El JSON contiene un Array, convertirlo en Set
            p.properties = Set(p.properties);
        }
    });

    if (!thereIsBank && players.size > 0) {
        players.first({ isBank: false }).isBank = true;
    }

    return players;
}

function writeSave(data: PlayerMap) {
    localStorage.setItem(SAVE_NAME, JSON.stringify(data));
}

function loadProperties(): PropertyData[] | null {
    let propertiesString = localStorage.getItem('properties');
    let properties = null;
    if (propertiesString) {
        let propfile = JSON.parse(propertiesString);
        properties = propfile.properties;
    }

    return properties;
}

const Banker: FC = (_props) => {
    const [players, setPlayers] = useState<PlayerMap>(() => loadSave());
    const [properties, setProperties] = useState<PropertyData[]>(() =>
        loadProperties()
    );
    const [from, setFrom] = useState<string>(null);
    const [to, setTo] = useState<string>(null);
    const [addingPlayer, setAddingPlayer] = useState(false);
    const [sidebars, setSidebars] = useState([false, false, false]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<number>(null);

    const getBank = () => players.find((p) => p.isBank);

    const selectPlayer = (name: string) => {
        if (from == null && selectedProperty == null) {
            setFrom(name);
        } else {
            setTo(name);
        }
    };

    const addPlayer = (cancelled: boolean, name: string, money: number) => {
        if (cancelled) {
            setAddingPlayer(false);
            return;
        }
        let updatedPlayers = players.update(name, (_) => ({
            name,
            score: money,
            properties: Set(),
            prevScore: [],
        }));

        writeSave(updatedPlayers);
        setPlayers(updatedPlayers);
        setAddingPlayer(false);
    };

    const sendMoney = (money: number) => {
        if (money === null) {
            setFrom(null);
            setTo(null);
            setSelectedProperty(null);
            return;
        }

        /*
        if (selectedProperty != null) {
            if (from != null) {
                setPlayers(players.update(
                    from,
                    p => ({
                        ...p,
                        properties: p.properties.update(m => {
                            return m.delete(properties[selectedProperty].id)
                        })
                    })
                ).update(
                    name,
                    p => {
                        if (p.isBank) return p

                        if (!p.properties) {
                            p.properties = Set()
                        }
                        p.properties = p.properties.update(m => {
                            return m.add(properties[selectedProperty].id)
                        })
                        return p
                    }
                ))

                setFrom(null)
                setSelectedProperty(null)
            }
            else {
                setPlayers(players.update(
                    name,
                    p => {
                        if (p.isBank) return p

                        if (!p.properties) {
                            p.properties = Set()
                        }
                        p.properties = p.properties.update(m => {
                            return m.add(properties[selectedProperty].id)
                        })
                        return p
                    }
                ))
                setSelectedProperty(null);
            }
        }
        */

        // Si hay alguna propiedad seleccionada pero no un jugador
        // se retira el dinero del banco
        let actualFrom = from;
        if (selectedProperty != null && actualFrom == null)
            actualFrom = getBank().name;

        // Invertir dinero para que cobre el que entrega la propiedad
        if (selectedProperty != null) money = -money;

        let t: Transaction = {
            action: actualFrom + ' a ' + to,
            money,
            id: transactions.length,
        };

        let updatedPlayers = players
            .update(actualFrom, (p) => ({
                ...p,
                score: p.score - money, // Retirar dinero
            }))
            .update(to, (p) => ({
                ...p,
                score: p.score + money, // Entregar dinero
            }));

        // Si hay alguna propiedad seleccionada
        if (selectedProperty != null) {
            // Si se entrega la propiedad al banco,
            // simplemente borrarla del jugador
            if (!players.get(to).isBank) {
                updatedPlayers = updatedPlayers.update(to, (p) => ({
                    ...p,
                    properties: p.properties.update((m) => {
                        // Agregar la id de la propiedad
                        return m.add(properties[selectedProperty].id);
                    }),
                }));
            }
            // Y si se entrega del banco, no borrarla (por que
            // técnicamente el banco no tiene las propiedades)
            if (!players.get(actualFrom).isBank) {
                updatedPlayers = updatedPlayers.update(actualFrom, (p) => ({
                    ...p,
                    properties: p.properties.update((m) => {
                        return m.delete(properties[selectedProperty].id);
                    }),
                }));
            }
        }

        writeSave(updatedPlayers);
        setPlayers(updatedPlayers);
        setFrom(null);
        setTo(null);
        setSelectedProperty(null);
        setTransactions([...transactions, t]);
    };

    const getRankings = () => {
        let actualPlayers = players.filter((p) => !p.isBank); // No incluir al banco
        actualPlayers.sort((a, b) => b.score - a.score); // Ordenarlos
        return actualPlayers;
    };

    const importProperties = () => {
        loadString((s) => {
            localStorage.setItem('properties', s);
            setProperties(loadProperties());
        });
    };

    // Rendering

    let playerCards = [];
    let ownedProperties = [];

    players.forEach((v, k) => {
        let s = sel.Unselected;
        let isBank = v.isBank == true;
        let defVal = '';

        if (from == v.name) s = sel.From;
        if (to == v.name) {
            s = sel.To;

            if (selectedProperty != null)
                defVal = properties[selectedProperty].cost.toString();
        }

        let colors: string[] = [];
        if (properties && v.properties) {
            colors = Array.from(v.properties).map((v) => properties[v].group);
            ownedProperties = [...ownedProperties, ...Array.from(v.properties)];
        }

        playerCards.push(
            <PlayerCard
                key={k}
                name={v.name}
                money={v.score}
                isBank={isBank}
                selection={s}
                colors={colors}
                inputCallback={(_, m) => sendMoney(m)}
                defaultValue={defVal}
                onSelection={selectPlayer}
            />
        );
    });

    let rankings = [];

    let rank = 1;
    for (let p of getRankings().values()) {
        rankings.push(
            <li key={p.name}>
                <span className="rank">{rank}°</span>
                <div>
                    <span className="name">{p.name}</span>
                    <span className="pts">$ {p.score}</span>
                </div>
            </li>
        );
        rank++;
    }

    let transactionItems = [];

    for (let t of transactions) {
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
        if (from != null) {
            let p = players.get(from).properties;
            if (p) {
                for (let id of p) {
                    shownProperties.push(properties[id]);
                }
            }
        } else {
            for (let data of properties) {
                if (!ownedProperties.includes(data.id))
                    shownProperties.push(data);
            }
        }
    }

    return (
        <div className="_MP">
            <Header>
                <a
                    href="#"
                    about="Abrir"
                    className="material-icons"
                    onClick={() => {
                        loadString((s) => {
                            localStorage.setItem(SAVE_NAME, s);
                            setPlayers(loadSave());
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
                            localStorage.getItem(SAVE_NAME)
                        );
                    }}
                >
                    get_app
                </a>
                <a
                    href="#"
                    about="Reiniciar"
                    className="material-icons"
                    onClick={() => setPlayers(OrderedMap())}
                >
                    restore_page
                </a>
                <a
                    href="#"
                    about="Historial"
                    className="material-icons"
                    onClick={() => {
                        setSidebars([false, !sidebars[SIDE_HIST], false]);
                    }}
                >
                    history
                </a>
                <a
                    href="#"
                    about="Puestos"
                    className="material-icons"
                    onClick={() => {
                        setSidebars([false, false, !sidebars[SIDE_RANK]]);
                    }}
                >
                    emoji_events
                </a>
            </Header>

            <Sidebar open={sidebars[SIDE_HIST]}>
                <ul className="history">
                    {transactionItems.reverse()}
                    <p className="empty">Historial vacío.</p>
                </ul>
            </Sidebar>

            <Sidebar open={sidebars[SIDE_RANK]}>
                <ul className="rankings">{rankings}</ul>
            </Sidebar>

            <ul>
                {playerCards}
                <PlayerCard
                    name="Add"
                    money={0}
                    isBank={false}
                    selection={sel.Unselected}
                    add={addingPlayer}
                    inputCallback={(n, m) => {
                        addPlayer(n == null, n, m);
                    }}
                    defaultValue={''}
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
};

export default Banker;