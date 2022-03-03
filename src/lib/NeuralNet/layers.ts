import { getInitializer, Initializer, RandomUniform, Zeros } from "./initializers";
import Matrix, { IMatrixConfig, Shape } from "../Matrix";
import { Activation, getActivation } from "./activations";
import { Serializable, arrayBufferToBase64String, wrapSerializable, ClassNameToClassDict, getClassFromClassName, SerializableConstructor, deserialize, WrappedSerializable} from "./serialization";
import { Model } from "./index";

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
            `${this.name} has shape ${this.value.printShape()}. But was assigned: ${value.printShape()}`
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


//TODO - Name all matrices singular not plural
export abstract class Layer extends Serializable {
    static nextUniqueLayerId=0;
    weights: Weight[];
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
            `Layer expects ${this.numOfNodes} output nodes, but got ${m.rows}`
        );
        this._outputNodes = m;
    }

    get inputNodes() {
        return this._inputNodes!;
    }

    //needs to expect any number of columns, because of batching. 
    set inputNodes(m: Matrix) {
        if (m.rows !== this.numOfNodes) throw new Error(
            `Layer expects ${this.numOfNodes} input nodes, but got ${m.rows}`
        );
        this.inputNodes = m;
    }


    addWeight(name: string, shape: Shape, initializer: Initializer) {
        const weight = new Weight(
            `${this.className}${Model.nextUniqueModelId}/${name}${Layer.nextUniqueLayerId}`, 
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

    forward({inputNodes}: IForward) {
        this._inputNodes = inputNodes;
    };
 
    backward(props: IBackward): void {};
    build(prevNumOfNodes: number) { this.isBuilt = true };

    getConfig(): object {
        return { numOfNodes: this.numOfNodes };
    }
}

//Input layer
export class Input extends Layer {
    className = "Input"

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
    bias!: Weight;


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
        
        this.kernel = this.addWeight("kernel", [this.numOfNodes, prevNumOfNodes], this.kernelInitializer);
        if (this._useBias) {
            this.bias = this.addWeight("bias", [this.numOfNodes, 1], this.biasInitializer);
        }
        this.isBuilt = true;
    }

    forward({inputNodes}: IForward) {
        super.forward({inputNodes});
        if (!this.isBuilt) this.build(inputNodes.rows);

        // activation(weight * input + bias)
        let output = this.kernel.value.dot(inputNodes); 

        if (this._useBias) output = output.add(this.bias.value!) 

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
        this.kernel.delta.assign(Matrix.dot(delta, this.inputNodes.transpose())) 

        if (this._useBias) this.bias.delta.assign( delta.sumRows() ); 

        //will be used by the next layer back to calculate their delta
        this.passBackError = Matrix.dot(this.kernel.value.transpose(), delta);
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

    
    static fromConfig<T extends Serializable>(
        cls: SerializableConstructor<T>, config: {[key: string]: any}): T {
        return new cls(config);
    }

}

export const layerDict: ClassNameToClassDict<Layer> = {
    "dense": Dense,
    "input": Input
}

export const getLayer: getClassFromClassName<Layer> = (className: string) => {
    className = className.toLowerCase();
    if (!(className in layerDict)) {
        throw new Error(`cannot find given layer: ${className}`)
    }
    return layerDict[className] 
}
