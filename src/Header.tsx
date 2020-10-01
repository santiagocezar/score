import React from 'react';
import './Header.css';

export class Sidebar extends React.Component<{ open: boolean; }> {
    render() {
        let classes = 'Sidebar';
        if (this.props.open)
            classes += ' open';

        return (
            <div className={classes}>
                {this.props.children}
            </div>
        );
    }
}
export class Header extends React.Component<{ home: () => void; }> {
    render() {
        return (
            <header>
                <img src="/res/score.svg" height="48" onClick={this.props.home} />
                <nav>
                    {this.props.children}
                </nav>
            </header>
        );
    }
}