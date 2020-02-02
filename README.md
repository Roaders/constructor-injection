# constructor-injection

[![Build Status](https://travis-ci.org/Roaders/cineworld-planner.svg?branch=master)](https://travis-ci.org/Roaders/cineworld-planner)
![NPM version](https://img.shields.io/npm/v/constructor-injection)
![Dependencies](https://img.shields.io/david/roaders/constructor-injection)
![Typescript](https://camo.githubusercontent.com/d81d2d42b56e290c0d4d74eb425e19242f4f2d3d/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f74797065732f73637275622d6a732e737667)


## Install

```
npm install constructor-injection
```

## Example Usage

### Constructor Injection

```typescript
import { injectConstructor } from "constructor-injection";

@Injectable() // from Inversify or Angular for example
class ClassWithParameters {
    constructor(
        public readonly paramOne: string,
        public readonly paramTwo: number,
        public readonly paramThree: boolean) {
    }
}

const resolveParameter: ParameterProvider = (passedParameter: any, reflectMetadata: any, index: number) => {
    // Logic to provide correct parameter value
    // For example if inversify is your DI library:
    return passedParameter != null ? passedParameter : inversifyContainer.get(reflectMetadata);
};

const injectedConstructor = injectConstructor(ClassWithParameters, resolveParameter);

const instance = new injectedConstructor();
```

### Function Injection

A similar approach can be used to provide values for function parameters. Unfortunately the metadata for function parameters isn't currently available so we need to provide the metadata for the function parameters ourselves.

```typescript
import { injectFunction } from "constructor-injection";

function functionWithParameters(
    paramOne: string,
    paramTwo: ClassWithNoParams,
    paramThree: ClassWithParameters): string {
    return "return value";
}

const resolveParameter: ParameterProvider = (passedParameter: any, reflectMetadata: any, index: number) => {
    // Logic to provide correct parameter value
    // For example if inversify is your DI library:
    return passedParameter != null ? passedParameter : inversifyContainer.get(reflectMetadata);
};

const injectedFunction = injectFunction( // typed as (paramOne?: string, paramTwo?: ClassWithNoParams, paramThree?: ClassWithParameters) => string
    functionWithParameters, 
    [ undefined, ClassWithNoParams, ClassWithParameters ], // provide types to inject 
    resolveParameter);

injectedFunctions("stringValueThatCantBeInjected"); // call function
```

## Setup

This package uses Reflect Metadata to inspect the constructor parameters of your class. To use this your `tsconfig.json` must contain:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,    
        "emitDecoratorMetadata": true      
    }
}
```

and the class that you are trying to construct MUST have a decorator to inform typescript that metadata should be saved:

```typescript
@Injectable()
class ClassWithParameters {
    constructor(
        public readonly paramOne: string,
        public readonly paramTwo: number,
        public readonly paramThree: boolean) {
    }
}
```

you must also install and import `reflect-metadata` somwhere in your app - preferably as the first import.

```
npm install reflect-metadata
```

```typescript
import "reflect-metadata";
```

Minimum Typescript version: `3.5`
