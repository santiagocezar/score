import React, { ReactNode } from 'react';
import styled from 'styled-components';

const ExitButton = styled.button`
    background: none;
    text-align: center;
    padding: 0;
    border: none;
    height: 32px;
    width: 32px;
    color: var(--fg);

    &::after {
        content: 'arrow_back';
    }

    @media only screen and (min-width: 768px) {
        &::after {
            content: 'close';
        }
    }
`;

const Background = styled.div`
    display: inline-flex;
    justify-content: flex-end;
    flex-direction: column;
    background-color: #00000080;

    backdrop-filter: blur(5px);
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 3;

    @media only screen and (min-width: 768px) {
        justify-content: center;
    }
`;

const DialogHeader = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
    height: 48px;
    overflow-y: hidden;
    padding: 0 16px;
    gap: 16px;
    border-bottom: 1px solid #0004;

    h1 {
        font-size: 20px;
        font-weight: bold;
    }

    @media only screen and (min-width: 768px) {
        justify-content: space-between;
        flex-direction: row-reverse;
    }
`;

const DialogBody = styled.div`
    overflow-y: auto;
`;

const StyledDialog = styled.div`
    align-self: center;
    position: relative;
    text-align: left;

    border-radius: 16px 16px 0 0;

    z-index: 4;
    display: inline-flex;
    flex-flow: column;
    margin: 0;
    box-shadow: 0px 4px 16px #0002;

    background-color: #fff;
    background-clip: border-box;
    background-size: cover;
    overflow-y: auto;

    @media only screen and (min-width: 768px) {
        height: unset;
        border-radius: 16px;
    }
`;

export default function Dialog(p: {
    title: string;
    open: boolean;
    onClosed: () => void;
    children?: ReactNode;
}) {
    return (
        p.open && (
            <Background>
                <StyledDialog>
                    <DialogHeader>
                        <ExitButton
                            className="material-icons"
                            onClick={(e) => p.onClosed()}
                        />
                        <h1>{p.title}</h1>
                    </DialogHeader>
                    <DialogBody>{p.children}</DialogBody>
                </StyledDialog>
            </Background>
        )
    );
}
interface MoneyInputProps {
    from: string;
    to: string;
    callback: (cancelled: boolean, money: number) => void;
}

export class MoneyInput extends React.Component<MoneyInputProps, {}> {
    moneyInput = React.createRef<HTMLInputElement>();

    handleSubmit(event: React.FormEvent) {
        this.props.callback(false, Number(this.moneyInput.current.value));
        event.preventDefault();
    }

    cancel(event) {
        this.props.callback(true, null);
    }

    render() {
        return (
            <div className="dialog MoneyInput">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <h2>
                        {this.props.from} a {this.props.to}
                    </h2>
                    <label className="moneySelect">
                        $
                        <input type="number" ref={this.moneyInput} />
                    </label>
                    <br />
                    <input type="submit" value="ENTREGAR" />
                    <button onClick={this.cancel.bind(this)}>CANCELAR</button>
                </form>
            </div>
        );
    }
}

interface AddPlayerProps {
    callback: (cancelled: boolean, name: string, money: number) => void;
    itemName: string;
}

export class AddPlayer extends React.Component<AddPlayerProps, {}> {
    nameInput = React.createRef<HTMLInputElement>();
    moneyInput = React.createRef<HTMLInputElement>();

    handleSubmit(event: React.FormEvent) {
        if (this.nameInput.current.value == '') {
            alert('El jugador debe tener un nombre');
            event.preventDefault();
            return;
        }
        this.props.callback(
            false,
            this.nameInput.current.value,
            Number(this.moneyInput.current.value)
        );
        event.preventDefault();
    }

    cancel(event) {
        this.props.callback(true, null, null);
    }

    render() {
        return (
            <div className="dialog AddPlayer">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label className="name">
                        Nombre
                        <input
                            type="text"
                            placeholder={'Nuevo ' + this.props.itemName}
                            ref={this.nameInput}
                        />
                    </label>
                    <br />
                    <label className="moneySelect">
                        $
                        <input type="number" ref={this.moneyInput} />
                    </label>
                    <br />
                    <input type="submit" value="AGREGAR" />{' '}
                    <button onClick={this.cancel.bind(this)}>CANCELAR</button>
                </form>
            </div>
        );
    }
}

export class AddSimple extends React.Component<{
    callback: (cancelled: boolean, name: string) => void;
}> {
    nameInput = React.createRef<HTMLInputElement>();

    handleSubmit(event: React.FormEvent) {
        if (
            this.nameInput.current.value == '' ||
            this.nameInput.current.value.length != 3
        ) {
            alert('El jugador debe tener un nombre de 3 letras');
            event.preventDefault();
            return;
        }
        this.props.callback(
            false,
            this.nameInput.current.value.toLocaleUpperCase()
        );
        event.preventDefault();
    }

    cancel(event) {
        this.props.callback(true, null);
    }

    render() {
        return (
            <div className="dialog AddSimple">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label className="name">
                        Alias de 3 letras
                        <br />
                        <input
                            type="text"
                            maxLength={3}
                            placeholder="---"
                            size={3}
                            ref={this.nameInput}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    this.cancel(e);
                                }
                            }}
                        />
                    </label>
                    <br />
                    <br />
                    <input type="submit" value="AGREGAR" />{' '}
                    <button onClick={this.cancel.bind(this)}>CANCELAR</button>
                </form>
            </div>
        );
    }
}

export class AddScore extends React.Component<{
    name: string;
    callback: (cancelled: boolean, name: string, score: number) => void;
}> {
    scoreInput = React.createRef<HTMLInputElement>();

    handleSubmit(event: React.FormEvent) {
        this.props.callback(
            false,
            this.props.name,
            Number(this.scoreInput.current.value)
        );
        event.preventDefault();
    }

    cancel(event) {
        this.props.callback(true, null, null);
    }

    render() {
        return (
            <div className="dialog AddSimple">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label className="name">
                        Agregar puntos a {this.props.name}
                        <br />
                        <input
                            type="number"
                            placeholder="0"
                            size={9}
                            ref={this.scoreInput}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    this.cancel(e);
                                }
                            }}
                        />
                    </label>
                    <br />
                    <br />
                    <input type="submit" value="AGREGAR" />{' '}
                    <button onClick={this.cancel.bind(this)}>CANCELAR</button>
                </form>
            </div>
        );
    }
}
