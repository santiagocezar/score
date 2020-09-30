import React from 'react';
import './Dialogs.css';

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
    };

    render() {
        return (
            <div className="dialog MoneyInput">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <h2>{this.props.from} a {this.props.to}</h2>
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
        this.props.callback(false, this.nameInput.current.value, Number(this.moneyInput.current.value));
        event.preventDefault();
    }

    cancel(event) {
        this.props.callback(true, null, null);
    };

    render() {
        return (
            <div className="dialog AddPlayer">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <label className="name">
                        Nombre
                        <input type="text" placeholder={'Nuevo ' + this.props.itemName} ref={this.nameInput} />
                    </label>
                    <br />
                    <label className="moneySelect">
                        $
                        <input type="number" ref={this.moneyInput} />
                    </label>
                    <br />
                    <input type="submit" value="AGREGAR" /> <button onClick={this.cancel.bind(this)}>CANCELAR</button>
                </form>
            </div>
        );
    }
}