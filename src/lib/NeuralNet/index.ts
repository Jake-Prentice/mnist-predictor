import { proxy, wrap } from "comlink";
import Matrix from "../Matrix";
import { Input, IWeightConfig, Layer, layerDict, Weight } from "./layers";
import { IBackward, Loss, lossDict } from "./losses";
import { Optimiser, optimiserDict } from "./optimisers";
import { base64StringToArrayBuffer, deserialize, WrappedSerializable, wrapSerializable } from "./serialization";

export interface ITrain {
    epochs: number; 
    x: number[][];
    y: number[][];
    batchSize?: number;
    printEvery?: number;
    onTrainingStep?: (params: IOnTrainingStepArgs) => void;
}

interface ICompile {
    optimiser: Optimiser;
    loss: Loss;
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
    static nextUniqueModelId=0;

    layers: Layer[] = []; 
    private optimiser?: Optimiser;
    private loss?: Loss;
    private isCompiled: boolean = false;
    get outputLayer() {return this.layers[this.layers.length - 1]}
    get inputLayer() {return this.layers[0]}

    addLayer(layer: Layer) {
        if (this.layers.length === 0 && !(layer instanceof Input)) {
            throw new Error("first layer must be of type Input");
        }
        //connect current top layer and the previous - initialse weights and biases...
        !(layer instanceof Input) && layer.build(this.outputLayer.numOfNodes);

        this.layers.push(layer);
    }

    forward(inputNodes: Matrix) {
        /*
            inputs can be of any number of columns but
            must match rows of numOfNodes assigned on nn.addLayer(new Input(...))
        */
       //TODO - make sure there are layers  

        this.inputLayer.forward({inputNodes})

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

        if (!this.isCompiled) throw new Error("Neural network must be compiled before training");

        //TODO - make sure each output is the same as the required output layer dimensions

        if (x.length !== y.length) throw new Error(`every input must have an output, got x.length ${x.length} and y.length ${y.length}`);
        //don't need to check y.length because x and y should be the same length
        if (batchSize && (batchSize > x.length || batchSize < 1 ) ) throw new Error(" batch size needs to be within range: 1 <= batchSize < x/y")

        //if batchSize is undefined, it defaults to a batch of all the training data
        let numOfTrainingSteps=1;
        let xBatch: Matrix;
        let yBatch: Matrix

        if (batchSize) {
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
                // console.log(xBatch.values) 
                const output = this.forward(xBatch);
                
                //backpropagation
                this.backward({y: yBatch, output})
                
                //update weights and biases
                trainableLayers.forEach(layer => {
                    this.optimiser!.update(layer);
                })

                
                if (step % printEvery === 0) {
                    const loss = this.loss!.forward({y: yBatch, output});
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
    backward({y, output}: IBackward) {
        if (!this.isCompiled) throw new Error(); 
        // console.log({output})  

        const dLoss = this.loss!.backward({y, output});
        // console.log({dLoss})
            
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

    getNameToWeightsDict() {
        const dict: {[name: string]: Weight} = {} 
        this.getWeights().forEach(weight => {
            dict[weight.name] = weight
        })
        return dict;
    }

    compile({loss, optimiser}: ICompile) {
        this.loss = loss;
        this.optimiser = optimiser;
        this.isCompiled = true;
    }

    getModelTopology() {
        const modelTopology: IModelTopology = { layers: [] };

        if (this.optimiser) modelTopology.optimiser = wrapSerializable(this.optimiser);
        if (this.loss) modelTopology.loss = wrapSerializable(this.loss);

        this.layers.forEach(layer => {
            modelTopology.layers.push(wrapSerializable(layer)) ;
        })

        return modelTopology
    }

    //returns base64 encoded weights and weight configs
    getEncodedWeightsAndConfig(): IModelWeightData {
        let encoded: string = ""; 
        const config: IWeightConfig[] = [];
        this.getWeights().forEach(weight => {
            encoded += weight.serialize();
            config.push(weight.getConfig());
        })
        return {encoded, config}
    }
    
    loadModelTopology(modelTopology: IModelTopology) {
        //need to reset first
        if (this.layers.length > 0) this.layers = [];

        if (modelTopology.optimiser) {
            const optimiser = modelTopology.optimiser
            this.optimiser = deserialize(optimiser, optimiserDict, "optimiser")
        }

        if (modelTopology.loss) {
            const loss = modelTopology.loss
            this.loss = deserialize(loss, lossDict, "loss")
        }

        if (this.optimiser && this.loss) this.isCompiled = true;

        modelTopology.layers.forEach(layerToplogy => {
            const layer = deserialize(layerToplogy, layerDict, "layer")
            this.addLayer(layer);
        })
    }

    loadEncodedWeights(weights: IModelWeightData) {
        const weightsBuffer = base64StringToArrayBuffer(weights.encoded);
        const currentWeights = this.getWeights();
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


    private showProgressBar(barWidth: number, step: number, numOfTrainingSteps: number) {
        const progress = step/numOfTrainingSteps
        const currentBarWidth = Math.floor(progress * barWidth)
        console.log(`${step}/${numOfTrainingSteps}[${"=".repeat(currentBarWidth)}>${".".repeat(barWidth-currentBarWidth)}] ${Math.floor(progress * 100)}%`);
    }

}



