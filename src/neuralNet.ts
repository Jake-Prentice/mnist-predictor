import { maxHeaderSize } from "http";
import Matrix from "./matrix";


const sigmoid = (m: Matrix) => {
}

const Relu = (m: Matrix) => m.map(v => Math.max(0, v));



class NeuralNet {

    a0: Matrix;
    w0: Matrix;
    w1: Matrix;
    b0: Matrix;
    b1: Matrix;

    constructor(numOfInputs: number, numOfHiddens: number, numOfOutputs: number) {
        this.a0 = new Matrix(numOfInputs, 1);
        
        this.w0 = new Matrix(numOfHiddens, numOfInputs);
        this.w0.initRand(-1,1);
        
        this.b0 = new Matrix(Array.from({length: numOfHiddens}, _ => [0.01])); 
  
        this.w1 = new Matrix(numOfOutputs, numOfHiddens) 
        this.w1.initRand(-1,1);

        this.b1 = new Matrix(Array.from({length: numOfHiddens}, _ => [0.01])); 
    }

    feedForward(inputs: Matrix, y: Matrix) {
        this.a0.values = inputs.values;

        console.log(this.w0)
        console.log(this.a0)
        
        const a1 = Relu(Matrix.dot(this.w0, this.a0).add(this.b0))
        const a2 = Relu(Matrix.dot(this.w1, a1).add(this.b1));

        console.log({a2})

        console.log(a1);

    }


}

export default NeuralNet;


/*

    const nn = new NeuralNet(784, 10, 10);

    nn.feedForward(new Matrix([]))

    a0 => inputs
    a1 => hidden
    a2 => output

    z1 => a1 before activation
    z2 => a2 before activation


*/
