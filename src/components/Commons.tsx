import React from 'react';
import { Link } from 'react-router-dom';

type CardProps = {
    src: string;
    name: string;
    to: string;
    description: string;
};

export class Card extends React.Component<CardProps>{
    render() {
        return (
            <Link to={this.props.to}>
                <img src={this.props.src} alt={this.props.name} />
                <div>
                    <h2>{this.props.name}</h2>
                    <p>{this.props.description}</p>
                </div>
            </Link>
        );
    }
}

export const Icon: React.FunctionComponent<{ name: string; size: number; }> = ({ name, size }) => {
    return (
        <svg viewBox="0 0 32 32" style={{
            display: 'inline-block',
            width: size,
            height: size,
        }}>
            <use xlinkHref={`#${name}`} />
        </svg>
    );
};