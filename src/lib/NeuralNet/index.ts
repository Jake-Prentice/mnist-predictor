import Matrix from "lib/matrix";
import { Input, Layer } from "./layers";
import { IBackward, ILossFunction } from "./losses";
import { Optimiser } from "./optimisers";

interface ITrain {
    epochs: number; 
    x: number[][];
    y: number[][];
    batchSize?: number;
    printEvery?: number;
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

        console.log("hereheeh")
        for (let i=1; i < this.layers.length; i++) {
            const currentLayer = this.layers[i];
            const prevLayer = this.layers[i - 1];

            currentLayer.forward({
                inputNodes: prevLayer.outputNodes
            });
        }

        return this.outputLayer.outputNodes;
    }

    getBatch(data: number[][], batchSize: number, step: number) {
        const batch=[];
        for (let i=step * batchSize; i < (step + 1) * batchSize; i++) {
            if (i >= data.length) break;
            batch.push(data[i]);
        }

        return batch;
    }

    //handles splitting inputs and outputs into batches as well
    // note - X and Y are arrays not matrices
    train({
        epochs,
        batchSize,
        x,
        y,
        printEvery=10
    }: ITrain) {
        if (!this.isCompiled) throw new Error("Neural network must be compiled before training");
        if (x.length !== y.length) throw new Error(`every input must have an output, got x.length ${x.length} and y.length ${y.length}`);
        //don't need to check y.length because x and y should be the same length
        if (batchSize && (batchSize > x.length || batchSize < 1 ) ) throw new Error(" batch size needs to be within range: 1 <= batchSize < x/y")

        //if batchSize is undefined, it defaults to a batch of all the training data
        let numOfTrainingSteps=1;
        let xBatch: Matrix;
        let yBatch: Matrix

        if (batchSize) {
            numOfTrainingSteps = Math.floor(x.length / batchSize);

            //if there aren't enough inputs to make a full batch at the end
            if (numOfTrainingSteps * batchSize < x.length) numOfTrainingSteps += 1;
        }

        const trainableLayers = this.getTrainableLayers();
        
        for (let epoch=0; epoch < epochs; epoch++) {
        
            for (let step=0; step < numOfTrainingSteps; step+=1) {
                
                if (step % printEvery === 0) {
                    console.log(`training step ${step}`);
                }
                
                //get current batch
                if (batchSize) {
                    xBatch = new Matrix( this.getBatch(x, batchSize, step) )
                    yBatch = new Matrix( this.getBatch(y, batchSize, step) )
                }else {
                    xBatch = new Matrix(x);
                    yBatch = new Matrix(y);
                }

                xBatch = xBatch.transpose();
                yBatch = yBatch.transpose();

                //feed forward inputs get predicted output (a) 
                const outputs = this.forward(xBatch);

                //backpropagation
                this.backward({y: yBatch, outputs})

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

        const dLoss = this.loss!.backward({y, outputs});
            
        for (let i=this.layers.length - 1; i > 0; i--) {
            const nextLayer: Layer | undefined = this.layers?.[i + 1];
            const currentLayer = this.layers[i];
            
            // console.log({dLoss, nextLayer, i})
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
