import { Button, ButtonGroup } from 'components/Button';
import { Dialog } from 'components/Dialog';
import { PlayerID } from 'lib/bx';
import { palettes } from 'lib/color';
import { styled } from 'lib/theme';
import { FC, useCallback, useMemo, useState } from 'react';
import { BANK, mono, MonopolyProperty } from '.';
import { BankCard } from './BankCard';
import { PlayerCard } from './PlayerCard';
import { useSelection } from './Selection';

const StyledPlayerList = styled('div', {
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

interface MPPropertiesProps {
    properties: MonopolyProperty[];
}

export const PlayerList: FC<MPPropertiesProps> = ({ properties }) => {
    const { from, to, setTo, setFrom, clickPlayer } = useSelection();

    const board = mono.useBoard();
    const players = mono.usePlayers();

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
            if (from === deletingPlayer)
                setFrom(null);
            if (to === deletingPlayer)
                setTo(null);
            setDeletingPlayer(null);
        }
    }, [deletingPlayer]);

    function deletingDialogOpenChange() {
        setDeletingPlayer(null);
    }

    function onPlayerIconClicked(pid: PlayerID) {
        setDeletingPlayer(pid);
    }


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
                    from={from === p.pid}
                    to={to === p.pid}
                    onClick={clickPlayer}
                    onIconClick={onPlayerIconClicked}
                />
            );
        })
    ), [players, from, to]);

    return (<>
        <StyledPlayerList>
            <BankCard onClick={clickPlayer} from={from === BANK} to={to === BANK} />
            {playerElements}
        </StyledPlayerList>
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
    </>);
}; 