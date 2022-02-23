import Matrix, { scalar } from "../Matrix";

export interface IBackward extends IForward {};

interface IForward {
    y: Matrix;
    outputs: Matrix;
}

export interface ILossFunction {
    forward: (props: IForward) => number;
    backward: (props: IBackward) => Matrix;
}


export const SSE: ILossFunction = {
    forward: ({y, outputs}) => {
        // 0.5 * (y-a)**2
        return scalar(0.5).mul(y.sub(outputs).pow(2)).sum();
    },

    backward:({y, outputs}) => {
        return y.sub(outputs).mul(-1);
    }
}

