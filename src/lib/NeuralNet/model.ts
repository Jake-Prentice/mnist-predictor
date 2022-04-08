import { proxy, wrap } from "comlink";
import Matrix from "../Matrix";
import { getLayer, Input, IWeightConfig, Layer, layerDict, Weight } from "./layers";
import { getLoss, Loss} from "./losses";
import { getOptimiser, Optimiser} from "./optimisers";
import { arrayBufferToBase64String, base64StringToArrayBuffer, deserialize, WrappedSerializable, wrapSerializable } from "./serialization";

export interface ITrain {
    epochs: number; 
    x: number[][];
    y: number[][];
    batchSize?: number;
    printEvery?: number;
    onTrainingStep?: (params: IOnTrainingStepArgs) => void;
}

interface ISet {
    optimiser: string|Optimiser|WrappedSerializable;
    loss: string|Loss|WrappedSerializable;
}

export interface IModelTopology {
    layers: WrappedSerializable[], 
    optimiser?: WrappedSerializable,
    loss?: WrappedSerializable
}

export interface IOnTrainingStepArgs {
    loss: number;
    epoch: number;
    totalEpochs: number;
    progress: number;
    step: number;
    weights: Weight[];
}

export interface IModelWeightData {
    encoded: string, 
    config: IWeightConfig[]
}

export class Model { 
    layers: Layer[] = []; 
    private _optimiser!: Optimiser;
    private _loss!: Loss;

    get loss() {
        return this._loss
    }

    get optimiser() {
        return this._optimiser
    }
    
    get outputLayer() {
        return this.layers[this.layers.length - 1]
    }
    
    get inputLayer() {
        return this.layers[0]
    }

    addLayer(layer: Layer|WrappedSerializable) {
        layer = getLayer(layer);
        if (this.layers.length === 0 && !(layer instanceof Input)) {
            throw new Error("first layer must be of type Input");
        }
        //connect current top layer and the previous - initialse weights and biases...
        !(layer instanceof Input) && layer.build(this.outputLayer.numOfNodes);

        this.layers.push(layer);
    }

    forward(input: Matrix) {
        if (this.layers.length === 0) throw new Error("can't feedforward without any layers")
        if (input.rows !== this.inputLayer.numOfNodes) throw new Error(`input given doesn't match the required input layer dimensions`)
        
        this.inputLayer.forward(input)

        for (let i=1; i < this.layers.length; i++) {
            const currentLayer = this.layers[i];
            const prevLayer = this.layers[i - 1];

            currentLayer.forward(prevLayer.output);
        }

        return this.outputLayer.output;
    }

