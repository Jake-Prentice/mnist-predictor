import { ClassNameToClassDict, Serializable } from "./serialization";
import { Layer, Weight } from "./layers";

export interface IOptimiser {
    learningRate?: number;
}

export abstract class Optimiser extends Serializable {

    learningRate: number;
  
    constructor({learningRate}: IOptimiser={}) {
        super();
        this.learningRate = learningRate || 0.1;
    }

    abstract update(layer: Layer): void;
    
    getConfig(): object {
        return {learningRate: this.learningRate}
    }
}

interface ISGDUpdatable extends Layer {
    kernel: Weight;
    bias?: Weight;
}

export class SGD extends Optimiser {
    className = "SGD"
    update({kernel, bias}: ISGDUpdatable): void {
        if (!kernel) throw new Error("sgd optimiser can only update a layer with at least a kernel")
        // weights += -learning_rate * dweights
        // biases += -learning_rate * dbiases
        const kernelUpdate = kernel.value.add( kernel.delta.mul(-1 * this.learningRate) );
        kernel.assign(kernelUpdate);

        if (bias) {
            const biasUpdate = bias.value.add( bias.delta.mul( -1 * this.learningRate) ) 
            bias.assign(biasUpdate);
        }
    }
}


export const optimiserDict: ClassNameToClassDict<Optimiser> = { 
    sgd: SGD
}




