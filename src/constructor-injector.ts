import "reflect-metadata";

export type ParameterProvider = (reflectType: any, passedParameter: any) => any;

export function injectConstructor<T extends new (...args: any[]) => any>(
    type: T,
    parameterProvider: ParameterProvider,
    ) {

    return class extends type {
        constructor(...args: any[]) {

            function resolveParameter(paramReflect: any, index: number) {
                return parameterProvider(paramReflect, args[index]);
            }

            const params: any[] = Reflect.getMetadata("design:paramtypes", type);

            const constructorParams = params.map(resolveParameter);

            super(...constructorParams);
        }
    };
}
