import { IFunctionWithMetadata } from "./types";

export function isDecoratedFunction<TParams extends any[]>(
    func: (...args: TParams) => any): func is IFunctionWithMetadata<TParams> {
    return func != null && Array.isArray((func as IFunctionWithMetadata<TParams>).__functionParamMetadata);
}
