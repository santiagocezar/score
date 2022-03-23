import React, { useCallback, useMemo, useState } from 'react';
import { Route, BrowserRouter as Router, Switch, useLocation, useHistory } from 'react-router-dom';
import { GameCard } from './GameCard';
import Usage from 'views/Usage';
import { MatchProvider, newMatch } from 'games';
import * as rt from 'runtypes';

import scoreURL from 'res/score.svg';
import { Header } from 'components/Header';
import { Title2 } from 'components/Title';
import { styled } from 'lib/theme';
import { Content } from 'components/panels';
import produce from 'immer';
import { MatchData } from 'lib/bx';
import { listPlayers, useLocalStorage } from 'lib/utils';
import { MatchCard } from './MatchCard';
import { CloseButton, Dialog } from 'components/Dialog';
import { Button, ButtonGroup } from 'components/Button';

const SC = () => (
    <a
        href="https://scez.ar"
        style={{ textDecoration: 'none', color: 'unset' }}
    >
        <span style={{ color: '#ff4294' }}>scez</span>
        <span style={{ color: '#898bcb' }}>.</span>
        <span style={{ color: '#18d1ff' }}>ar</span>
    </a>
);

const HomeContent = styled('div', {
    padding: '.5rem',
    width: '100%',
    maxWidth: '40rem',
    marginX: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    '>*': {
        flexShrink: 0,
    },
    '@lg': {
        padding: '1rem',
    }
});

const Logo = styled('img', {
    height: '4rem',
});

const MatchItemType = rt.Record({
    id: rt.String,
    mode: rt.String,
    name: rt.String,
});
export type MatchItemType = rt.Static<typeof MatchItemType>;

const MatchListType = rt.Array(MatchItemType);

export const Home = () => {
    const [matches, setMatches] = useLocalStorage("matches", MatchListType, []);
    const [deletingMatch, setDeletingMatch] = useState<string | null>(null);

    const history = useHistory();

    const goToMatch = useCallback((id: string) => history.push({
        pathname: '/match/' + id
    }), [history]);

    const nm: typeof newMatch = useCallback((game, settings) => {
        const id = newMatch(game, settings);
        setMatches(produce(matches, draft => {
            draft.splice(0, 0, {
                id,
                mode: game,
                name: new Date(Date.now()).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
            });
        }));
        goToMatch(id);

        return id;
    }, [matches]);

    const doDelete = useCallback(() => {
        if (deletingMatch !== null) {
            setMatches(produce(matches, draft => {
                const index = draft.findIndex(match => match.id === deletingMatch);
                if (index >= 0)
                    draft.splice(index, 1);
            }));
            localStorage.removeItem(deletingMatch);
        }
        setDeletingMatch(null);
    }, [matches, deletingMatch]);

    const deleteMatch = (id: string) => setDeletingMatch(id);

    const matchElements = useMemo(() => (
        matches.map(match => (
            <MatchCard
                match={match}
                onDeleteClick={deleteMatch}
                onClick={() => goToMatch(match.id)}
            />
        ))
    ), [matches]);

    return (
        <HomeContent>
            <Logo
                src={scoreURL}
                alt="Score"
            />
            {!!matchElements.length && <>
                <Title2>Partidas recientes</Title2>
                {matchElements}
            </>}
            <Title2>Nueva partida</Title2>
            <GameCard
                mode="Monopoly"
                onClick={() => nm('Monopoly', { defaultMoney: 1500 })}
            />
            <GameCard
                mode="Cards"
                onClick={() => nm('Cards', { defaultMoney: 1500 })}
            />
            <GameCard
                mode="Bingo"
                onClick={() => nm('Bingo', { defaultMoney: 1500 })}
            />
            <Dialog
                open={deletingMatch !== null}
                onOpenChange={open => open || setDeletingMatch(null)}
                titlebar="¿Seguro que quiere borrar esa partida?"
            >

                <ButtonGroup>
                    <CloseButton asChild><Button color="red">No</Button></CloseButton>
                    <Button color="green" onClick={doDelete}>Borrar</Button>
                </ButtonGroup>
            </Dialog>
            <Usage />
        </HomeContent>
    );
};
