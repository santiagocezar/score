import { Component } from 'react';
import { BoardExtension } from '.';

interface BoardGame<X extends BoardExtension<any>, C extends Component> {
    extension: X,
    component: C;
}

export function registerGames() { }