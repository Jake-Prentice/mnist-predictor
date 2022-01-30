import Matrix from "lib/matrix";
import { ActivationFunc, sigmoid, Activation } from "./activations";

//Base layer
interface ILayer {
    numOfNodes: number;
}

interface IForward {
    inputNodes: Matrix;
}

interface IBackward {
    passBackError: Matrix;
}


export abstract class Layer {
    
    weights?: Matrix;
    dWeights?: Matrix;
    //only for first layer
    isBuilt: boolean = false;
    passBackError?: Matrix;
    protected _outputNodes?: Matrix;
    protected _inputNodes?: Matrix;
    readonly numOfNodes: number;

    get outputNodes() {
        return this._outputNodes!;
    }

    set outputNodes(m: Matrix) {
        if (m.rows !== this.numOfNodes) throw new Error(
            `output layer is supposed to have ${this.numOfNodes} nodes not ${m.rows}`
        );
        this.outputNodes = m;
    }

    get inputNodes() {
        return this._inputNodes!;
    }

    
    set inputNodes(m: Matrix) {
        if (m.rows !== this.numOfNodes) throw new Error(
            `input layer is supposed to have ${this.numOfNodes} nodes not ${m.rows}`
        );
        this.inputNodes = m;
    }


    constructor({numOfNodes}: ILayer) {
        this.numOfNodes = numOfNodes;
    }

    forward({inputNodes}: IForward) {
        this._inputNodes = inputNodes;
    };
 
    backward(props: IBackward): void {};
    build(prevNumOfNodes: number) { this.isBuilt = true };
}

//Input layer
export class Input extends Layer {

    constructor(props: ILayer) {
        super(props);
    }
    
    forward({ inputNodes }: IForward) {
        super.forward({inputNodes});
        this.outputNodes = this.inputNodes;
    }
}


//Dense Layer
interface ILayerDense extends ILayer  {
    activation?: Activation;
    useBias?: boolean;
}

export class Dense extends Layer {

    activation?: Activation
    private _useBias: boolean;
    biases?: Matrix;
    dBiases?: Matrix;

    constructor({
        activation, 
        numOfNodes,
        useBias = true
        
    }: ILayerDense) {    
        super({numOfNodes});
        this.activation = activation;
        this._useBias = useBias
    }

    build(prevNumOfNodes: number) {
        
        this.weights = new Matrix(this.numOfNodes, prevNumOfNodes);
        this.dWeights = new Matrix(this.weights.rows, this.weights.cols);

        this.weights.initRand(-1, 1);
        
        if (this._useBias) {
            this.biases = new Matrix(Array.from(
                {length: this.numOfNodes},
                _ => [0.01]
            )); 

            //initialise so that there is shape validation
            this.dBiases = new Matrix(this.biases.rows, this.biases.cols);
        }

        this.isBuilt = true;


    }

    forward({inputNodes}: IForward) {
        super.forward({inputNodes});

        if (!this.isBuilt) this.build(inputNodes.rows);
    
        let output = Matrix.dot(this.weights!, inputNodes);

        if (this._useBias) output = output.add(this.biases!) 

        if (this.activation) output = this.activation.forward(output);

        this.outputNodes = output;

        return output;
    }

    backward({passBackError}: IBackward) {
        if (!this.isBuilt) throw new Error("layer needs to be built first before layer can backpropagate");
        
        const delta = this.activation 
            ? this.activation.backward(passBackError) 
            : passBackError; 
        
        //dJdW
        this.dWeights = Matrix.dot(delta, this.inputNodes.transpose())

        if (this._useBias) this.dBiases = delta.sumRows(); 

        //will be used by the next layer back to calculate their delta
        this.passBackError = Matrix.dot(this.weights!.transpose(), delta);
    }

}


export {} 


// nn.addLayer(new LayerDense())

// layer.nodes.

/* 
    optimiser: 
        +learningRate
        +update(layer)
*/