import { ClassNameToClassDict, Serializable } from "./serialization";
import Matrix, { scalar } from "../Matrix/index";

export interface IBackward extends IForward {};

interface IForward {
    y: Matrix;
    output: Matrix;
}

//no point having loss function as a class
export abstract class Loss extends Serializable {
    abstract forward(props: IForward): number;
    abstract backward(props: IBackward): Matrix;

    getConfig() {return undefined};
}

export class SSE extends Loss {
    className= "SSE";
    forward({y, output}: IForward) {
        // 0.5 * (y-a)**2
        return scalar(0.5).mul(y.sub(output).pow(2)).sum();
    }

    backward({y, output}: IBackward) {
        return y.sub(output).mul(-1);
    }

}

export const lossDict: ClassNameToClassDict<Loss> = {
    "sse": SSE
}
