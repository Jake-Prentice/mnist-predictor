import Matrix from "lib/matrix";
import { Input, Layer } from "./layers";

interface ITrain {
    epochs: number; 
    batchSize: number;
}

export default class NeuralNet { 

    layers: Layer[] = []; 

    get outputLayer() {return this.layers[this.layers.length - 1]}
 
    get isBuilt() {return true}

    get inputLayer() {return this.layers[0]}
    

    constructor() {

    }

    addLayer(layer: Layer) {
        if (this.layers.length === 0 && !(layer instanceof Input)) {
            if (!layer.numOfInputs) throw new Error("either first layer is of type Input or specify numOfInputs");
    
            this.layers.push(new Input({numOfNodes: layer.numOfInputs}));
            return;
        }

        //initialse weights and biases...
        !(layer instanceof Input) && layer.build(this.outputLayer.numOfNodes);
        this.layers.push(layer);

    }

    predict(inputNodes: Matrix) {
        /*
            inputs can be of any number of columns but
            must match rows of numOfNodes assigned on nn.addLayer(new Input(...)) or equivalent
        */

        //input layer
        this.inputLayer.forward({inputNodes})

        for (let i=1; i < this.layers.length; i++) {
            const currentLayer = this.layers[i];
            const prevLayer = this.layers[i - 1];

            currentLayer.forward({
                inputNodes: prevLayer.inputNodes
            });
        }

        return this.outputLayer.outputNodes;
    }

    train({epochs}: ITrain) {
        for (let epoch=0; epoch < epochs; epoch++) {
            
        }
    }

    compile() {
        
    }

    save() {

    }

    load() { 

    } 

}

export {};



/* 


train() {
    
        const dLoss = loss.backpropagate(this.outputLayer)
        
        for (let i=this.layers.length - 1; i > 1; i--) {
            const nextLayer = this.layers[i - 1];
            const currentLayer = this.layers[i];
            
            currentLayer.backpropagate(nextLayer.dInputs);

            this.optimiser.update(currentLayer);
        
        }
    }

    layer.backpropagate(nextLayerDInputs) { dOutput
        const delta = this.activation.backpropagate(nextLayerDInputs);
        const dJdW = Matrix.dot(delta, this.inputs.transpose())

        if (this._useBias) this.dBiases = delta.sumRows(); 
    
        //to pass back to previous layer
        this.dInputs = Matrix.dot(this.weights.transpose(), delta);
    }


*/