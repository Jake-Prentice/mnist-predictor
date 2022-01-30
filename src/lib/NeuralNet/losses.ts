import Matrix from "lib/matrix";



export interface ILossFunction {
    forward: () => void;
    backward: () => Matrix;
}



export {}