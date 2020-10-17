import React from 'react';
import { Link } from 'react-router-dom';

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
export class Header extends React.Component {
    render() {
        return (
            <header>
                <Link to="/" about="Atrás" className="material-icons">
                    arrow_back
                </Link>
                <nav>
                    {this.props.children}
                </nav>
            </header>
        );
    }
}