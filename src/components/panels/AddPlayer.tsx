import { Button } from "components/Button";
import { Input } from 'components/Forms';
import { PlayerID, useAnyBoard } from "lib/bx";
import { palettes } from "lib/color";
import { styled } from "lib/theme";
import { useContrastingColor } from "lib/utils";
import { FC, memo, ReactElement, useCallback, useMemo, useState } from "react";

import MdDone from '~icons/ic/round-done';
import MdAdd from '~icons/ic/round-add';
import { Panel, PanelElement } from '.';

interface AddPlayerProps {
    afterAddingPlayer?: (pid: PlayerID) => void;
}

const StyledSwatch = styled('div', {
    height: '2rem',
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

const Swatch = memo<SwatchProps>(({ palette, active, onClick }) => {
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
const Swatches = styled('div', {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
});

const StyledAddPlayer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    gap: '1rem',
});

export const AddPlayer: FC<AddPlayerProps> = ({ afterAddingPlayer }) => {
    const [name, setName] = useState('');
    const [palette, setPalette] = useState(() => Math.floor(Math.random() * palettes.length));
    const board = useAnyBoard();

    const onAdd = useCallback(() => {
        const pid = board.add({
            name,
            palette,
        });
        setName('');
        afterAddingPlayer?.(pid);
    }, [name, palette, afterAddingPlayer]);

    return (
        <StyledAddPlayer>
            <Input
                label="Nombre"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onEnter={onAdd}
            />
            <Swatches>
                {palettes.map((_, i) => (
                    <Swatch palette={i} active={i === palette} onClick={setPalette} />
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