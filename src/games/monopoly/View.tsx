import { FC, useCallback, useMemo } from 'react';
import { PlayerFor } from 'lib/bx';
import { mono, MonopolyProperty, MonopolySettings } from '.';

import MdHistory from '~icons/ic/round-history';
import MdLeaderboard from '~icons/ic/round-leaderboard';
import MdBusiness from '~icons/ic/round-business';

import { properties as untypedProperties } from './hasbro_argentina.json';
import { Panel, Paneled } from 'components/panels';
import { MPProperties } from './MPProperties';
import { useAddPlayerPanel } from 'components/panels/AddPlayer';
import { SendMoney } from './SendMoney';
import { styled } from 'lib/theme';
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


export const MonopolyView: FC<MonopolySettings> = ({ defaultMoney }) => {
    const board = mono.useBoard();

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
    );
};
