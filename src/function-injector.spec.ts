import { injectFunction } from './function-injector';
import { ParameterProvider } from './types';

// tslint:disable: max-classes-per-file

class ClassWithNoParams {
    public noParamSource = 'constructedWithNew';
}

class ClassWithParameters {
    public paramSource = 'constructedWithNew';
    constructor(
        public readonly paramOne: string,
        public readonly paramTwo: number,
        public readonly paramThree: boolean) {
    }
}

let injectedNoParams: ClassWithNoParams;
let injectedWithParams: ClassWithParameters;

const parameterProvider: ParameterProvider = (passed: any, reflect: any) => {
    if (passed != null) {
        return passed;
    }

    switch (reflect) {
        case String:
            return 'stringArg';
        case Number:
            return 5;
        case Boolean:
            return true;
        case ClassWithNoParams:
            return injectedNoParams;
        case ClassWithParameters:
            return injectedWithParams;

        default:
            return `UNKNOWN REFLECT: ${reflect}`;
    }
};

describe('function-injection', () => {

    beforeEach(() => {
        injectedNoParams = new ClassWithNoParams();
        injectedNoParams.noParamSource = 'injected';
        injectedWithParams = new ClassWithParameters('one', 2, true);
        injectedWithParams.paramSource = 'injected';
    });

    function functionWithParameters(
        paramOne: string,
        paramTwo: number,
        paramThree: boolean,
        paramFour: ClassWithNoParams,
        paramFive: ClassWithParameters) {
        return `'${typeof paramOne}:${paramOne}' '${typeof paramTwo}:${paramTwo}' '${typeof paramThree}:${paramThree}' '${typeof paramFour}:${paramFour.noParamSource}' '${typeof paramFive}:${paramFive.paramSource}:${paramFive.paramOne}:${paramFive.paramTwo}'`;
    }

    it('should return original function if there are no parameters', () => {

        function functionWithNoParams() {
            return `noParams`;
        }

        const injectedFunction = injectFunction(functionWithNoParams, [], parameterProvider);

        expect(injectedFunction).toBe(functionWithNoParams);
    });

    it('should use params from provider when no params passed to constructor', () => {
        const injectedFunction = injectFunction(
            functionWithParameters,
            [String, Number, Boolean, ClassWithNoParams, ClassWithParameters],
            parameterProvider);
        const returnValue = injectedFunction('passedParam');

        expect(returnValue).toEqual(
            '\'string:passedParam\' \'number:5\' \'boolean:true\' \'object:injected\' \'object:injected:one:2\'',
        );
    });

    it('should use passed params when provided', () => {
        const injectedFunction = injectFunction(
            functionWithParameters,
            [String, Number, Boolean, ClassWithNoParams, ClassWithParameters],
            parameterProvider);
        const noParamInstance = new ClassWithNoParams();
        const paramsInstance = new ClassWithParameters('one', 2, true);
        const returnValue = injectedFunction('passedParam', 6, false, noParamInstance, paramsInstance);

        expect(returnValue).toEqual(
            '\'string:passedParam\' \'number:6\' \'boolean:false\' \'object:constructedWithNew\' \'object:constructedWithNew:one:2\'',
        );
    });

});
