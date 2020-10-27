import React from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

export const Sidebar = styled.div<{ open: boolean }>`
    display: block;
    position: fixed;
    top: 56px;
    right: 8px;
    transform: translateX(calc(100% + 16px));
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 2px 4px #0004;
    z-index: 3;
    height: calc(100% - 64px);
    width: 432px;
    transition: transform cubic-bezier(1, 0, 0, 1) 0.3s;
    overflow: auto;

    ${(p) =>
        p.open &&
        css`
            transform: translateX(0);
        `}

    @media only screen and (max-width: 768px) {
        width: calc(100% - 16px);
    }
`;

const StyledHeader = styled.header`
    display: flex;
    height: 48px;
    box-shadow: 0 2px 2px #0004;
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    justify-content: space-between;
    margin: 0;
    padding: 0;
    padding-left: 4px;
    background-color: white;

    nav {
        display: flex;
    }
    a {
        display: block;
        text-decoration: none;
        color: black;
        margin-right: 4px;
        padding: 8px;
        border-radius: 4px;
        transition: background ease 0.3s;
        position: relative;

        &:hover {
            background-color: #0004;

            &::before {
                font-family: 'Manrope';
                content: attr(about);
                display: block;
                z-index: 2;
                font-size: 12px;
                left: 50%;
                top: calc(100% - 4px);
                transform: translateX(-50%);
                pointer-events: none;
                position: absolute;
                padding: 4px 10px;
                border-radius: 8px;
                color: white;
                background-color: #333;
            }
        }
    }
    flex-shrink: 0;
`;

export class Header extends React.Component {
    render() {
        return (
            <StyledHeader>
                <Link to="/" about="Atrás" className="material-icons">
                    arrow_back
                </Link>
                <nav>{this.props.children}</nav>
            </StyledHeader>
        );
    }
}
