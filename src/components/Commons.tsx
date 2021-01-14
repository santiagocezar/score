import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

export function Card(p: {
    src: string;
    name: string;
    to: string;
    description: string;
}) {
    return (
        <Link to={p.to}>
            <img src={p.src} alt={p.name} />
            <div>
                <h2>{p.name}</h2>
                <p>{p.description}</p>
            </div>
        </Link>
    );
}

const BaseIcon = styled.i`
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    user-select: none;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -moz-font-feature-settings: 'liga';
    -moz-osx-font-smoothing: grayscale;
`;

export const Icon = (p: { name: string; className?: string }) => (
    <BaseIcon className={p.className}>{p.name}</BaseIcon>
);

export const InlineIcon = styled(Icon)`
    display: inline;
    line-height: inherit;
    vertical-align: middle;
`;
