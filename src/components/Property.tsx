import { PropertyData } from 'lib/types';
import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import Avatar, { icon } from './Avatar';

const Card = styled.div<{ expanded: boolean }>`
    border: 1px solid black;
    display: flex;
    padding: 10px 16px 16px;
    border-radius: 8px;
    flex-direction: column;
    flex-shrink: 0;
    align-items: stretch;
    width: 240px;
    box-sizing: border-box;
    position: relative;
    background-color: white;
    height: ${(props) => (props.expanded ? '328px' : '84px')};
    opacity: 1;

    &:hover {
        height: 328px;
        transform: translateY(0);
    }

    transition: height ease 0.3s;
    margin-bottom: 8px;
`;

const Title = styled.h2`
    &::before {
        content: '';
        display: inline-block;
        border-radius: 100%;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        margin-right: 8px;
        background-color: ${(props) => props.color};
    }

    display: inline-flex;
    align-items: center;
    height: 64px;
    flex-shrink: 0;
    font-size: 22px;
    font-weight: normal;
    color: black;
`;

const Separator = styled.hr`
    padding-top: 1px;
    margin: 10px 0;
    width: 100%;
    background-color: #0008;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    overflow: hidden;
`;

const Rent = styled.p`
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 8px;
`;

const House = styled.li`
    &::before {
        content: '⌂';
        color: red;
    }
    list-style-type: none;
`;

const Train = styled.li`
    &::before {
        content: 'Ferrocarril';
        color: blueviolet;
    }
    list-style-type: none;
`;

type Props = {
    data: PropertyData;
    expanded?: boolean;
    className?: string;
    selected?: boolean;
    onSelect?: (id: number) => void;
};
export default class Property extends Component<Props> {
    render() {
        let {
            data: { id, cost, group, house, name, rent, description, type },
            selected,
            onSelect,
        } = this.props;
        return (
            <Card
                onClick={(_) => onSelect(selected ? null : id)}
                className={this.props.className}
                expanded={this.props.expanded == true}
                draggable={true}
            >
                <Avatar icon={selected ? icon.From : icon.Property}></Avatar>
                {selected && <Avatar icon={icon.Cancel}></Avatar>}
                <Title color={group}>{name}</Title>
                {type == 'service' ? (
                    <Content>
                        <Separator />
                        <span style={{ display: 'block', height: 200 }}>
                            Con una tarjeta de servicios, el alquiler es 4 veces
                            lo que haya tocado en los dados. Con las dos
                            tarjetas, sería 10 veces.
                        </span>
                        <Separator />
                        <p>
                            <small>Valor de hipoteca $ {cost / 2}</small>
                        </p>
                    </Content>
                ) : (
                    <Content>
                        <Separator />

                        <Rent>Alquiler $ {rent[0]}</Rent>
                        {type == 'station' ? (
                            <ul style={{ display: 'block', height: 200 }}>
                                <Train> × 2 — $ {rent[1]}</Train>
                                <Train> × 3 — $ {rent[2]}</Train>
                                <Train> × 4 — $ {rent[3]}</Train>
                            </ul>
                        ) : (
                            <ul>
                                <House> × 1 — $ {rent[1]}</House>
                                <House> × 2 — $ {rent[2]}</House>
                                <House> × 3 — $ {rent[3]}</House>
                                <House> × 4 — $ {rent[4]}</House>
                                <House> Hotel — $ {rent[5]}</House>
                            </ul>
                        )}
                        <br />

                        <Separator />
                        <p>
                            <small>Valor de hipoteca $ {cost / 2}</small>
                        </p>
                        <p>
                            <small>Costo por casa/hotel $ {house}</small>
                        </p>
                    </Content>
                )}
            </Card>
        );
    }
}
