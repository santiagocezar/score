
export type Facet<T, J extends Json> = {
    name: string;
    default: () => T;
    ser: (value: T) => J;
    des: (value: J) => T;
    id: symbol;
};

export type JsonMap = { [k in string]?: Json; };
export type Json =
    | string
    | number
    | boolean
    | null
    | Json[]
    | JsonMap;

interface SerDes<T, J extends Json> {
    ser(value: T): J;
    des(value: J): T;
}

/**
 * For T to be valid, it has to be defined as a type, not an interface
 * 
 * @param key name for the facet, used for loading and saving it's state
 * @param defaultValue construct the value
 * @returns the facet with automatic deserialization
 */
export function createFacet<T extends Json>(key: string, defaultValue: () => T): Facet<T, T> {
    return createFacetSerde<T, T>(key, defaultValue, {
        ser: (v) => v,
        des: (v) => v,
    });
};
export function createFacetSerde<T, J extends Json>(key: string, defaultValue: () => T, serdes: SerDes<T, J>): Facet<T, J> {
    return {
        name: key,
        default: defaultValue,
        ser: serdes.ser,
        des: serdes.des,
        id: Symbol(),
    };
};

export class FacetPool extends Map<symbol, any> { };

export type OrUndefined<T> = { [P in keyof T]: T[P] | undefined; };

export type FacetValue<D> = D extends Facet<infer T, any> ? T : never;

export type FacetTuple<Vs extends [...any[]] = [...any[]]> = {
    [K in keyof Vs]: Facet<Vs[K], any>
};

/*export type OptionPartial<T extends readonly any[]> = {
    [K in keyof T]: Option<T[K]>
};*/

export type FacetTupleValues<Ds extends FacetTuple> = {
    [K in keyof Ds]: FacetValue<Ds[K]>
};

export type FacetTuplePartial<Ds extends FacetTuple> = OrUndefined<FacetTupleValues<Ds>>;
