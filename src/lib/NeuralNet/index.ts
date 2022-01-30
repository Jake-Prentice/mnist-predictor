import Matrix from "lib/matrix";
import { Input, Layer } from "./layers";
import { ILossFunction } from "./losses";
import { Optimiser } from "./optimisers";

interface ITrain {
    epochs: number; 
    x: Matrix;
    y: Matrix;
    batchSize: number;
}

interface IBackward {
    y: Matrix;
    outputs: Matrix;
}

interface ICompile {
    optimiser: Optimiser;
    loss: ILossFunction;
}

export default class NeuralNet { 

    layers: Layer[] = []; 
    private optimiser?: Optimiser;
    private loss?: ILossFunction;
    private isCompiled: boolean = false;
    get outputLayer() {return this.layers[this.layers.length - 1]}
    get inputLayer() {return this.layers[0]}
    
    addLayer(layer: Layer) {
        if (this.layers.length === 0 && !(layer instanceof Input)) {
            throw new Error("first layer must be of type Input");
        }
        //initialse weights and biases...
        !(layer instanceof Input) && layer.build(this.outputLayer.numOfNodes);

        this.layers.push(layer);

    }

    forward(inputNodes: Matrix) {
        /*
            inputs can be of any number of columns but
            must match rows of numOfNodes assigned on nn.addLayer(new Input(...)) or equivalent
        */
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

    //handles splitting inputs and outputs into batches as well
    train({
        epochs,
        batchSize=1,
        x,
        y
    }: ITrain) {
        if (!this.isCompiled) throw new Error("Neural network must be compiled before training");
        if (!Matrix.isSameShape(x,y)) throw new Error("x, y must be the same shape"); 
        if (batchSize < 1 || batchSize > x.cols) throw new Error(` 1 < batchSize < ${x.cols}`);

        let numOfTrainingSteps=1;
        let xBatch: Matrix;
        let yBatch: Matrix

        if (batchSize > 1) {
            numOfTrainingSteps = Math.floor()
        }

        const trainableLayers = this.getTrainableLayers();
        
        for (let epoch=0; epoch < epochs; epoch++) {
        
            for (let step=0; step < numOfTrainingSteps; step+=batchSize) {
                
                //create batches
                if (batchSize > 1) {



                }else {
                    xBatch = x;
                    yBatch = y;
                }



                //feed forward inputs get predicted output (a) 
                // const output = this.forward(X);

                

                //update weights and biases
                trainableLayers.forEach(layer => {
                    this.optimiser!.update(layer);
                })
            }
        }
    }

    //single backwards pass of layers - doesn't update weights
    backward({y, outputs}: IBackward) {
        if (!this.isCompiled) throw new Error(); 

        const dLoss = this.loss!.backward();
            
        for (let i=this.layers.length - 1; i > 1; i--) {
            const nextLayer: Layer | undefined = this.layers?.[i - 1];
            const currentLayer = this.layers[i];
            
            const passBackError = !nextLayer ? dLoss : nextLayer.passBackError!;
            currentLayer.backward({passBackError});
        }
    }

    private getTrainableLayers() {
        const trainableLayers: Layer[] = [];
        this.layers.forEach(layer => {
            if (!!layer.weights) trainableLayers.push(layer);
        })

        return trainableLayers;
    }

    compile({loss, optimiser}: ICompile) {
        this.loss = loss;
        this.optimiser = optimiser;
        this.isCompiled = true;
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

/* 

    const neuralNet = new NeuralNet();

    neuralNet.addLayer(new layer.Input({numOfNodes: 784}))
    neuralNet.addLayer(new layer.Dense({

    }))
    neuralNet.addLayer(new layer.Dense({

    }))

    const optimiser = new optimisers.SGD({
        learningRate: 0.01
    })

    neuralNet.compile({
        loss: losses.SSE,
        optimiser
    })

    neuralNet.train({
        epochs: 10,
        batchSize: 32,
        inputs,
        outputs
    })




*/