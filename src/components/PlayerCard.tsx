import { PlayerID } from 'lib/bx';
import { styled } from 'lib/theme';
import React, { Component, ComponentProps, FC, useMemo } from 'react';
import { Avatar, Icon } from './Avatar';

export enum Selection {
    Unselected,
    From,
    To,
}

const StyledStripe = styled('div', {
    display: 'block',
    width: '12px',
    height: '2px',
    margin: '1px',
});

const Stripe: FC<{ c: string; }> = ({ c }) =>
    useMemo(() => <StyledStripe css={{ backgroundColor: c }} />, [c]);

const Stripes = styled('div', {
    display: 'flex',
    position: 'absolute',
    flexWrap: 'wrap-reverse',
    alignItems: 'flex-end',
    alignContent: 'flex-start',
    flexDirection: 'row-reverse',
    left: 'calc(100% - 48px)',
    top: 'calc(100% - 66px)',
    width: '42px',
    height: '60px',
});

const StyledCard = styled('li', {
    backgroundColor: 'white',
    color: 'black',
    width: '12rem',
    height: '5rem',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '2px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: '1rem',
    boxSizing: 'border-box',
    margin: '10px',
    border: '.25rem solid royalblue',
    position: 'relative',
    flexShrink: '0',

    transition: 'transform ease 0.3s',

    '.name': {
        display: 'block',
        marginLeft: '20px',
        fontSize: '22px',
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    '.money': {
        display: 'block',
        fontSize: '16px',
        marginTop: '2px',
        alignSelf: 'stretch',
    },

    'label': {
        display: 'flex !important',
    },

    'input': {
        flexGrow: 1,
        width: 0,
        marginTop: '0 !important',
        marginLeft: '0 !important',
        background: 'none',
        borderBottom: '1px dashed black',

        '&::placeholder': {
            color: '#0008',
        }
    },

    '&:hover': {
        //boxShadow: 0px 6px 12px #0004,
        transform: 'translateY(-2px)',
    },

    '@media only screen and (maxWidth: 768px) ': {
        width: 'calc(100% - 16px)',
    },

    variants: {
        add: {
            true: {
                borderColor: '$bg300',
                boxShadow: 'none',
            }
        }
    }
});

type PlayerCardProps = {
    pid: PlayerID;
    name: string;
    money: number;
    isBank?: boolean;
    add?: boolean;
    stripes?: string[];
    inputCallback: (amount?: number, name?: string) => void;
    defaultInputValue: string;
    onSelection: (pid: PlayerID) => void;
    selection: Selection;
};

export default class PlayerCard extends Component<PlayerCardProps> {
    state = {
        name: '',
        amount: '',
    };

    inputChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) {
            this.setState({
                amount: e.target.value,
            });
        }
    }

    clickAvatar(ok: boolean) {
        let { selection, inputCallback } = this.props;

        // Pressed confirm
        if (
            selection == Selection.To ||
            selection == Selection.From ||
            this.props.add == true
        ) {
            if (ok) {
                let m = 0;
                if (this.state.amount != '') {
                    m = Number(this.state.amount);
                } else {
                    m = Number(this.props.defaultInputValue);
                }
                if (isNaN(m)) m = 0; // Just in case
                let n = this.state.name == '' ? null : this.state.name;

                inputCallback(m, this.state.name);
                this.setState({ name: '', amount: '' });
            } else {
                // Pressed cancel
                inputCallback();
                this.setState({ name: '', amount: '' });
            }
        }
    }

    selected(e: React.MouseEvent<HTMLLIElement>) {
        if (
            this.props.selection == Selection.Unselected &&
            this.props.add != true
        ) {
            this.props.onSelection(this.props.pid);
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
            this.props.defaultInputValue != '';

        let avatarIcon: Icon = 'human';
        if (confirm) {
            avatarIcon = 'confirm';
        } else {
            if (selection == Selection.From) {
                avatarIcon = 'from';
            } else if (selection == Selection.To) {
                avatarIcon = 'to';
            } else if (isBank) avatarIcon = 'bank';
            else if (addMode) avatarIcon = 'add';
        }

        let stripes = [];
        if (this.props.stripes) {
            for (let c of this.props.stripes) {
                stripes.push(<Stripe c={c} />);
            }
        }
        return (
            <StyledCard add={addMode} onClick={this.selected.bind(this)}>
                <Avatar
                    icon={avatarIcon}
                    onClick={(e) => this.clickAvatar(true)}
                />
                <Stripes>{stripes}</Stripes>
                {(selection == Selection.To ||
                    selection == Selection.From ||
                    adding) && (
                        <Avatar
                            icon="cancel"
                            onClick={(e) => this.clickAvatar(false)}
                        />
                    )}
                {adding ? (
                    <label className="name">
                        <input
                            className="name"
                            type="text"
                            value={this.state.name}
                            autoFocus={true}
                            onChange={(e) =>
                                this.setState({ name: e.target.value })
                            }
                            onKeyPress={(e) => {
                                if (e.key == 'Enter') this.clickAvatar(true);
                            }}
                            placeholder={`Nombre`}
                        />
                    </label>
                ) : (
                    <h2 className="name">{name}</h2>
                )}
                {selection == Selection.To || adding ? (
                    <label className="money">
                        $&nbsp;
                        <input
                            className="money"
                            type="text"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={this.state.amount}
                            autoFocus={true && !adding}
                            onChange={(e) => this.inputChange(e)}
                            onKeyPress={(e) => {
                                if (e.key == 'Enter') this.clickAvatar(true);
                            }}
                            placeholder={
                                this.props.defaultInputValue == ''
                                    ? `${this.props.money}...`
                                    : this.props.defaultInputValue
                            }
                        />
                    </label>
                ) : (
                    !addMode && <span className="money">$ {money}</span>
                )}
            </StyledCard>
        );
    }
}
