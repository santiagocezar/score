import { hasOwnProperty } from 'lib/utils';
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

export class FieldDeclaration<J extends Runtype, T = Static<J>> {
    private runtype: J;
    private defaultFn: () => T;
    private transform: JsonTransform<J, T> | undefined;

    constructor(runtype: J, defaultFn: () => T, transform?: JsonTransform<J, T>) {
        this.runtype = runtype;
        this.defaultFn = defaultFn;
        this.transform = transform;
    };
    new(): T {
        return this.defaultFn();
    }

    fromJSON(json: any): T {
        if (this.runtype.guard(json)) {
            if (this.transform) {
                return this.transform.fromJSON(json);
            }
            return json as T;
        }
        return this.defaultFn();
    }
    toJSON(obj: T): Static<J> {
        console.log(this.transform);
        if (this.transform) {
            const json = this.transform.toJSON(obj);
            return this.runtype.check(json);
        };
        return obj as Static<J>;
    }
}

export function createFacet<J extends Runtype>(type: J, def: () => Static<J>): FieldDeclaration<J>;
export function createFacet<J extends Runtype, T>(type: J, def: () => T, transform: JsonTransform<J, T>): FieldDeclaration<J, T>;
export function createFacet<J extends Runtype, T = Static<J>>(type: J, def: () => T, transform?: JsonTransform<J, T>): FieldDeclaration<J, T> {
    return new FieldDeclaration(type, def, transform);
};

export type FieldGroup = {
    [key: string]: FieldDeclaration<any>;
};
export type FacetValue<F extends FieldDeclaration<any>> =
    F extends FieldDeclaration<any, infer T>
    ? T
    : never;


export type Facets<F extends FieldGroup> = {
    [K in keyof F]: FacetValue<F[K]>
};

export function buildFacets<F extends FieldGroup>(builders: F): Facets<F> {
    //@ts-expect-error
    const facets: Facets<F> = {};
    for (const name in builders) {
        facets[name] = builders[name].new();
    }
    return facets;
}

export function checkFacets<F extends FieldGroup>(j: object, builders: F): Facets<F> {
    //@ts-expect-error
    const facets: Facets<F> = {};
    for (const name in builders) {
        if (hasOwnProperty(j, name)) {
            facets[name] = builders[name].fromJSON(j[name]);
        } else {
            facets[name] = builders[name].new();
        }
    }
    return facets;
}

export function facetsToJson<F extends FieldGroup>(fields: Facets<F>, decls: F): any {
    const json: any = {}
    for (const key in fields) {
        json[key] = decls[key].toJSON(fields[key]);
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
