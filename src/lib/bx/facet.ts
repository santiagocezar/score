import { Number, Runtype, Static } from 'runtypes';

export type JsonMap = { [k in string]?: Json; };
export type Json =
    | string
    | number
    | boolean
    | null
    | Json[]
    | JsonMap;

type JsonTransform<J extends Runtype, T> = {
    fromJSON: (json: Static<J>) => T;
    toJSON: (obj: T) => Static<J>;
};

export type FacetDecl<J extends Runtype, T = Static<J>> = {
    guard: J;
    default: () => T;
} & (T extends Static<J> ? {} : {
    transform: JsonTransform<J, T>;
});

// export function createFacet<T>(builder: (T extends Json ? () => T : never) | FacetDecl<T>): FacetDecl<T> {
//     if (builder instanceof Function) {
//         return {
//             default: builder,
//             //@ts-expect-error
//             deserialize: v => v,
//             serialize: v => v,
//         };
//     } else {
//         return builder;
//     }
// };


export function createFacet<J extends Runtype>(type: J, def: () => Static<J>): FacetDecl<J>;
export function createFacet<J extends Runtype, T>(type: J, def: () => T, transform: JsonTransform<J, T>): FacetDecl<J, T>;
export function createFacet<J extends Runtype, T = Static<J>>(type: J, def: () => T, transform?: JsonTransform<J, T>): FacetDecl<J, T> {
    if (transform) {
        return {
            guard: type,
            default: def,
            transform
        } as any as FacetDecl<J, T>;
    } else {
        return {
            guard: type,
            default: def,
        } as any as FacetDecl<J, T>;
    }
};

export type FacetDeclarations = {
    [key: string]: FacetDecl<any>;
};
export type FacetValue<F extends FacetDecl<any>> =
    F extends FacetDecl<any, infer T>
    ? T
    : never;


export type Facets<F extends FacetDeclarations> = {
    [K in keyof F]: FacetValue<F[K]>
};

export function buildFacets<F extends FacetDeclarations>(builders: F): Facets<F> {
    //@ts-expect-error
    const facets: Record<keyof F, any> = {};
    for (const name in builders) {
        facets[name] = builders[name].default();
    }
    return facets as Facets<F>;
}


// const facetBuilders = {
//     money: () => 0,
//     name: () => '',
// };

// declare const facets: Facets<typeof facetBuilders>;
// declare function facetTuple
//     <F extends FacetBuilders, T extends FacetKeyTuple<F>>
//     (fb: F, ...key: T): FacetTuple<F, T>;

// facets.money;

// const [money, name] = facetTuple(facetBuilders, 'money', 'name');
