import { injectConstructor, injectFunction, ParameterProvider } from "./constructor-injector";

// Decorator just to ensure that we get metadata for classes
function saveMetaData() {
    // tslint:disable-next-line: no-empty
    return (...args: any[]) => {};
}

const parameterProvider: ParameterProvider = (passed: any, reflect: any) => {
    if (passed != null) {
        return passed;
    }

    switch (reflect) {
        case String:
            return "stringArg";
        case Number:
            return 5;
        case Boolean:
            return true;

        default:
            return `unknown reflect type: ${reflect}`;
    }
};

// tslint:disable: max-classes-per-file
describe("constructor-injection", () => {

    @saveMetaData()
    class ClassWithParameters {
        constructor(
            public readonly paramOne: string,
            public readonly paramTwo: number,
            public readonly paramThree: boolean) {
        }
    }

    it("should return original class if there are no parameters", () => {
        @saveMetaData()
        class ClassWithNoParams {}

        const injectedConstructor = injectConstructor(ClassWithNoParams, parameterProvider);

        expect(injectedConstructor).toBe(ClassWithNoParams);
    });

    it("should use params from provider when no params passed to constructor", () => {
        const injectedConstructor = injectConstructor(ClassWithParameters, parameterProvider);
        const instance = new injectedConstructor();

        expect(instance.paramOne).toEqual("stringArg");
        expect(instance.paramTwo).toEqual(5);
        expect(instance.paramThree).toEqual(true);
    });

    it("should use passed params when provided", () => {
        const injectedConstructor = injectConstructor(ClassWithParameters, parameterProvider);
        const instance = new injectedConstructor("passedParamValue", 6, false);

        expect(instance.paramOne).toEqual("passedParamValue");
        expect(instance.paramTwo).toEqual(6);
        expect(instance.paramThree).toEqual(false);
    });

});

describe("function-injection", () => {

    function functionWithParameters(
            paramOne: string,
            paramTwo: number,
            paramThree: boolean) {
            return `${typeof paramOne}:${paramOne} ${typeof paramTwo}:${paramTwo} ${typeof paramThree}:${paramThree}`;
        }

    it("should return original function if there are no parameters", () => {

        function functionWithNoParams() {
            return `noParams`;
        }

        const injectedFunction = injectFunction(functionWithNoParams, [], parameterProvider);

        expect(injectedFunction).toBe(functionWithNoParams);
    });

    it("should use params from provider when no params passed to constructor", () => {
        const injectedFunction = injectFunction(functionWithParameters, [String, Number, Boolean], parameterProvider);
        const returnValue = injectedFunction();

        expect(returnValue).toEqual("string:stringArg number:5 boolean:true");
    });

    it("should use passed params when provided", () => {
        const injectedFunction = injectFunction(functionWithParameters, [String, Number, Boolean], parameterProvider);
        const returnValue = injectedFunction("passedParamValue", 6, false);

        expect(returnValue).toEqual("string:passedParamValue number:6 boolean:false");
    });

});
