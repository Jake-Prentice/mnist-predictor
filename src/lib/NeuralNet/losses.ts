import { ClassNameToClassDict, Serializable } from "./serialization";
import Matrix, { scalar } from "../Matrix/index";

export interface IBackward extends IForward {};

interface IForward {
    y: Matrix;
    output: Matrix;
}

export abstract class Loss extends Serializable {
    abstract forward(props: IForward): number;
    abstract backward(props: IBackward): Matrix;

    getConfig() {return undefined};
}

// sum of the squared errors
export class SSE extends Loss {
    className= "SSE";
    forward({y, output}: IForward) {
        console.log({y, output})

        // 1/2 * (y- output)**2
        return scalar(0.5).mul(y.sub(output).pow(2)).sum();
    }

    backward({y, output}: IBackward) {
        // -(ground truth - the actual predicted value)
        return y.sub(output).mul(-1);
    }

}

export class CategoricalCrossentropy extends Loss {
    className="CategoricalCrossentropy"
    
    forward({y, output}: IForward): number {
        console.log({y, output})
        console.log(y.mul(output.map(v => -Math.log(v))))
        return y.mul(output.map(v => -Math.log(v))).sum();
    }

    backward({y, output}: IBackward): Matrix {
        // console.log({output})  
        return scalar(-1).div(output);
    }
}

export const lossDict: ClassNameToClassDict<Loss> = {
    "sse": SSE,
    "categoricalcrossentropy": CategoricalCrossentropy
}
