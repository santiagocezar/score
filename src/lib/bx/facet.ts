import { hasOwnProperty } from 'lib/utils';
import { z } from 'zod';

export type JsonMap = { [k in string]?: Json; };
export type Json =
    | string
    | number
    | boolean
    | null
    | Json[]
    | JsonMap;

// type JsonTransform<J extends z.ZodTypeAny, T> = {
//     fromJSON: (json: z.infer<J>) => T;
//     toJSON: (obj: T) => z.infer<J>;
// };

type Encoder<T extends z.ZodTypeAny> =
    z.output<T> extends Json
    ? undefined
    : (value: z.output<T>) => Json;

type Default<T extends z.ZodTypeAny> =
    () => z.output<T>;

export type Field<T extends z.ZodTypeAny = any> = {
    type: T;
    encode: Encoder<T>;
    def: Default<T>;
};

export type FieldInfer<F extends Field> =
    F extends Field<infer T>
    ? z.infer<T>
    : never;

export function createField<T extends z.ZodTypeAny>(type: T, def: Default<T>, ...[encode]: Encoder<T> extends undefined ? [] : [encode: Encoder<T>]): Field<T> {
    return {
        type, encode, def
    };
}

export type FieldGroup = {
    [key: string]: Field;
};

export type Facets<F extends FieldGroup> = {
    [K in keyof F]: FieldInfer<F[K]>
};

export function buildFacets<F extends FieldGroup>(builders: F): Facets<F> {
    //@ts-expect-error mapped keys
    const facets: Facets<F> = {};
    for (const name in builders) {
        facets[name] = builders[name].def();
    }
    return facets;
}

export function checkFacets<F extends FieldGroup>(j: object, builders: F): Facets<F> {
    //@ts-expect-error mapped keys
    const facets: Facets<F> = {};
    for (const name in builders) {
        if (hasOwnProperty(j, name)) {
            try {
                facets[name] = builders[name].type.parse(j[name]);
            } catch (err) {
                console.log('this can actually happen');
                console.error(err);
                facets[name] = builders[name].def();
            }
        } else {
            facets[name] = builders[name].def();
        }
    }
    return facets;
}

export function facetsToJson<F extends FieldGroup>(fields: Facets<F>, decls: F): any {
    const json: any = {};
    for (const key in fields) {
        json[key] = decls[key].encode?.(fields[key]) ?? fields[key];
    }
    return json;
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
