# constructor-injection

[![Build Status](https://travis-ci.org/Roaders/cineworld-planner.svg?branch=master)](https://travis-ci.org/Roaders/cineworld-planner)

## Install

```
npm install constructor-injection
```

## Example Usage

```typescript
import {} from "constructor-injection";

@Injectable() // from Inversify or Angular for example
class ClassWithParameters {
    constructor(
        public readonly paramOne: string,
        public readonly paramTwo: number,
        public readonly paramThree: boolean) {
    }
}

function resolveParameter: ParameterProvider = (passedParameter: any, reflectMetadata: any){
    // Logic to provide correct parameter value
    // For example if inversify is your DI library:
    return passedParameter != null ? passedParameter : inversifyContainer.getType(reflectMetadata);
}

const injectedConstructor = injectConstructor(ClassWithParameters, resolveParameter);

const instance = new injectedConstructor();
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

Minimum Typescript version: `3.1`
