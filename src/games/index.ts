import { registerGames } from 'lib/bx';
import { Cards } from './cards';
import { Monopoly } from './monopoly';
import { Bingo } from './bingo';
import { Truco } from "./truco";

export const { MatchProvider, newMatch, games } = registerGames({
    Monopoly, Cards, Bingo, Truco
});

export type Modes = keyof typeof games;