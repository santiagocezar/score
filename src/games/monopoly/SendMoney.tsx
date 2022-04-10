import React, { ChangeEvent, ComponentProps, FC, memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styled } from 'lib/theme';

import MdClose from '~icons/ic/baseline-close';
import MdRight from '~icons/ic/baseline-chevron-right';
import { CloseButton, Container, ContentPadded, DialogRoot, Overlay, TitleBar, TITLE_BAR_HEIGHT } from 'components/Dialog';
import { useContrastingPair } from 'lib/utils';
import { mono, MonopolyProperty } from '.';
import { Title4 } from 'components/Title';
import { Button, ButtonGroup } from 'components/Button';
import { Input, Note } from 'components/Forms';
import { useSelection } from './Selection';
import { Status } from './Status';
import { HEADER_HEIGHT } from 'components/Header';
import { Toggle } from 'components/Toggle';

const StyledSendMoney = styled('div', {
    position: 'sticky',
    zIndex: '$header',
    width: '100%',
    height: '8rem',
    top: 0,
    backgroundColor: '$bg200',
    display: 'flex',
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: '.5rem',
    padding: '1rem',
    bottom: 0,
    flexShrink: 0,
    paddingTop: `calc(${HEADER_HEIGHT} + 1rem)`,
    overflow: 'hidden',
    transition: 'height .2s ease',

    variants: {
        open: {
            true: {
                height: `100vh`,
            }
        }
    }
});

export interface SendMoneyProps {
    properties: MonopolyProperty[];
}

export const SendMoney: FC<SendMoneyProps> =
    memo(({ properties }) => {
        const board = mono.useBoard();
        const { from, to, withProperty, defaultValue, clear } = useSelection();
        const [liftMortgage, setLiftMortgage] = useState(false);
        const [amount, setAmount] = useState(defaultValue.toString());

        const currentProperty = withProperty !== null
            ? properties[withProperty]
            : null;

        const [
            liftPrice,
            mortgagedTransferTax
        ] = useMemo(() => {
            if (currentProperty !== null) {
                return [currentProperty.price / 2, currentProperty.price * .1];
            }
            else return [0, 0];
        }, [currentProperty]);

        const mortgaged = useMemo(() => {
            if (withProperty !== null && to !== null) {
                return board.get(to)
                    ?.fields
                    .properties
                    .get(withProperty)
                    ?.mortgaged ?? false;
            }
            return false;
        }, [withProperty, to]);

        const view = useRef<HTMLDivElement>(null);
        /**
         * the browser scrolls into the (auto) focused (input) element 
         * even with overflow hidden, so this stops that
         */
        function dontScrollPlease() {
            if (view.current)
                view.current.scrollTop = 0;
        };

        console.log({ mortgaged, liftMortgage, mortgagedTransferTax, liftPrice });

        const open = from !== null && to !== null;
        useEffect(() => {
            if (open) {
                setAmount(defaultValue.toString());
                setLiftMortgage(false);
            }
        }, [open]);

        function inputChange(e: ChangeEvent<HTMLInputElement>) {
            if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) {
                setAmount(e.target.value);
            }
        }
        const sendMoney = useCallback((money: number) => {
            const playerFrom = board.get(from ?? -1);
            const playerTo = board.get(to ?? -1);

            let names = [playerFrom?.name ?? 'Banco', playerTo?.name ?? 'Banco'] as [string, string];

            if (playerFrom) board.set(playerFrom.pid, fields => {
                let total = money;
                if (mortgaged) {
                    total += mortgagedTransferTax;
                    if (liftMortgage) {
                        total += liftPrice;
                    }
                }
                fields.money -= total;
            });
            if (playerTo) board.set(playerTo.pid, fields => {
                fields.money += money;
            });

            if (withProperty !== null) {
                if (playerFrom) {
                    board.set(playerFrom.pid, fields => {
                        fields.properties.set(withProperty, {
                            id: withProperty,
                            houses: 0,
                            mortgaged: mortgaged && !liftMortgage,
                        });
                    });
                }
                if (playerTo) {
                    board.set(playerTo.pid, fields => {
                        fields.properties.delete(withProperty);
                    });
                }
            }

            board.globalSet('history', draft => {
                draft.push({
                    id: draft.length,
                    action: `${names[0]} le envio a ${names[1]}`,
                    money,
                });
            });
            clear();
        }, [from, to, withProperty, mortgaged, liftPrice, liftMortgage, mortgagedTransferTax]);


        function confirm() {
            sendMoney(Number(amount));
        }
        function cancel() {
            clear();
        }


        return (
            <StyledSendMoney ref={view} onScroll={dontScrollPlease} open={open}>
                <Status
                    {...{ from, to }}
                />
                {open && (<>
                    <Input
                        label={"Ingrese el monto a pagar" + (currentProperty !== null ? ' por ' + currentProperty.name : '')}
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
                    {mortgaged && (<>
                        <Toggle
                            toggled={liftMortgage}
                            onToggle={setLiftMortgage}
                            label="Levantar hipoteca"
                        />
                        <Note>
                            Al transferir una propiedad hipotecada, siempre se le paga
                            al banco el 10% (${mortgagedTransferTax}) de interés.
                            Puede pagar ${liftPrice} más y levantar la hipoteca.
                            Pero si decide levantar la hipoteca luego, tendrá que volver
                            a pagar el 10% de interés.
                        </Note>
                    </>)}
                    <ButtonGroup>
                        <Button color="red" onClick={cancel}>Cancelar</Button>
                        <Button color="green" onClick={confirm}>Pagar{liftPrice ? '*' : ''}</Button>
                    </ButtonGroup>
                    {mortgaged && <Note>
                        *También se le pagarán ${(liftMortgage ? liftPrice + mortgagedTransferTax : mortgagedTransferTax)} al banco.
                    </Note>}
                </>)}
            </StyledSendMoney>
        );
    });