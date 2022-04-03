import { 
    ClassNameToClassDict, 
    Serializable,
    WrappedSerializable,
    deserialize
} from "./serialization";
import Matrix, { scalar } from "../Matrix/index";


export abstract class Loss extends Serializable {
    abstract forward(y: Matrix, output: Matrix): number;
    abstract backward(y: Matrix, output: Matrix): Matrix;

    getConfig() {return undefined};
}

// sum of the squared errors
export class SSE extends Loss {
    className= "SSE";
    forward(y: Matrix, output: Matrix) {
        // 1/2 * (y- output)**2
        return scalar(0.5).mul(y.sub(output).pow(2)).sum();
    }

    backward(y: Matrix, output: Matrix) {
        // -(ground truth - the actual predicted value)
        return y.sub(output).mul(-1);
    }

}

export class CategoricalCrossentropy extends Loss {
    className="CategoricalCrossentropy"
    
    forward(y: Matrix, output: Matrix): number {
        return y.mul(output.map(v => -Math.log(v))).sum();
    }

    backward(y: Matrix, output: Matrix): Matrix {
        console.log({y, output, result: y.div(output).mul(-1)})
        return y.div(output).mul(-1)
    }
}

export const lossDict: ClassNameToClassDict<Loss> = {
    "sse": SSE,
    "categoricalcrossentropy": CategoricalCrossentropy
}


export const getLoss = (loss: string|Loss|WrappedSerializable) => {
    if (typeof loss === "string") {
        return deserialize({
            className: loss, 
            config: {}
        }, lossDict , "loss")
    }
    else if (loss instanceof Loss) return loss;

    return deserialize(loss, lossDict, "loss");
}
