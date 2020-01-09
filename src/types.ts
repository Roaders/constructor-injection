// tslint:disable: ban-types
// tslint:disable: max-classes-per-file

/**
 * A function to provide constructor parameter values
 * If a parameter was passed to the wrapped constructor it is passed as the first argument
 * Reflect Metadata (usually the type of the parameter) is passed as the second argument
 */
export type ParameterProvider = (passedParameter: any, reflectData: any) => any;

export type Constructor = new (...args: any[]) => any;
export type FunctionWithParams<P extends any[] = any[]> = (...args: P) => any;
export type AnyParams<T extends any[]> = {[P in keyof T]: any};
export type InjectedConstructor<T extends Constructor, P extends any[]> =
    T extends new (...args: any[]) => infer R ? new (...args: P) => R : never;
export type InjectedFunction<T extends FunctionWithParams, P extends any[]> =
    T extends (...args: any) => infer R ? (...args: P) => R : never;

export type NO_META = "noMeta";
export const noMeta: NO_META = "noMeta";

export type Meta<T> = T extends String | Number | Boolean | Function ? NO_META : (new (...args: any[]) => T) | NO_META;
export type MapMeta<T extends any[]> = {
    [P in keyof T]?: Meta<T[P]>;
};

export interface IFunctionWithMetadata<TParams extends any[]> extends FunctionWithParams<TParams> {
    meta: MapMeta<TParams>;
}

export function isDecorated<TParams extends any[]>(func: (...args: TParams) => any)
    : func is IFunctionWithMetadata<TParams> {
    return func != null && Array.isArray((func as IFunctionWithMetadata<TParams>).meta);
}

export function addMetadata<TFunc extends (...args: any[]) => any>(func: TFunc, meta: MapMeta<Parameters<TFunc>>) {
    return func;
}

class MyClass {
    public one = "one";
}

function myFunc(one: string, two: number, three: MyClass, four: boolean) {
    return three.one;
}

const decorated = addMetadata(myFunc, [noMeta, undefined, MyClass]);

if (isDecorated(decorated)) {
    console.log(decorated.meta.length);
}
