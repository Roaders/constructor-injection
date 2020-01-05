import "reflect-metadata";

/**
 * A function to provide constructor parameter values
 * If a parameter was passed to the wrapped constructor it is passed as the first argument
 * Reflect Metadata (usually the type of the parameter) is passed as the second argument
 */
export type ParameterProvider = (passedParameter: any, reflectData: any) => any;

type Constructor = new (...args: any[]) => any;
type ConstructorParams<T extends Constructor> = T extends new (...args: infer P) => any ? P : never;
type InjectedConstructor<T extends Constructor, P extends any[]> =
        T extends new (...args: any[]) => infer R ? new (...args: P) => R : never;

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

function createClassOptionalConstructorParams<T extends new (...args: any[]) => any, P extends any[]>(
    type: T,
    parameterProvider: ParameterProvider,
) {
    return wrapClassConstructor<T, Partial<P>>(type, parameterProvider);
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
