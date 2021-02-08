import React, { Component, useEffect, useRef } from 'react';
import { BankContext, useBank } from './bankContext';

const FARO = 'ws://localhost:8080';

export default function BankRTC() {
    const bank = useBank();
    const peer = useRef<RTCPeerConnection>();
    const faro = useRef<WebSocket>(new WebSocket(FARO + '?id=' + 'SCSC'));
    const channel = useRef<RTCDataChannel>();

    function handleDataChannel(e: RTCDataChannelEvent) {
        console.log('Channel');
        channel.current = e.channel;
        channel.current.addEventListener('message', (e) => {
            console.log(e.data);
        });
    }

    function handleSignal(this: WebSocket, e: MessageEvent<any>) {
        console.log(e.data);
        const msg = JSON.parse(e.data);
        if (msg.offer) {
            const desc = new RTCSessionDescription(msg.offer);
            peer.current.setRemoteDescription(desc);
            peer.current.createAnswer().then((a) => {
                peer.current.setLocalDescription(a);
                this.send(JSON.stringify({ answer: a }));
            });
        }
        if (msg.iceCandidate) {
            console.log('accepting candidate');
            const canditate = new RTCIceCandidate(msg.iceCandidate);
            peer.current.addIceCandidate(canditate).catch(console.error);
        }
    }

    async function createPeer() {
        console.log('a');
        peer.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.stunprotocol.org',
                },
            ],
        });

        peer.current.onconnectionstatechange = () =>
            console.log(peer.current.connectionState);
        peer.current.ondatachannel = handleDataChannel;
        faro.current.onmessage = handleSignal;
    }

    function close() {
        peer.current.close();
    }

    useEffect(() => {
        console.log(bank.players);
        if (channel.current) {
            console.log('b');
            channel.current.send(JSON.stringify(bank.players));
        }
    }, [bank]);

    useEffect(() => {
        createPeer();
        return () => close;
    }, []);

    return <p>id SCSC</p>;
}
