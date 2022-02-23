import Matrix from "../Matrix";
import { Dense, Layer } from "./layers";

interface IOptimiser {
    learningRate?: number;
}

interface IUpdate {
    weights: Matrix;
    biases?: Matrix;
}

export abstract class Optimiser {

    learningRate: number;
  
    constructor({learningRate}: IOptimiser) {
        this.learningRate = learningRate || 0.1;
    }
    abstract update(layer: Layer): void;
}


export class SGD extends Optimiser {
    
    constructor(props: IOptimiser) {
        super(props);
    }

    update(layer: Dense): void {
       if (!layer.weights) throw new Error("can't update a layer with no weights");
    
        // weights += -learning_rate * dweights
        // biases += -learning_rate * dbiases
        layer.weights.assign( layer.weights!.add( layer.dWeights!.mul(-1 * this.learningRate) ) )
        if (layer.biases) layer.biases.assign( layer.biases.add( layer.dBiases!.mul( -1 * this.learningRate) ) );
        
    }
}


export {}; 