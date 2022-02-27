import {  } from "./layers";
import Matrix, { scalar } from "../Matrix";
import { ClassNameToClassDict, deserialize, Serializable, WrappedSerializable } from "./serialization";

export abstract class Activation extends Serializable{ 

    inputs?: Matrix;
    outputs?: Matrix;
    delta?: Matrix;

    abstract forward(input: Matrix): Matrix;
    
    abstract backward(passBackError: Matrix): Matrix; 
}


export class Sigmoid extends Activation { 

    className = "Sigmoid";

    forward(input: Matrix) {
        this.inputs = input;
        this.outputs = input.map(v => 1/ (1+ Math.exp(-v)) )
        return this.outputs;
    }

    backward(passBackError: Matrix) {
        if (!this.inputs || !this.outputs) throw new Error();
        
        const dSigmoid = this.outputs.map(v => v * (1 - v) )
        this.delta = passBackError.mul(dSigmoid);

        return this.delta;
    }

}

const activationDict: ClassNameToClassDict<Activation> = { 
    "sigmoid": Sigmoid
}

export const getActivation = (activation: string|Activation|WrappedSerializable) => {
    if (typeof activation === "string") {
        return deserialize({className: activation, config: {}}, activationDict , "initializer")
    }
    else if (activation instanceof Activation) return activation;

    return deserialize(activation, activationDict, "initializer");
}
