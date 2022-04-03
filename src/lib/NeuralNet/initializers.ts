import {  } from "./layers";
import Matrix, { Shape } from "../Matrix";
import { 
    ClassNameToClassDict, 
    deserialize, 
    Serializable, 
    SerializableConstructor, 
    WrappedSerializable 
} from "./serialization";


export abstract class Initializer extends Serializable {
    abstract forward(shape: Shape): Matrix;
}

export class RandomUniform extends Initializer {
    className = "RandomUniform";
    min: number;
    max: number;

    constructor(min?: number, max?: number) {
        super();
        this.min = min || -0.99;
        this.max = max || 0.99;
    }
    
    forward(shape: Shape) {
        return Matrix.randUniform(shape, this.min, this.max);
    }

    getConfig() {
       return {
           min: this.min, 
           max: this.max
        };
    }

    static fromConfig<T extends Serializable>(
        cls: SerializableConstructor<T>, config: {[key: string]: any}): T {
        return new cls(config["min"], config["max"]);
    }
}

export class Zeros extends Initializer {
    className = "Zeros";
    
    forward(shape: Shape) {
        return Matrix.fill(shape, 0);
    }
}

export class Ones extends Initializer {
    className = "Ones";

    forward(shape: Shape) {
        return Matrix.fill(shape, 1);
    }
}


export class Constant extends Initializer {
    className = "Constant"
    private value: number;

    constructor(value?: number) {
        super();
        console.log({value})
        this.value = value || 0;
    }

    forward(shape: Shape) {
        return Matrix.fill(shape, this.value);
    }

    getConfig() {
        return {value: this.value}
    }

    static fromConfig<T extends Serializable>(
        cls: SerializableConstructor<T>, config: {[key: string]: any}): T {
        return new cls(config["value"]);
    }

}

const initializerDict: ClassNameToClassDict<Initializer> = { 
    "randomuniform": RandomUniform,
    "zeros": Zeros,
    "ones": Ones,
    "constant": Constant
}

export const getInitializer = (initializer: string|Initializer|WrappedSerializable) => {
    if (typeof initializer === "string") {
        return deserialize({className: initializer, config: {}}, initializerDict, "initializer")
    }
    else if (initializer instanceof Initializer) return initializer;

    return deserialize(initializer, initializerDict, "initializer");
}
