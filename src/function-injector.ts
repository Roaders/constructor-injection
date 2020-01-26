import { isDecoratedFunction } from "./type-guards";
import {
    FunctionWithParams,
    IFunctionWithMetadata,
    InjectedFunction,
    MapFunctionParams,
    MapMeta,
    ParameterProvider,
} from "./types";

export function addFunctionMetadata<TFunc extends (...args: any[]) => any>(
    func: TFunc,
    meta: MapMeta<Parameters<TFunc>>,
    ) {
    const funcWithMetadata = func as unknown as IFunctionWithMetadata<Parameters<TFunc>>;

    funcWithMetadata.__functionParamMetadata = meta;

    return func;
}

/**
 * Wraps a function and provides arguments from parameterProvider
 * Where possible argument values are provided when no value is passed to the new constructor.
 * This logic is determied by the parameterProvider function.
 *
 * @param type Type to be constructed
 * @param paramMetadata The types to be constructed (unfortunately this can't be done by reflection)
 * @param parameterProvider function to lookup the constructor parameter value
 */
export function injectFunction<TFunc extends FunctionWithParams>(
    func: TFunc,
    paramMetadata: MapMeta<Parameters<TFunc>>,
    parameterProvider: ParameterProvider,
    ) {

    addFunctionMetadata(func, paramMetadata);

    return createFunctionOptionalParams<TFunc, Parameters<TFunc>>(func, parameterProvider);
}

function createFunctionOptionalParams<TFunc extends FunctionWithParams, P extends any[]>(
    func: TFunc,
    parameterProvider: ParameterProvider,
) {
    return wrapFunction<TFunc, MapFunctionParams<P>>(func, parameterProvider);
}

function wrapFunction<T extends FunctionWithParams, TParams extends any[]>(
    func: T,
    parameterProvider: ParameterProvider,
) {
    let params: any[] = [];

    if (isDecoratedFunction(func)) {
        params = func.__functionParamMetadata;
    }

    if (params == null || params.length == null || params.length === 0) {
        return func as unknown as InjectedFunction<T, TParams>;
    }

    return ((...args: any[]) => {

        function resolveParameter(paramReflect: any, index: number) {
            return parameterProvider(args[index], paramReflect);
        }

        const functionParams = params.map(resolveParameter);

        return func(...functionParams);
    }) as unknown as InjectedFunction<T, TParams>;
}
