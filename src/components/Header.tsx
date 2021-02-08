import React, { ReactNode, useEffect, useState } from 'react';
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

const StyledHeader = styled.header<{ color: string }>`
    display: flex;
    height: 48px;
    box-shadow: 0 2px 2px #0004;
    flex-direction: row;
    align-items: center;
    align-self: stretch;
    justify-content: space-between;
    margin: 0;
    padding: 0;
    background-color: ${(p) => p.color};

    @media screen and (max-width: 500px) {
        img {
            display: none;
        }
    }
    nav {
        display: flex;
        align-items: center;
    }
    a {
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: white;
        width: 48px;
        height: 48px;
        transition: background ease 0.3s;
        position: relative;
        cursor: pointer;

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

export function Header(p: {
    children?: ReactNode;
    mode: 'card' | 'money' | 'bingo';
}) {
    const [isFullscreen, setFullscreen] = useState(false);

    document.addEventListener('fullscreenchange', (e) =>
        setFullscreen(Boolean(document.fullscreenElement))
    );

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    return (
        <StyledHeader
            color={
                p.mode == 'card'
                    ? '#1a1a1a'
                    : p.mode == 'money'
                    ? '#454837'
                    : '#3138ad'
            }
        >
            <nav>
                <Link to="/" about="Atrás" className="material-icons">
                    arrow_back
                </Link>
                <a
                    about="Pantalla completa"
                    className="material-icons"
                    onClick={toggleFullScreen}
                >
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                </a>
                <img src={'/res/score.svg#' + p.mode} alt="Score" />
            </nav>
            <nav>{p.children}</nav>
        </StyledHeader>
    );
}
