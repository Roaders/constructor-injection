import "reflect-metadata";

// tslint:disable: ban-types
// tslint:disable: max-classes-per-file

/**
 * A function to provide constructor parameter values
 * If a parameter was passed to the wrapped constructor it is passed as the first argument
 * Reflect Metadata (usually the type of the parameter) is passed as the second argument
 */
export type ParameterProvider = (passedParameter: any, reflectData: any) => any;

type Constructor = new (...args: any[]) => any;
type Function = (...args: any[]) => any;
type ConstructorParams<T extends Constructor> = T extends new (...args: infer P) => any ? P : never;
type FunctionParams<T extends Function> = T extends (...args: infer P) => any ? P : never;
type AnyParams<T extends any[]> = {[P in keyof T]: any};
type InjectedConstructor<T extends Constructor, P extends any[]> =
    T extends new (...args: any[]) => infer R ? new (...args: P) => R : never;
type InjectedFunction<T extends Function, P extends any[]> =
    T extends (...args: any) => infer R ? (...args: P) => R : never;

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
    return createClassOptionalConstructorParams<T, ConstructorParams<T>>(type, parameterProvider);
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
export function injectFunction<T extends Function>(
    func: T,
    paramTypes: AnyParams<FunctionParams<T>>,
    parameterProvider: ParameterProvider,
    ) {
    return createFunctionOptionalParams<T, FunctionParams<T>>(func, paramTypes as FunctionParams<T>, parameterProvider);
}

function createClassOptionalConstructorParams<T extends Constructor, P extends any[]>(
    type: T,
    parameterProvider: ParameterProvider,
) {
    return wrapClassConstructor<T, Partial<P>>(type, parameterProvider);
}

function createFunctionOptionalParams<T extends Function, P extends any[]>(
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

function wrapFunction<T extends Function, TParams extends any[]>(
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
