import { ChangeEvent, FC, memo, useEffect, useMemo, useState } from 'react';
import { styled } from 'lib/theme';

import { card } from '.';
import { Button, ButtonGroup } from 'components/Button';
import { Input } from 'components/Forms';
import { PlayerID } from 'lib/bx';
import { Dialog } from 'components/Dialog';

const StyledSendMoney = styled('div', {
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: '.5rem',
});

export interface AddScoreProps {
    pid: PlayerID | null;
    defaultValue?: number;
    onConfirm?: (score: number | null) => void;
}
export const AddScore: FC<AddScoreProps> =
    memo(({ pid, defaultValue = 0, onConfirm }) => {
        const board = card.useBoard();
        const name = useMemo(() => (
            pid !== null ? board.get(pid)?.name : undefined
        ), [pid, board]);
        const [score, setScore] = useState(defaultValue.toString());
        const open = pid !== null;

        useEffect(() => {
            if (open) setScore(defaultValue.toString());
        }, [open]);

        function inputChange(e: ChangeEvent<HTMLInputElement>) {
            if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) {
                setScore(e.target.value);
            }
        }

        function confirm() {
            onConfirm?.(Number(score));
        }
        function cancel() {
            onConfirm?.(null);
        }


        return (
            <Dialog
                open={open}
                titlebar={`Agregando puntos a ${name}`}
            >
                <StyledSendMoney>
                    <Input
                        label="Ingrese el puntaje"
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={score}
                        autoFocus={true}
                        onFocus={(e) => e.target.select()}
                        onChange={inputChange}
                        onEnter={confirm}
                    />
                    <ButtonGroup>
                        <Button color="red" onClick={cancel}>Cancelar</Button>
                        <Button color="green" onClick={confirm}>Pagar</Button>
                    </ButtonGroup>
                </StyledSendMoney>
            </Dialog>
        );
    });

AddScore.displayName = "AddScore";