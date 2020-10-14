import React, { Component } from 'react';
import styled from 'styled-components';
import Property, { PropertyData } from './Property';


const List = styled.div`
    display: flex;
    flex-direction: column;
    align-self: stretch;
    align-items: stretch;
`

const ContentWrapper = styled.div`
    overflow-x: auto;
    overflow-y: hidden;
    display: block;
`
const Content = styled.div`
    display: flex;
    align-items: flex-end;
    padding-right: 16px;
`

const PeekingProperty = styled(Property)`
    margin-left: 16px;
`

type Props = { properties: PropertyData[], player: string }

export default class OwnedProperties extends Component<Props> {
    render() {
        let propertyList = [];

        if (this.props.properties) {
            for (let data of this.props.properties) {
                propertyList.push(<PeekingProperty data={data} />);
            }
        }

        return (
            <List>
                <ContentWrapper>
                    <Content>
                        {propertyList}
                    </Content>
                </ContentWrapper>
            </List>
        )
    }
}
