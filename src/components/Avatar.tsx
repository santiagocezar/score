import React from "react";
import styled, { css } from "styled-components";

const commonOutline = '0 0 0 6px white';

export enum icon {
    Human,
    From,
    To,
    Confirm,
    Cancel,
    Add,
    Bank,
    Property
}

type Props = {
    icon?: icon;
};

const Avatar = styled.div<Props>`
    transition:
        border-color ease .3s,
        background ease .3s,
        box-shadow ease .3s;

    display: block;
    position: absolute;
    left: -9px;
    top: -9px;
    width: 32px;
    height: 32px;
    box-sizing: border-box;
    border-radius: 32px;
    border: 4px solid royalblue;
    background: url(/res/avatars.svg#human) no-repeat;
    background-color: black;
    background-position: center;
    box-shadow: ${commonOutline};

    ${p => p.icon == icon.Cancel && css`
        position: absolute;
        width: 24px;
        height: 24px;
        left: calc(100% - 30px);
        top: 6px;
        border: none;
        background: url(/res/avatars.svg#cancel) no-repeat;
        background-color: transparent;
        box-shadow: none;
    `}

    ${p => p.icon == icon.From && css`
        border-color: #c83771;
        background: url(/res/avatars.svg#out) no-repeat;
        background-color: #c83771;
        box-shadow: 0 0 10px #c83771cc, ${commonOutline};
    `}

    ${p => p.icon == icon.To && css`
        border-color: #37abc8;
        background: url(/res/avatars.svg#in) no-repeat;
        background-color: #37abc8;
        box-shadow: 0 0 10px #37abc8cc, ${commonOutline};
    `}
    
    ${p => p.icon == icon.Confirm && css`
        background: url(/res/avatars.svg#ok) no-repeat;
        background-color: green;
        border-color: green;
        box-shadow: 0 0 10px green, ${commonOutline};
    `}

    ${p => p.icon == icon.Add && css`
        border-color: cyan;
        background: url(/res/avatars.svg#add) no-repeat;
        background-color: white;
    `}

    ${p => p.icon == icon.Bank && css`
        border-color: gold;
        background: url(/res/avatars.svg#bank) no-repeat;
        background-color: white;
    `}

    ${p => p.icon == icon.Property && css`
        border-color: darkgrey;
        background: url(/res/avatars.svg#property) no-repeat;
        background-color: black;
    `}
`;

export default Avatar;