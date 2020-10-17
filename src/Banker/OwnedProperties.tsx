import React, { Component } from 'react';
import styled from 'styled-components';
import Property, { PropertyData } from './Property';


const List = styled.div`
    display: flex;
    position: absolute;
    flex-direction: column;
    width: 100%;
    bottom: 0;
    align-items: stretch;
`

const ContentWrapper = styled.div`
    overflow-x: auto;
    display: block;
`
const Content = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 16px;
    padding: 0 16px;
`

const PeekingProperty = styled(Property)`
    margin-top: 16px;
`

const ImportButton = styled.button`
    background: none;
    color: #000;
    border: 1px dashed black;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 22px;
    margin-bottom: 16px;
    margin-left: auto;
    margin-right: auto;
`

type Props = {
    properties: PropertyData[],
    empty?: boolean,
    selected?: number,
    onImport: () => void,
    onPropertyClicked: (id: number) => void
}

export default class OwnedProperties extends Component<Props> {
    render() {
        let propertyList = [];

        if (this.props.properties) {
            for (let data of this.props.properties) {
                propertyList.push(
                    <PeekingProperty
                        key={data.id}
                        data={data}
                        selected={this.props.selected == data.id}
                        onSelect={this.props.onPropertyClicked}
                    />
                );
            }
        }

        let empty = this.props.empty && propertyList.length == 0;

        return (
            <List>
                <ContentWrapper>
                    <Content>
                        {propertyList}
                        {
                            empty && <ImportButton onClick={_ => this.props.onImport()}>Importar propiedades</ImportButton>
                        }
                    </Content>
                </ContentWrapper>
            </List >
        )
    }
}
