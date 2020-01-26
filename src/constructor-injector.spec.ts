import { injectConstructor } from "./constructor-injector";
import { ParameterProvider } from "./types";

// tslint:disable: max-classes-per-file

// Decorator just to ensure that we get metadata for classes
function saveMetaData() {
    // tslint:disable-next-line: no-empty
    return (...args: any[]) => { };
}

@saveMetaData()
class ClassWithNoParams {
    public readonly type = "ClassWithNoParams";
}

@saveMetaData()
class ClassWithParameters {
    public readonly type = "ClassWithParameters";
    constructor(
        public readonly paramOne: string,
        public readonly paramTwo: number,
        public readonly paramThree: boolean) {
    }
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

describe("constructor-injection", () => {

    it("should return original class if there are no parameters", () => {

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
