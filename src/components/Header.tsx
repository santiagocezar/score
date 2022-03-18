import { styled } from 'lib/theme';
import React, { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import scoreURL from 'res/score.svg';

import MdRight from '~icons/ic/round-chevron-right';
import MdBack from '~icons/ic/round-arrow-back';
import MdFullscreen from '~icons/ic/round-fullscreen';
import MdFullscreenExit from '~icons/ic/round-fullscreen-exit';

export const HEADER_HEIGHT = '3rem';

const StyledHeader = styled('header', {
    display: 'flex',
    height: HEADER_HEIGHT,
    borderBottomRightRadius: '2rem',
    boxShadow: '0 0 .25rem #0008',
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    margin: 0,
    backgroundColor: '$bg100',
    color: '$text',
    position: 'fixed',
    top: 0,
    left: '-6rem',
    flexShrink: 0,
    paddingRight: '1rem',
    transition: 'transform .2s cubic-bezier(0.79,0.14,0.15,0.86)',
    zIndex: '$header',

    'img': {
        filter: 'invert(100%) grayscale(100%) contrast(150%)',
        transition: 'filter .2s, opacity .2s',
        opacity: .5,
        paddingLeft: '1rem',
        paddingRight: '.5rem',
    },
    '&:hover': {
        transform: 'translateX(6rem)',
        'img': {
            opacity: 1,
            filter: 'none',
        },
    },
    'nav': {
        display: 'flex',
        alignItems: 'center',
    },
    'a': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        width: '48px',
        height: '48px',
        transition: 'background ease 0.3s',
        position: 'relative',
        cursor: 'pointer',

        '&:hover:not([disabled]) ': {
            backgroundColor: '#0004',

            '&::before ': {
                fontFamily: 'Manrope',
                content: 'attr(about)',
                display: 'block',
                zIndex: '2',
                fontSize: '12px',
                left: '50%',
                top: 'calc(100% - 4px)',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                position: 'absolute',
                padding: '4px 10px',
                borderRadius: '8px',
                color: 'white',
                backgroundColor: '#333',
            }
        }
    }
});

export function Header(p: {
    children?: ReactNode;
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
        <StyledHeader>
            <nav>
                <Link to="/" about="Atrás" className="material-icons">
                    <MdBack />
                </Link>
                <a
                    about="Pantalla completa"
                    className="material-icons"
                    onClick={toggleFullScreen}
                >
                    {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
                </a>
                <img src={`${scoreURL}`} alt="Score" />
                <MdRight />
            </nav>
        </StyledHeader>
    );
}
