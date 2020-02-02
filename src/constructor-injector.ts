import 'reflect-metadata';
import { ConstructorOptionalParams, ParameterProvider } from './types';

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
): ConstructorOptionalParams<T> {

    const params: any[] = Reflect.getMetadata('design:paramtypes', type);

    if (params == null || params.length == null || params.length === 0) {
        return type as unknown as  ConstructorOptionalParams<T>;
    }

    return class extends type {
        constructor(...args: any[]) {

            function resolveParameter(paramReflect: any, index: number) {
                return parameterProvider(args[index], paramReflect, index);
            }

            const constructorParams = params.map(resolveParameter);

            super(...constructorParams);
        }
    } as unknown as ConstructorOptionalParams<T>;
}