    getBatch(data: number[][], batchSize: number, step: number) {
        const batch: number[][] =[];
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
        printEvery=10,
        onTrainingStep
    }: ITrain) {

        if (!this._loss || !this._optimiser) throw new Error("Need both a loss function and an optimiser to train");
        if (x.length === 0 || y.length === 0 || this.layers.length === 0) return;

        if (x.length !== y.length) throw new Error(`
            every input must have an output, 
            got x.length ${x.length} and y.length ${y.length}
        `);

        for (let i=0; i < x.length; i++) {
            if (x[i].length !== this.inputLayer.numOfNodes) throw new Error(`
                expected ${this.inputLayer.numOfNodes} inputs 
                but got ${x[i].length} at index ${i}
            `)
            if (y[i].length !== this.outputLayer.numOfNodes) throw new Error(`
                expected ${this.outputLayer.numOfNodes} outputs 
                but got ${y[i].length} at index ${i}
            `)
        }

        //if batchSize is undefined, it defaults to a batch of all the training data
        let numOfTrainingSteps=1;
        let xBatch: Matrix;
        let yBatch: Matrix

        if (batchSize) {
            //don't need to check y.length because x and y are the same length
            if (batchSize > x.length || batchSize < 1) throw new Error(`batch size is out of range: 1 - ${x.length}`)

            numOfTrainingSteps = Math.floor(x.length / batchSize);
            //if there aren't enough inputs to make a full batch at the end then dump the rest into an extra batch
            if (numOfTrainingSteps * batchSize < x.length) numOfTrainingSteps += 1;
        }

        const trainableLayers = this.getTrainableLayers();
        
        for (let epoch=0; epoch < epochs; epoch++) {
        
            for (let step=0; step < numOfTrainingSteps; step+=1) {
                
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
                const output = this.forward(xBatch);
                
                //backpropagation
                this.backward(yBatch, output)
                
                //update weights and biases
                trainableLayers.forEach(layer => {
                    this._optimiser.update(layer);
                })

                if (step % printEvery === 0) {
                    const loss = this._loss!.forward(yBatch, output);
                    const progress = Math.round(
                        ((step + (numOfTrainingSteps * epoch))/ (numOfTrainingSteps * epochs)) * 100)
                    onTrainingStep?.({
                        loss, 
                        epoch, 
                        progress, 
                        totalEpochs: epochs,
                        step: step + (numOfTrainingSteps * epoch),
                        weights: this.getWeights()
                    });
                    console.log("\n")
                    this.showProgressBar(20, step, numOfTrainingSteps);
                    console.log(`epoch: ${epoch}/${epochs}`)
                    console.log(`loss: ${loss}`)
                }
            }
        }
    }

    //train on another thread to not freeze up the application while training
    async trainOnWorker(params: ITrain) {
        const worker = new Worker(new URL("./worker.ts", import.meta.url), {name: "worker", type: "module"});
        const workerApi = wrap<import("./worker").exportsType>(worker);
        //can't send callbacks through object
        const onTrainingStep = proxy(params.onTrainingStep);
        params.onTrainingStep = undefined;   
        const result = await workerApi.trainOnWorker(
            params,
            onTrainingStep,
            this.getModelTopology(),
            this.getEncodedWeightsAndConfig()
        );
        
        this.loadEncodedWeights(result);
    }

    //single backwards pass of layers - doesn't update weights
    private backward(y: Matrix, output: Matrix) {
        let passBackError = this._loss.backward(y, output);

        for (let l=this.layers.length - 1; l > 0; l--) {
            passBackError = this.layers[l].backward(passBackError);
        }
    }

    private getTrainableLayers() {
        const trainableLayers: Layer[] = [];
        this.layers.forEach(layer => {
            if (layer.weights.length > 0) trainableLayers.push(layer);
        })

        return trainableLayers;
    }

    getWeights() {
        const weights: Weight[] = [];
        this.layers.forEach(layer => {
            if (layer.weights.length > 0) weights.push(...layer.weights);
        })
        return weights;
    }

    setOptimiser(optimiser: string|Optimiser|WrappedSerializable) {
        this._optimiser = getOptimiser(optimiser);
    }

    setLoss(loss: string|Loss|WrappedSerializable) {
        this._loss = getLoss(loss);
    }

    set({loss, optimiser}: ISet) {
        this.setLoss(loss)
        this.setOptimiser(optimiser)
    }

    getModelTopology() {
        const modelTopology: IModelTopology = { layers: [] };

        if (this._optimiser) modelTopology.optimiser = wrapSerializable(this._optimiser);
        if (this._loss) modelTopology.loss = wrapSerializable(this._loss);

        this.layers.forEach(layer => {
            modelTopology.layers.push(wrapSerializable(layer)) ;
        })

        return modelTopology
    }

    //returns base64 encoded weights and weight configs
    getEncodedWeightsAndConfig(): IModelWeightData {
        const weightValues: number[] = [];
        const config: IWeightConfig[] = [];
        this.getWeights().forEach(weight => {
            weightValues.push(...weight.value.flat());
            config.push(weight.getConfig());
        })
        const buffer = new Float32Array(weightValues).buffer;
        const encoded = arrayBufferToBase64String(buffer);
        return {encoded, config}
    }
    
    loadModelTopology(modelTopology: IModelTopology) {
        //need to reset first
        if (this.layers.length > 0) this.layers = [];

        if (modelTopology.optimiser) this.setOptimiser(modelTopology.optimiser);

        if (modelTopology.loss) this.setLoss(modelTopology.loss);

        modelTopology.layers.forEach(layerToplogy => {
            this.addLayer(layerToplogy);
        })
    }

    loadEncodedWeights(weights: IModelWeightData) {
        const weightsBuffer = base64StringToArrayBuffer(weights.encoded);
        const currentWeights = this.getWeights();

        if (currentWeights.length < weights.config.length) throw new Error(`
            can't deserialise encoded weights. 
            num of weights in model should be ${currentWeights.length}, 
            but got ${weights.config.length} in weight config.`)
        
        let start=0;
        weights.config.forEach((config, index) => {
            // 4 letters in base64 = 1 number for a 32 bit typed array
            const end = start + config.rows * config.cols * 4;
            const weight = weightsBuffer.slice(start, end)
            const weightMatrix = Matrix.shape1DArray(new Float32Array(weight), config.shape);
            currentWeights[index].assign(weightMatrix);
            start=end
        })
    }

    reset() {
        this.layers.forEach((layer, index) => {
            layer.weights.length > 0 && layer.build(
                this.layers[index - 1].numOfNodes
            );
        })
    }

    private showProgressBar(barWidth: number, step: number, numOfTrainingSteps: number) {
        const progress = step/numOfTrainingSteps
        const currentBarWidth = Math.floor(progress * barWidth)
        console.log(`${step}/${numOfTrainingSteps}[${"=".repeat(currentBarWidth)}>${".".repeat(barWidth-currentBarWidth)}] ${Math.floor(progress * 100)}%`);
    }

}



