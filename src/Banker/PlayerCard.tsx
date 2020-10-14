import React, { Component } from 'react';

export enum sel {
    Unselected,
    From,
    To
}

type PlayerCardProps = {
    name: string;
    money: number;
    isBank: boolean;
    add?: boolean;
    inputCallback: (name: string, amount: number) => void;
    onSelection: (name: string) => void;
    selection: sel;
};

export default class PlayerCard extends Component<PlayerCardProps> {
    state = {
        name: '',
        amount: ''
    };

    constructor(props) {
        super(props);
    }

    inputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) {
            this.setState({
                amount: e.target.value
            });
        }
    }

    clickAvatar(ok: boolean) {
        let { selection, inputCallback } = this.props;

        // Pressed confirm
        if ((selection == sel.To || this.props.add == true) && ok) {
            let m = Number(this.state.amount);
            if (isNaN(m)) m = 0; // Just in case
            let n = this.state.name == ''
                ? null
                : this.state.name;

            inputCallback(n, m);
            this.setState({ name: '', amount: '' });
        }
        else { // Pressed cancel
            inputCallback(null, null);
            this.setState({ name: '', amount: '' });
        }
    }

    selected(e: React.MouseEvent<HTMLLIElement>) {
        if (this.props.selection == sel.Unselected && this.props.add != true) {
            this.props.onSelection(this.props.name);
            e.preventDefault();
        }
    }

    render() {
        let { name, money, selection, isBank } = this.props;

        let playerClass = 'player';


        let addMode = false;
        let adding = false;
        if (this.props.add != undefined) {
            playerClass += ' add';
            addMode = true;
            adding = this.props.add;
        }

        let confirm =
            this.state.amount != '' || (adding && this.state.name != '');

        let avatarClass = 'avatar';
        if (confirm) {
            avatarClass += ' ok';
        }
        else {
            switch (selection) {
                case sel.From:
                    avatarClass += ' from';
                    break;
                case sel.To:
                    avatarClass += ' to';
                    break;
                default:
                    if (isBank) avatarClass += ' bank';
                    if (addMode) avatarClass += ' add';
            }
        }



        return (
            <li className={playerClass} onClick={this.selected.bind(this)}>
                <div
                    className={avatarClass}
                    onClick={e => this.clickAvatar(true)}
                />
                {(selection == sel.To || adding) && <div
                    className="avatar cancel"
                    onClick={e => this.clickAvatar(false)}
                />}
                {adding
                    ? <label className="name">
                        <input
                            className="name"
                            type="text"
                            value={this.state.name}
                            autoFocus={true}
                            onChange={
                                e => this.setState({ name: e.target.value })
                            }
                            onKeyPress={e => {
                                if (e.key == 'Enter')
                                    this.clickAvatar(true);
                            }}
                            placeholder={`Nombre`}
                        />
                    </label>
                    : <h2 className="name">{name}</h2>
                }
                {selection == sel.To || adding
                    ? <label className="money">
                        $&nbsp;
                        <input
                            className="money"
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={this.state.amount}
                            autoFocus={true && !adding}
                            onChange={
                                e => this.inputChange(e)
                            }
                            onKeyPress={e => {
                                if (e.key == 'Enter')
                                    this.clickAvatar(true);
                            }}
                            placeholder={`${this.props.money}...`}
                        />
                    </label>
                    : !addMode && <span className="money">$ {money}</span>
                }
            </li>
        );
    }
}
