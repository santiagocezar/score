import { registerGames } from 'lib/bx';
import { Cards } from './cards';
import { Monopoly } from './monopoly';
import { Bingo } from './bingo';

export const { MatchProvider, newMatch } = registerGames({
    Monopoly, Cards, Bingo
});

