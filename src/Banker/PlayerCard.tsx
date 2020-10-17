import React, { Component } from 'react';
import styled from 'styled-components';
import Avatar, { icon } from './Avatar'

export enum sel {
    Unselected,
    From,
    To
}

const Stripe = styled.div<{ c: string }>`
    display: block;
    width: 12px;
    height: 2px;
    margin: 1px;
    background-color: ${p => p.c};
`

const Stripes = styled.div`
    display: flex;
    position: absolute;
    flex-wrap: wrap-reverse;
    align-items: flex-end;
    align-content: flex-start;
    flex-direction: row-reverse;
    left: calc(100% - 48px);
    top: calc(100% - 66px);
    width: 42px;
    height: 60px;
`

type PlayerCardProps = {
    name: string;
    money: number;
    isBank: boolean;
    add?: boolean;
    colors?: string[];
    inputCallback: (name: string, amount: number) => void;
    defaultValue: string;
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
        if (selection == sel.To || selection == sel.From || this.props.add == true) {
            if (ok) {
                let m = 0
                if (this.state.amount != '') {
                    m = Number(this.state.amount);
                }
                else {
                    m = Number(this.props.defaultValue);
                }
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
            this.state.amount != '' ||
            (adding && this.state.name != '') ||
            this.props.defaultValue != '';

        let avatarIcon = icon.Human;
        if (confirm) {
            avatarIcon = icon.Confirm;
        }
        else {
            if (selection == sel.From) {
                avatarIcon = icon.From
            }
            else if (selection == sel.To) {
                avatarIcon = icon.To
            }
            else if (isBank) avatarIcon = icon.Bank;
            else if (addMode) avatarIcon = icon.Add;
        }

        let stripes = []
        if (this.props.colors) {
            for (let c of this.props.colors) {
                stripes.push(
                    <Stripe c={c} />
                )
            }
        }
        return (
            <li className={playerClass} onClick={this.selected.bind(this)}>
                <Avatar
                    icon={avatarIcon}
                    onClick={e => this.clickAvatar(true)}
                />
                <Stripes>
                    {stripes}
                </Stripes>
                {(selection == sel.To || selection == sel.From || adding) && <Avatar
                    icon={icon.Cancel}
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
                            placeholder={this.props.defaultValue == ''
                                ? `${this.props.money}...`
                                : this.props.defaultValue}
                        />
                    </label>
                    : !addMode && <span className="money">$ {money}</span>
                }
            </li>
        );
    }
}
