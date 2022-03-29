import { PlayerID } from 'lib/bx';
import { CSS, styled } from 'lib/theme';
import { useContrastingColor, useContrastingPair } from 'lib/utils';
import React, { Component, ComponentProps, FC, memo, useEffect, useMemo, useState } from 'react';
import { BANK } from '.';
import { StatusIcon } from './PlayerCard';

import MdBank from '~icons/ic/account-balance';
import { Palette } from 'lib/color';

export const BANK_PALETTE: Palette = {
    $$p10: '#efeffb',
    $$p30: '#8e92bb',
    $$p40: '#55598f',
    $$p50: '#2f3150',
    $$p70: '#080a15',
    $$p90: '#efeffb',
    $$contrast: 'white',
};

const StyledCard = styled('li', {
    display: 'grid',
    gridTemplateColumns: 'min-content 1fr min-content',
    alignItems: 'center',
    gridColumnStart: '1',
    gridColumnEnd: '-1',
    padding: '.5rem 1rem',
    borderRadius: '1rem',
    backgroundColor: '#2f3150',
    color: '#efeffb',
    userSelect: 'none',
    gap: '.5rem',

    transition: 'transform ease 0.3s',

    '.name': {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
    },

    '&:hover': {
        //boxShadow: 0px 6px 12px #0004,
        transform: 'translateY(-2px)',
    },
});

type BankCardProps = {
    onClick: (pid: PlayerID) => void;
    from: boolean;
    to: boolean;
};

export const BankCard = memo<BankCardProps>(({ onClick, from, to }) => {
    return (
        <StyledCard css={BANK_PALETTE} onClick={() => onClick(BANK)} >
            <MdBank />
            <h2 className="name">
                Banco
            </h2>
            <StatusIcon
                palette={BANK_PALETTE}
                icon={from ? 'from' : to ? 'to' : null}
            />
        </StyledCard>
    );
});

// export default class PlayerCard extends Component<PlayerCardProps> {
//     state = {
//         name: '',
//         amount: '',
//     };

//     inputChange(e: React.ChangeEvent<HTMLInputElement>) {
//         if (e.target.value === '' || /^[0-9\b]+$/.test(e.target.value)) {
//             this.setState({
//                 amount: e.target.value,
//             });
//         }
//     }

//     clickAvatar(ok: boolean) {
//         let { selection, inputCallback } = this.props;

//         // Pressed confirm
//         if (
//             selection == Selection.To ||
//             selection == Selection.From ||
//             this.props.add == true
//         ) {
//             if (ok) {
//                 let m = 0;
//                 if (this.state.amount != '') {
//                     m = Number(this.state.amount);
//                 } else {
//                     m = Number(this.props.defaultInputValue);
//                 }
//                 if (isNaN(m)) m = 0; // Just in case
//                 let n = this.state.name == '' ? null : this.state.name;

//                 inputCallback(m, this.state.name);
//                 this.setState({ name: '', amount: '' });
//             } else {
//                 // Pressed cancel
//                 inputCallback();
//                 this.setState({ name: '', amount: '' });
//             }
//         }
//     }

//     selected(e: React.MouseEvent<HTMLLIElement>) {
//         if (
//             this.props.selection == Selection.Unselected &&
//             this.props.add != true
//         ) {
//             this.props.onSelection(this.props.pid);
//             e.preventDefault();
//         }
//     }

//     render() {
//         let { name, money, selection, isBank } = this.props;

//         let playerClass = 'player';

//         let addMode = false;
//         let adding = false;
//         if (this.props.add != undefined) {
//             playerClass += ' add';
//             addMode = true;
//             adding = this.props.add;
//         }

//         let confirm =
//             this.state.amount != '' ||
//             (adding && this.state.name != '') ||
//             this.props.defaultInputValue != '';

//         let avatarIcon: Icon = undefined;
//         if (confirm) {
//             avatarIcon = 'confirm';
//         } else {
//             if (selection == Selection.From) {
//                 avatarIcon = 'from';
//             } else if (selection == Selection.To) {
//                 avatarIcon = 'to';
//             } else if (isBank) avatarIcon = 'bank';
//             else if (addMode) avatarIcon = 'add';
//         }

//         let stripes = [];
//         if (this.props.stripes) {
//             for (let c of this.props.stripes) {
//                 stripes.push(<Stripe c={c} />);
//             }
//         }
//         return (
//             <StyledCard add={addMode} onClick={this.selected.bind(this)}>
//                 <Stripes>{stripes}</Stripes>
//                 {(selection == Selection.To ||
//                     selection == Selection.From ||
//                     adding) && (
//                         <Avatar
//                             icon="cancel"
//                             onClick={(e) => this.clickAvatar(false)}
//                         />
//                     )}
//                 {adding ? (
//                     <label className="name">
//                         <Avatar
//                             icon={avatarIcon}
//                             onClick={(e) => this.clickAvatar(true)}
//                         />
//                         <input
//                             className="name"
//                             type="text"
//                             value={this.state.name}
//                             autoFocus={true}
//                             onChange={(e) =>
//                                 this.setState({ name: e.target.value })
//                             }
//                             onKeyPress={(e) => {
//                                 if (e.key == 'Enter') this.clickAvatar(true);
//                             }}
//                             placeholder={`Nombre`}
//                         />
//                     </label>
//                 ) : (
//                     <h2 className="name">
//                         <Avatar
//                             icon={avatarIcon}
//                             onClick={(e) => this.clickAvatar(true)}
//                         />
//                         {name}</h2>
//                 )}
//                 {selection == Selection.To || adding ? (
//                     <label className="money">
//                         $&nbsp;
//                         <input
//                             className="money"
//                             type="text"
//                             pattern="[0-9]*"
//                             inputMode="numeric"
//                             value={this.state.amount}
//                             autoFocus={true && !adding}
//                             onChange={(e) => this.inputChange(e)}
//                             onKeyPress={(e) => {
//                                 if (e.key == 'Enter') this.clickAvatar(true);
//                             }}
//                             placeholder={
//                                 this.props.defaultInputValue == ''
//                                     ? `${this.props.money}...`
//                                     : this.props.defaultInputValue
//                             }
//                         />
//                     </label>
//                 ) : (
//                     !addMode && <span className="money">$ {money}</span>
//                 )}
//             </StyledCard>
//         );
//     }
// }
