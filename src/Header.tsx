import React from 'react';
import './Header.css';

export class Header extends React.Component {
    render() {
        return (
            <header>
                <img src="/res/score.svg" height="48" />
                <nav>
                    {this.props.children}
                </nav>
            </header>
        );
    }
}