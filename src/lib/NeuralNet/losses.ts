import Matrix from "lib/matrix";

export interface IBackward extends IForward {};

interface IForward {
    y: Matrix;
    outputs: Matrix;
}

export interface ILossFunction {
    forward: (props: IForward) => void;
    backward: (props: IBackward) => Matrix;
}


export const SSE: ILossFunction = {
    forward: ({y, outputs}) => {
        // 0.5 * (y-a)**2
        y.subtract(outputs).toPow(2).multiply(0.5);
    },

    backward:({y, outputs}) => {
        return y.subtract(outputs);
    }
}

