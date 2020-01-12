
type Prepend<F, R extends any[]> = ((param: F, ...a: R) => any) extends ((...a: infer U) => any)? U : [F];
type First<T extends any[]> = T extends [infer TFirst, ...any[]] ? TFirst : never;
type Rest<T extends any[]> = ((...args: T) => any) extends ((f: string, ...t: infer TRest) => any) ? TRest : never;

export interface IFunctionWithMetadata<TParams extends any[]> extends FunctionWithParams<TParams> {
    __functionParamMetadata: MapMeta<TParams>;
}

/**
 * A function to provide constructor parameter values
 * If a parameter was passed to the wrapped constructor it is passed as the first argument
 * Reflect Metadata (usually the type of the parameter) is passed as the second argument
 */
export type ParameterProvider = (passedParameter: any, reflectData: any) => any;

export type Constructor = new (...args: any[]) => any;
export type FunctionWithParams<P extends any[] = any[]> = (...args: P) => any;

export type InjectedConstructor<T extends Constructor, P extends any[]> =
    T extends new (...args: any[]) => infer R ? new (...args: P) => R : never;
export type InjectedFunction<T extends FunctionWithParams, P extends any[]> =
    T extends (...args: any) => infer R ? (...args: P) => R : never;

export type Meta<T> = new (...args: any[]) => T;
export type MapMeta<T extends any[]> = {
    [P in keyof T]?: Meta<T[P]>;
};
export type MapFunctionParams<T extends any[]> = Partial<T>;
