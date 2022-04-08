import {  } from "./layers";
import Matrix, { scalar } from "../Matrix";
import { ClassNameToClassDict, deserialize, Serializable, WrappedSerializable } from "./serialization";

export abstract class Activation extends Serializable{ 

    input?: Matrix;
    output?: Matrix;
    delta?: Matrix;

    abstract forward(input: Matrix): Matrix;
    
    abstract backward(passBackError: Matrix): Matrix; 
}

export class Sigmoid extends Activation { 

    className = "Sigmoid";

    forward(input: Matrix) {
        this.input = input;
        this.output = input.map(v => 1/ (1+ Math.exp(-v)) )
        return this.output;
    }

    backward(passBackError: Matrix) {
        if (!this.input || !this.output) throw new Error();
        
        const dSigmoid = this.output.map(v => v * (1 - v) )
        this.delta = passBackError.mul(dSigmoid);

        return this.delta;
    }

}

export class ReLU extends Activation {
    className ="ReLU"
    
    forward(input: Matrix) {
        this.input = input;
        this.output = input.map(v => v > 0 ? v : 0)
        return this.output;
    }

    backward(passBackError: Matrix) {
        if (!this.input || !this.output) throw new Error();
        
        const dReLU = this.input.map(v => v > 0 ? 1 : 0)
        this.delta = passBackError.mul(dReLU);

        return this.delta;
    }
}

export class SoftMax extends Activation {
    className = "SoftMax"
    
    forward(input: Matrix) {
        this.input=input;
        //stop values from getting too big
        const normalised = input.sub(input.maxCols());
    
        const expValues = normalised.map(v => Math.exp(v));
        const sums = expValues.sumRows();

        this.output = expValues.div(sums);
        return this.output;
    }

    backward(passBackError: Matrix) {
        if (!this.output) throw new Error();
        const delta = Matrix.fill(passBackError.shape); 
        this.output.forEachColumn((column, index) => {
            const identity = Matrix.identity([column.rows, column.rows]);
            const jacobian = column.mul(identity.sub(column.transpose()))
            delta.setColumn(
                index, 
                jacobian.dot(passBackError.getColumn(index))
            );

        })
        this.delta = delta;
        return delta;
    }
}

const activationDict: ClassNameToClassDict<Activation> = { 
    "sigmoid": Sigmoid,
    "softmax": SoftMax,
    "relu": ReLU
}

export const getActivation = (activation: string|Activation|WrappedSerializable) => {
    if (typeof activation === "string") {
        return deserialize({
            className: activation, 
            config: {}
        }, activationDict , "activation")
    }
    else if (activation instanceof Activation) return activation;

    return deserialize(activation, activationDict, "activation");
}


