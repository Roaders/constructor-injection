import { injectConstructor, ParameterProvider } from "./constructor-injector";

describe("constructor-injection", () => {

    const parameterProvider: ParameterProvider = () => {
        return "param";
    };

    it("should return original class if there are no parameters", () => {
        class ClassWithNoParams {}

        const injectedConstructor = injectConstructor(ClassWithNoParams, parameterProvider);

        expect(injectedConstructor).toBe(ClassWithNoParams);
    });

});
