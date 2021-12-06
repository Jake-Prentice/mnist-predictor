import Matrix from "./lib/matrix";
import {sigmoid} from "src/lib/NeuralNet/activations";

export interface INeuralNet {
    numOfInputs: number;
    numOfHiddens: number; 
    numOfOutputs: number;
    batchSize?: number;
    w0?: Matrix,
    w1?: Matrix,
    b0?: Matrix,
    b1?: Matrix
}


class NeuralNet {

    a0: Matrix;
    a1!: Matrix;
    a2!: Matrix;
    w0: Matrix;
    w1: Matrix;
    b0: Matrix;
    b1: Matrix;
    batchSize: number;

    constructor({numOfInputs, numOfHiddens, numOfOutputs, batchSize=1, w0, w1, b0, b1} : INeuralNet ) {
        this.batchSize = batchSize;
        this.a0 = new Matrix(numOfInputs, batchSize);

        this.w0 = new Matrix(numOfHiddens, numOfInputs);
        if (w0) this.w0 = w0; else this.w0.initRand(-1,1);
        
        this.b0 = b0 ? b0 : new Matrix(Array.from({length: numOfHiddens}, _ => [0.01])); 

        this.w1 = new Matrix(numOfOutputs, numOfHiddens) 
        if (w1) this.w1 = w1; else this.w1.initRand(-1,1);

        this.b1 = b1 ? b1 : new Matrix(Array.from({length: numOfOutputs}, _ => [0.01])); 
    }

    feedForward(inputs: Matrix) {
        this.a0._values = inputs._values;
        // console.log(this.w0)
        // console.log(this.a0)
        this.a1 = sigmoid.func(Matrix.dot(this.w0, this.a0).add(this.b0))
        this.a2 = sigmoid.func(Matrix.dot(this.w1, this.a1).add(this.b1));
        // console.log({a2: this.a2})
        return this.a2;
    }

    calculateCost(y: Matrix) {
        let cost=0;
        y.forIJ((v, i, j) => {
            cost += 0.5 * ((v - this.a2._values[i][j]) ** 2)
        })
        return cost;
    }
 
    backpropagate(y: Matrix) {
        const lr = 0.1;

        let d2 = y.subtract(this.a2).multiply(sigmoid.prime(this.a2)) //delta 2
        let dJdW1 = Matrix.dot(d2, this.a1.transpose());

        
        let d1 = Matrix.dot(this.w1.transpose(), d2).multiply(sigmoid.prime(this.a1));
        
        let dJdW0 = Matrix.dot(d1, this.a0.transpose());

        // console.log({dJdW1, dJdW0, d2, d1, b0: this.b0, b1: this.b1})

        if (this.batchSize > 1) {
            // dJdW1 = dJdW1.divide(this.batchSize);
            // dJdW0 = dJdW0.divide(this.batchSize);
            d1 = d1.sumRows();
            d2 = d2.sumRows();
        }
        
        //update weights and biases
        this.w1 = this.w1.add(dJdW1.multiply(lr));
        this.b1 = this.b1.add(d2.multiply(lr));
        
        this.w0 = this.w0.add(dJdW0.multiply(lr));
        this.b0 = this.b0.add(d1.multiply(lr)); 

        // console.log({w1: this.w1, w0: this.w0});

    }

    getPrediction() {
        let maxValue = 0;
        let maxIndex = 0;

        this.a2.forIJ((v, i)=> {
            if (v > maxValue) {
                maxValue = v; maxIndex = i;  
            } 
        })

        return maxIndex;
    }

}

export default NeuralNet;


/*



*/
