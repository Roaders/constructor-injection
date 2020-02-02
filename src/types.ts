import { List } from 'ts-toolbelt';

// tslint:disable: ban-types

export type FunctionWithParams<P extends any[] = any[]> = (...args: P) => any;

export interface IFunctionWithMetadata<TParams extends any[]> extends FunctionWithParams<TParams> {
    __functionParamMetadata: MapMeta<TParams>;
}

export type ConstructorOptionalParams<T extends new (...args: any[]) => any> =
    new (...args: List.Optional<ConstructorParameters<T>>) => InstanceType<T>;

export type FunctionOptionalParams<T extends FunctionWithParams> =
    (...args: List.Optional<Parameters<T>>) => ReturnType<T>;

/**
 * A function to provide constructor parameter values
 * If a parameter was passed to the wrapped constructor it is passed as the first argument
 * Reflect Metadata (usually the type of the parameter) is passed as the second argument
 */
export type ParameterProvider = (passedParameter: any, reflectData: any, index: number) => any;

export type PrimitiveStringMeta<T> = T extends string ? typeof String : PrimitiveNumberMeta<T>;
export type PrimitiveNumberMeta<T> = T extends number ? typeof Number : PrimitiveBooleanMeta<T>;
export type PrimitiveBooleanMeta<T> = T extends boolean ? typeof Boolean : never;
export type Meta<T> = T extends string | number | boolean ? PrimitiveStringMeta <T> : new (...args: any[]) => T;
export type MapMeta<T extends any[]> = {
    [P in keyof T]?: Meta<T[P]>;
};
