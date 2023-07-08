import { Button } from "components/Button";
import { Input } from 'components/Forms';
import { PlayerID, useAnyBoard } from "lib/bx";
import { palettes } from "lib/color";
import { styled } from "lib/theme";
import { FC, memo, useCallback, useState } from "react";

import MdDone from '~icons/ic/round-done';
import MdAdd from '~icons/ic/round-add';
import { Panel, PanelElement, usePanelGoTo } from '.';

interface AddPlayerProps {
    afterAddingPlayer?: (pid: PlayerID) => void;
}

export const StyledSwatch = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color .2s, border-radius .2s, box-shadow .2s ease, transform .2s ease',
    backgroundColor: '$$p50',
    color: '$$p50',

    variants: {
        active: {
            true: {
                boxShadow: '$e1',
                borderRadius: '.5rem',
                transform: 'scale(125%)',
                color: '$$p90',
            }
        }
    }
});

interface SwatchProps {
    onClick?: (c: number) => void;
    palette: number;
    active: boolean;
}

export const Swatch = memo<SwatchProps>(({ palette, active, onClick }) => {
    return (
        <StyledSwatch
            onClick={() => onClick?.(palette)}
            css={palettes[palette]}
            active={active}
        >
            <MdDone />
        </StyledSwatch>
    );
});

Swatch.displayName = "Swatch";

const Swatches = styled('div', {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridAutoRows: '3rem'
});

const StyledAddPlayer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    gap: '1rem',
});

export const AddPlayer: FC<AddPlayerProps> = ({ afterAddingPlayer }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [palette, setPalette] = useState(() => Math.floor(Math.random() * palettes.length));
    const board = useAnyBoard();
    const goTo = usePanelGoTo();

    const onAdd = useCallback(() => {
        if (!name) {
            setError('El nombre no tiene que estar vacio');
            return;
        }

        const nameExists = board.sortedIDs.value
            .some(pid => board.players.value.get(pid)?.name === name);
        if (nameExists) {
            setError('Ya hay alguien con ese nombre');
            return;
        }
        const pid = board.add({
            name,
            palette,
        });
        setName('');
        setError(null);
        afterAddingPlayer?.(pid);
        goTo('-1');
    }, [name, palette, afterAddingPlayer]);

    return (
        <StyledAddPlayer>
            <Input
                label="Nombre"
                type="text"
                error={error}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onEnter={onAdd}
            />
            <Swatches>
                {palettes.map((_, i) => (
                    <Swatch key={i} palette={i} active={i === palette} onClick={setPalette} />
                ))}
            </Swatches>
            <Button color="blue" onClick={onAdd}>Agregar jugador</Button>
        </StyledAddPlayer>
    );
};

export function useAddPlayerPanel(callback?: (pid: number) => void): PanelElement {
    return (
        <Panel
            icon={<MdAdd />}
            name="Agregar"
        >
            <AddPlayer afterAddingPlayer={callback} />
        </Panel>
    );
}