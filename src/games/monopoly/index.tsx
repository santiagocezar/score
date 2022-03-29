import { PlayerID, createGame, createField, gameHooks } from 'lib/bx';
import { MonopolyView } from './View';
import { z } from "zod";

export type MonopolyProperty = {
    id: number;
    name: string;
    price: number;
    block: string;
    rent?: number[];
    housing?: number;
    special?: 'station' | 'service';
    description?: string;
};

export interface Transfer {
    from?: PlayerID,
    to?: PlayerID,
    prop?: number;
    defaultValue?: number;
}

export interface Transaction {
    action: string;
    money: number;
    id: number;
}

const OwnedProperty = z.object({
    id: z.number(),
    houses: z.number().default(0),
    mortgaged: z.boolean().default(false),
})
export type OwnedProperty = z.infer<typeof OwnedProperty>


//export type ResolvedProperty = Omit<OwnedProperty, 'id'> & {prop: MonopolyProperty}

export const BANK: PlayerID = -1;

const MonopolySettings = z.object({
    defaultMoney: z.number(),
})
export type MonopolySettings = z.infer<typeof MonopolySettings>

export const Monopoly = createGame({
    name: 'Monopoly',
    view: MonopolyView,
    settings: MonopolySettings,
    facets: {
        money: createField(z.number(), () => 0),
        properties: createField(
            z.array(OwnedProperty).transform((arr) => (
                new Map(arr.map(o => [o.id, o]))
            )),
            () => new Map<number, OwnedProperty>(),
            (value) => [...value.values()]
        )
    }
});

export const mono = gameHooks(Monopoly)

// export class MonopolyGame implements BoardExtension {
//     board = new BoardStorage();
//     settings: MonopolySettings;

//     propertiesOwner = new Map<number, PlayerID>();

//     readonly properties = hasbroArgentinaProperties;

//     constructor() {
//         // default settings
//         this.settings = {
//             defaultMoney: 1500
//         };
//         this.board.removeEvent.subscribe(this.onRemoveListener);
//         this.board.addEvent.subscribe(this.onAddListener);
    

//     private onRemoveListener = (id: PlayerID) => {
//         const [propertiesData] = this.board.get(id, PropertiesData);
//         if (propertiesData === undefined) {
//             return;
//         }
//         for (const propID of propertiesData) {
//             this.propertiesOwner.delete(propID);
//         }
//     };

//     private onAddListener = (id: PlayerID) => {
//         this.board.set(id, MoneyData, this.settings.defaultMoney);
//         this.board.set(id, PropertiesData);
//     };

//     propertySentEvent = new Emitter<[from: PlayerID, to: PlayerID, propID: number]>();

//     removePropertyFromPlayer(pid: PlayerID, propID: number) {
//         this.propertiesOwner.delete(propID);
//         let empty = false;
//         this.board.set(pid, PropertiesData, (propertiesData) => {
//             propertiesData.delete(propID);
//             empty = propertiesData.size === 0;
//         });
//         if (empty)
//             this.board.unset(pid, PropertiesData);
//     }
//     addPropertyToPlayer(pid: PlayerID, propID: number) {
//         this.propertiesOwner.set(propID, pid);
//         this.board.set(pid, PropertiesData, (propertiesData) => {
//             console.log(propertiesData);
//             propertiesData.add(propID);
//         });
//     }

//     /**
//      * Moves a property between players or the bank
//      * @param id Property ID
//      * @param to Player ID
//      */
//     moveProperty(id: number, to: PlayerID) {
//         const from = this.propertiesOwner.get(id);
//         if (from !== undefined) {
//             this.removePropertyFromPlayer(from, id);
//         }
//         if (to !== BANK) {
//             this.addPropertyToPlayer(to, id);
//         }
//         this.propertySentEvent.emit(from ?? BANK, to, id);
//     }

//     transactionEvent = new Emitter<[from: PlayerID, to: PlayerID, amount: number]>();

//     /**
//      * Sends money between players or the bank
//      * @param amount The amount of money to send
//      * @param to Receiver
//      * @param from Sender
//      */
//     sendMoney(amount: number, to: PlayerID, from: PlayerID) {
//         const [toMoney] = this.board.get(to, MoneyData);
//         const [fromMoney] = this.board.get(from, MoneyData);

//         if (toMoney !== undefined)
//             this.board.set(to, MoneyData, toMoney + amount);
//         if (fromMoney !== undefined)
//             this.board.set(from, MoneyData, fromMoney - amount);

//         this.transactionEvent.emit(from, to, amount);
//     }

//     // React helpers

//     useDisowned() {
//         const [disowned, updateDisowned] = useImmer<number[]>(() => (
//             [...this.properties.keys()]
//                 .filter(propID => (
//                     !this.propertiesOwner.has(propID)
//                 ))
//         ));

//         this.propertySentEvent.use((from, to, propID) => {
//             updateDisowned(draft => {
//                 if (to === BANK) draft.findIndex(id => from);
//             });
//         });
//     }
// }

/*

function addPlayer(info: Omit<PlayerInfo, 'id'>) {
    const pid = store.add(info);
    store.set(pid, MoneyData, settings.defaultMoney);
    store.set(pid, PropertiesData);
};

return {
    propertiesOwner,
    properties,
    moveProperty,
    sendMoney,
    addPlayer,
};
};

export type MonopolyGame = ReturnType<typeof MonopolyGameLogic>;
const MonopolyGameContext = createContext<MonopolyGame | undefined>(undefined);

export const MonopolyGame: FC<MonopolySettings>
    = ({ children, ...settings }) => (
        <MonopolyGameContext.Provider value={MonopolyGameLogic(settings)}>
            {children}
        </MonopolyGameContext.Provider>
    );

export function useMonopoly(): MonopolyGame {
    const context = useContext(MonopolyGameContext);
    if (!context)
        throw new Error('useMonopoly called outside an MonopolyGame context');
    return context;
}
*/