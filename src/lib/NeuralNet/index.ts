import Matrix from "lib/matrix";
import { Input, Layer } from "./layers";

export default class NeuralNet { 

    layers: Layer[] = []; 

    get topLayer() {return this.layers[this.layers.length - 1]}
 
    get isBuilt() {return true}

    get bottomLayer() {return this.layers[0]}
    


    constructor() {

    }

    addLayer(layer: Layer) {
        if (this.layers.length === 0 && !(layer instanceof Input)) {
            if (!layer.numOfInputs) throw new Error("either first layer is of type Input or specify numOfInputs");
    
            this.layers.push(new Input({numOfNodes: layer.numOfInputs}));
            return;
        }

        //initialse weights and biases...
        !(layer instanceof Input) && layer.build(this.topLayer.numOfNodes);
        this.layers.push(layer);

    }

    predict(inputs: Matrix) {
        /*
            inputs can be of any number of columns but
            must match rows of numOfNodes assigned on nn.addLayer(new Input(...)) or equivalent
        */
        this.layers[0].nodes = inputs;
        for (let i=1; i < this.layers.length; i++) {
            const currentLayer = this.layers[i];
            const prevLayer = this.layers[i - 1];
            currentLayer.feedForward(prevLayer);
        }

        return this.topLayer.nodes;
    }

    compile() {
        
    }

    save() {

    }

    load() { 

    } 

}

export {};
