import "reflect-metadata";
import {
    AnyParams,
    Constructor,
    FunctionWithParams,
    InjectedConstructor,
    InjectedFunction,
    ParameterProvider,
} from "./types";

// tslint:disable: ban-types

/**
 * Converts a class constructor with parameters into a constructor with optional parameters.
 * Where possible parameter values are provided when no value is passed to the new constructor.
 * This logic is determied by the parameterProvider function.
 *
 * @param type Type to be constructed
 * @param parameterProvider function to lookup the constructor parameter value
 */
export function injectConstructor<T extends new (...args: any[]) => any>(
    type: T,
    parameterProvider: ParameterProvider,
) {
    return createClassOptionalConstructorParams<T, ConstructorParameters<T>>(type, parameterProvider);
}

/**
 * Wraps a function and provides arguments from parameterProvider
 * Where possible argument values are provided when no value is passed to the new constructor.
 * This logic is determied by the parameterProvider function.
 *
 * @param type Type to be constructed
 * @param paramTypes The types to be constructed (unfortunately this can't be done by reflection)
 * @param parameterProvider function to lookup the constructor parameter value
 */
export function injectFunction<T extends FunctionWithParams>(
    func: T,
    paramTypes: AnyParams<Parameters<T>>,
    parameterProvider: ParameterProvider,
    ) {
    return createFunctionOptionalParams<T, Parameters<T>>(func, paramTypes as Parameters<T>, parameterProvider);
}

function createClassOptionalConstructorParams<T extends Constructor, P extends any[]>(
    type: T,
    parameterProvider: ParameterProvider,
) {
    return wrapClassConstructor<T, Partial<P>>(type, parameterProvider);
}

function createFunctionOptionalParams<T extends FunctionWithParams, P extends any[]>(
    func: T,
    paramTypes: P,
    parameterProvider: ParameterProvider,
) {
    return wrapFunction<T, Partial<P>>(func, paramTypes, parameterProvider);
}

function wrapClassConstructor<T extends Constructor, TParams extends any[]>(
    type: T,
    parameterProvider: ParameterProvider,
) {

    const params: any[] = Reflect.getMetadata("design:paramtypes", type);

    if (params == null || params.length == null || params.length === 0) {
        return type as unknown as InjectedConstructor<T, TParams>;
    }

    return class extends type {
        constructor(...args: any[]) {

            function resolveParameter(paramReflect: any, index: number) {
                return parameterProvider(args[index], paramReflect);
            }

            const constructorParams = params.map(resolveParameter);

            super(...constructorParams);
        }
    } as unknown as InjectedConstructor<T, TParams>;
}

// Decorator just to ensure that we get metadata for classes
function saveMetaData() {
    // tslint:disable-next-line: no-empty
    return (...args: any[]) => {};
}

function wrapFunction<T extends FunctionWithParams, TParams extends any[]>(
    func: T,
    paramTypes: TParams,
    parameterProvider: ParameterProvider,
) {

    if (paramTypes == null || paramTypes.length == null || paramTypes.length === 0) {
        return func as unknown as InjectedFunction<T, TParams>;
    }

    return ((...args: any[]) => {

        function resolveParameter(paramReflect: any, index: number) {
            return parameterProvider(args[index], paramReflect);
        }

        const functionParams = paramTypes.map(resolveParameter);

        return func(...functionParams);
    }) as unknown as InjectedFunction<T, TParams>;
}
