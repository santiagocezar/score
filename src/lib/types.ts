export type JSONPlayer = {
    isBank: boolean;
    name: string;
    money: number;
    properties: number[];
};

export type PropertyData = {
    id: number;
    name: string;
    cost: number;
    group: string;
    rent?: number[];
    house?: number;
    type?: 'station' | 'service';
    description?: string;
};

export type GameState = {
    players?: { [key: string]: JSONPlayer; };
    properties?: PropertyData[];
};

export type Action =
    | {
        type: 'REGISTERED';
        admin_id: string;
        id: string;
    }
    | { type: 'DISCONNECTED'; id: string; }
    | {
        type: 'GAME_STATE';
        admin_id: string;
        state: GameState;
    }
    | {
        type: 'JOIN';
        name: string;
        id: string;
    }
    | {
        type: 'UNAVAILABLE';
        id: string;
    }
    | {
        type: 'SEND';
        to: string;
        amount: number;
        with_property?: number;
        id: string;
    };
