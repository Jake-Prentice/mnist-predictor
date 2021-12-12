import Matrix from "lib/matrix";
import { ActivationFunc, sigmoid } from "./activations";


interface ILayer {
    numOfNodes: number;
    numOfInputs?: number;
}


export abstract class Layer {
    
    private _nodes?: Matrix;
    weights?: Matrix;
    readonly numOfNodes: number;
    //only for first layer
    numOfInputs?: number;
    isBuilt: boolean = false;

    get nodes() {return this._nodes!}
    
    set nodes(m: Matrix) {
        if (m.rows !== this.numOfNodes) throw new Error(
            `layer is supposed to have ${this.numOfNodes} nodes not ${m.rows}`
        );
        this._nodes = m;
    }

    constructor({numOfNodes, numOfInputs}: ILayer) {
        this.numOfNodes = numOfNodes;
        this.numOfInputs = numOfInputs;
    }

    feedForward(previousLayer: Layer) {return this._nodes};
    build(prevNumOfNodes: number) { this.isBuilt = true };
}

interface IInput {
    batchSize?: number;
    numOfNodes: number;
}

export class Input extends Layer {
    
    batchSize?: number;

    constructor({batchSize, ...rest}: IInput) {
        super(rest);
        this.batchSize = batchSize ? batchSize : 1;
    }
}

interface ILayerDense  {
    numOfInputs?: number;
    numOfNodes: number;
    activation?: ActivationFunc;
    useBias: boolean;
}

export class Dense extends Layer {

    activation?: ActivationFunc
    private _useBias: boolean = true;
    biases?: Matrix;

    constructor({
        activation, 
        numOfNodes,
        numOfInputs,
        useBias
        
    }: ILayerDense) {    
        super({numOfInputs, numOfNodes});
        this.activation = activation;
        this._useBias = useBias
    }

    build(prevNumOfNodes: number) {
        
        this.weights = new Matrix(this.numOfNodes, prevNumOfNodes);
        this.weights.initRand(-1, 1);
        
        if (this._useBias) {
            this.biases = new Matrix(Array.from(
                {length: this.numOfNodes},
                _ => [0.01]
            )); 
        }

        this.isBuilt = true;

    }

    feedForward(previousLayer: Layer) {
        if (!this.isBuilt) throw new Error("layer not built");
    
        let output = Matrix.dot(this.weights!, previousLayer.nodes);

        if (this._useBias) output = output.add(this.biases!) 

        if (this.activation) output = this.activation.func(output);

        this.nodes = output;

        return output;
    }

}


export {} 


// nn.addLayer(new LayerDense())
