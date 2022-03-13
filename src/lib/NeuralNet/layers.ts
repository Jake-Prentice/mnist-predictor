import { getInitializer, Initializer, RandomUniform, Zeros } from "./initializers";
import Matrix, { IMatrixConfig, Shape } from "../Matrix";
import { Activation, getActivation } from "./activations";
import { 
    Serializable, 
    arrayBufferToBase64String, 
    wrapSerializable, 
    ClassNameToClassDict, 
    WrappedSerializable
} from "./serialization";

export interface IWeightConfig extends IMatrixConfig{ name: string };

export class Weight extends Serializable {
    className = "Weight";

    name: string;
    value: Matrix;
    delta: Matrix;
    
    constructor(name: string, value: Matrix) {
        super();
        this.value = value;
        this.name = name;
        this.delta = Matrix.fill(value.shape, 0);
    }

    assign(value: Matrix) { 
        this.value.assign(value, 
            `${this.name} has shape ${this.value.printShape()}. 
            But was assigned: ${value.printShape()}`
        ) 
    }

    //returns flattened and base64 encoded weight values
    serialize() {
        const buffer = this.value.flat().buffer;
        return arrayBufferToBase64String(buffer);
    }

    getConfig() {
        return {
            name: this.name,
            ...this.value.getConfig()
        };
    }

}

interface ILayer {
    numOfNodes: number;
}

//TODO - Name all matrices singular not plural
export abstract class Layer extends Serializable {
    static nextUniqueLayerId=0;
    weights: Weight[];
    protected isBuilt: boolean = false;
    protected _passBackError?: Matrix;
    protected _output?: Matrix;
    protected _input?: Matrix;
    readonly numOfNodes: number;

    get output() {
        return this._output!;
    }

    set output(m: Matrix) {
        if (m.rows !== this.numOfNodes) throw new Error(
            `Layer expects ${this.numOfNodes} output nodes, but got ${m.rows}`
        );
        this._output = m;
    }

    get input() {
        return this._input!;
    }

    set input(m: Matrix) {
        if (m.rows !== this.numOfNodes) throw new Error(
            `Layer expects ${this.numOfNodes} input nodes, but got ${m.rows}`
        );
        this.input = m;
    }

    get passBackError() {
        return this._passBackError;
    }

    addWeight(name: string, shape: Shape, initializer: Initializer) {
        const weight = new Weight(
            `${this.className}/${name}${Layer.nextUniqueLayerId}`, 
            initializer.forward(shape)
        );
        this.weights.push(weight);
        return weight;
    }

    constructor({numOfNodes}: ILayer) {
        super();
        this.numOfNodes = numOfNodes;
        this.weights = [];
        Layer.nextUniqueLayerId++;
    }

    forward(input: Matrix) {
        this._input = input;
    };
 
    backward(passBackError: Matrix): void {};
    build(prevNumOfNodes: number) { this.isBuilt = true };

    getConfig(): object {
        return { numOfNodes: this.numOfNodes };
    }
}

//Input layer
export class Input extends Layer {
    className = "Input"
        
    forward(input: Matrix) {
        super.forward(input);
        this.output = this.input;
    }
}


//Dense Layer
interface ILayerDense extends ILayer  {
    activation?: string|Activation|WrappedSerializable;
    useBias?: boolean;
    kernelInitializer?: Initializer|string|WrappedSerializable;
    biasInitializer?: Initializer|string|WrappedSerializable;
}

export class Dense extends Layer {

    className = "Dense";

    activation?: Activation
    private _useBias: boolean;

    kernelInitializer: Initializer;
    biasInitializer: Initializer;

    kernel!: Weight;
    bias?: Weight;

    get useBias() {
        return this._useBias
    }

    set useBias(value: boolean) {
        this.isBuilt = false;
        this._useBias = value;
    }

    constructor({
        activation, 
        numOfNodes,
        kernelInitializer,
        biasInitializer,
        useBias = true
        
    }: ILayerDense) {    
        super({numOfNodes});
        //get activation func. Can deserialize
        this.activation = activation ? getActivation(activation) : undefined;
        this._useBias = useBias
        //get initializers. Can deserialize
        this.kernelInitializer = getInitializer(kernelInitializer || new RandomUniform()) 
        this.biasInitializer = getInitializer(biasInitializer || new Zeros()); 
        
    }

    build(prevNumOfNodes: number) {
        if (this.weights.length > 0) this.weights = []

        this.kernel = this.addWeight(
            "kernel", 
            [this.numOfNodes, prevNumOfNodes], 
            this.kernelInitializer
        );
        if (this._useBias) {
            this.bias = this.addWeight(
                "bias", 
                [this.numOfNodes, 1], 
                this.biasInitializer
            );
        }
        this.isBuilt = true;
    }

    forward(input: Matrix) {
        super.forward(input);
        if (!this.isBuilt) this.build(input.rows);

        // activation(weight * input + bias)
        let output = this.kernel.value.dot(input); 

        if (this._useBias) output = output.add(this.bias!.value) 

        if (this.activation) output = this.activation.forward(output);

        this.output = output;

        return output;
    }

    backward(passBackError: Matrix) {
        if (!this.isBuilt) throw new Error(`
            layer needs to be built first before
            layer can backpropagate
        `);
        
        const delta = this.activation 
            ? this.activation.backward(passBackError) 
            : passBackError; 
        
        //dJdW
        this.kernel.delta.assign(Matrix.dot(delta, this.input.transpose())) 

        if (this._useBias) this.bias!.delta.assign( delta.sumRows() ); 

        //will be used by the next layer back to calculate their delta
        this._passBackError = Matrix.dot(this.kernel.value.transpose(), delta);
    }

    getConfig() {
        const config = {
            activation: this.activation && wrapSerializable(this.activation),
            biasInitializer: wrapSerializable(this.biasInitializer),
            kernelInitializer: wrapSerializable(this.kernelInitializer),
            useBias: this._useBias
        }
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}

export const layerDict: ClassNameToClassDict<Layer> = {
    "dense": Dense,
    "input": Input
}