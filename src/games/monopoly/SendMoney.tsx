import React, { ChangeEvent, ComponentProps, FC, memo, ReactNode, useEffect, useMemo, useState } from 'react';
import { styled } from 'lib/theme';

import MdClose from '~icons/ic/baseline-close';
import MdRight from '~icons/ic/baseline-chevron-right';
import { CloseButton, Container, ContentPadded, DialogRoot, Overlay, TitleBar, TITLE_BAR_HEIGHT } from 'components/Dialog';
import { useContrastingPair } from 'lib/utils';
import { mono } from '.';
import { Title4 } from 'components/Title';
import { Button, ButtonGroup } from 'components/Button';
import { Input } from 'components/Forms';

const StyledSendMoney = styled('div', {
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: '.5rem',
});

export interface SendMoneyProps {
    from: number | null;
    to: number | null;
    defaultValue?: number;
    onConfirm?: (amount: number | null) => void;
}
export const SendMoney: FC<SendMoneyProps> =
    memo(({ from, to, defaultValue = 0, onConfirm }) => {
        const players = mono.usePlayers();
        const [amount, setAmount] = useState(defaultValue.toString());
        const open = from !== null && to !== null;

        useEffect(() => {
            if (open) setAmount(defaultValue.toString());
        }, [open]);

        function inputChange(e: ChangeEvent<HTMLInputElement>) {
            if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) {
                setAmount(e.target.value);
            }
        }

        function confirm() {
            onConfirm?.(Number(amount));
        }
        function cancel() {
            onConfirm?.(null);
        }


        return (
            <StyledSendMoney>
                <Input
                    label="Ingrese el monto a pagar"
                    leftDecoration="$"
                    className="money"
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={amount}
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
        );
    });