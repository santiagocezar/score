import { OrderedMap } from 'immutable';
import { type } from 'os';
import React, { Component, useEffect, useRef, useState } from 'react';
import { BankContext, useBank, Player, serializePlayers } from './bankContext';
import { Action } from './types';
import { useEvent } from './utils';

const SERVER = 'ws://localhost:2404';

export default function BankSocket() {
    const bank = useBank();
    const server = useRef<WebSocket>(new WebSocket(SERVER));
    const ID = useRef<string>();
    const onlinePlayers = useRef(OrderedMap<string, Player>());

    function sendAction(action: Action) {
        if (server.current.readyState == 1)
            server.current.send(JSON.stringify(action));
    }
    function handleMessage(e: MessageEvent<ArrayBuffer | string>) {
        let data =
            typeof e.data == 'string'
                ? e.data
                : new TextDecoder('utf-8').decode(e.data);

        const action: Action = JSON.parse(data);
        switch (action.type) {
            case 'REGISTERED': {
                ID.current = action.id;
                break;
            }
            case 'JOIN': {
                const player = bank.players.get(action.name);
                if (player && !onlinePlayers.current.has(action.id)) {
                    onlinePlayers.current = onlinePlayers.current.set(
                        action.id,
                        player
                    );
                    console.log(ID.current);
                    sendAction({
                        type: 'GAME_STATE',
                        admin_id: ID.current,
                        state: {
                            players: serializePlayers(bank.players),
                            properties: bank.properties,
                        },
                    });
                } else {
                    sendAction({
                        type: 'UNAVAILABLE',
                        id: action.id,
                    });
                }
                break;
            }
            case 'DISCONNECTED': {
                onlinePlayers.current = onlinePlayers.current.remove(action.id);
                break;
            }
            case 'SEND': {
                const name = onlinePlayers.current.get(action.id).name;
                const to = bank.players.has(action.to) ? action.to : name;
                const amount = isNaN(action.amount)
                    ? 0
                    : Math.floor(action.amount);
                const property = bank.players
                    .get(name)
                    .properties.has(action.with_property)
                    ? action.with_property
                    : null;
                bank.sendMoney(name, to, amount, property);
            }
        }
    }

    useEffect(() => {
        sendAction({
            type: 'GAME_STATE',
            admin_id: ID.current,
            state: {
                players: serializePlayers(bank.players),
                properties: bank.properties,
            },
        });
    }, [bank]);

    useEffect(() => {
        server.current.binaryType = 'arraybuffer';
    }, []);

    useEvent(server.current, 'message', (e) => {
        handleMessage(e);
    });

    return null;
}
