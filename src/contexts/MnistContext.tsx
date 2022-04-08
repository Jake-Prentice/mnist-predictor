import React, { useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import * as Papa from "papaparse";
import useLocalStorage from 'hooks/useLocalStorage';

import Matrix from 'lib/Matrix';
import {
    layers,
    initializers,
    losses,
    activations,
    optimisers,
    IModelTopology,
    IModelWeightData,
    Model
} from "lib/NeuralNet";
import { wrapSerializable } from 'lib/NeuralNet/serialization';

const MnistContext = React.createContext<IValue | undefined>(undefined);

interface IProps {}

interface IValue {
    trainData: number[][];
    testData: number[][];
    saveModel: () => void;
    modelTopology: IModelTopology | undefined;
    weights: IModelWeightData | undefined;
    model: Model | undefined;
    predict: (digit: number[]) => void;
    trainModel: () => void;
    results: IResults;
    isTraining: boolean;
    trainingStepData: ITrainingStepData;
    epochs: number;
    setEpochs: React.Dispatch<React.SetStateAction<number>>
    isTrainDataLoading: boolean;
    batchSize: number;
    setBatchSize: React.Dispatch<React.SetStateAction<number>>;
    learningRate: number;
    setLearningRate: React.Dispatch<React.SetStateAction<number>>;
    optimiser: string;
    setOptimiser: React.Dispatch<React.SetStateAction<string>>;
    lossFunc: string;
    setLossFunc: React.Dispatch<React.SetStateAction<string>>;
}

export function useMnist() {
   const context = useContext(MnistContext);
   if (!context) throw new Error("mnist context is undefined");
   return context;
}

const fetchMnistCsv = async (path: string, cb: (results: number[][]) => void) => {
    const file = await fetch(path)
    const blob = await file.blob();

    const results: number[][] = [];

    Papa.parse<any>(blob, {
        delimiter: ",",
        dynamicTyping: true,
        skipEmptyLines: true,
        worker: true,
        step: (stepResults) => {
            results.push(stepResults.data);
        },
        complete: () => { cb(results)}
    })
} 

interface IResults {
    prediction?: number;
    confidence?: number;
}

export interface DataPoint {
    x: number, 
    y: number
}

export interface ITrainingStepData { 
    losses: DataPoint[];
    currentEpoch: number;
    progress: number;
    weights: layers.Weight[];
}

const defaultTrainingStepData: ITrainingStepData = {
    losses: [],
    currentEpoch: 0,
    progress: 0,
    weights: []
}

export function MnistProvider({children}: React.PropsWithChildren<IProps>) {
    
    //updates to model won't cause component re renders
    const model = useRef<Model>();

    //mnist data set
    const [trainData, setTrainData] = useState<number[][]>([]);
    const [testData, setTestData] = useState<number[][]>([]);
    const [isTrainDataLoading, setIsTrainDataLoading] = useState(false);

    //model
    const [modelTopology, setModelToplogy] = useLocalStorage<IModelTopology | undefined>("model-topology");
    const [weights, setWeights] = useLocalStorage<IModelWeightData | undefined>("weights");
    
    const [isTraining, setIsTraining] = useState(false);
    const [trainingStepData, setTrainingStepData] = useState<ITrainingStepData>(defaultTrainingStepData);

    //training paramaters
    const [epochs, setEpochs] = useLocalStorage("epochs", 5)
    const [batchSize, setBatchSize] = useLocalStorage("batch-size", 32);
    const [learningRate, setLearningRate] = useState(0.01);
    const [optimiser, setOptimiser] = useState("sgd");
    const [lossFunc, setLossFunc] = useState("sse");

    const [results, setResults] = useState<IResults>({});

    //will only get recalled if trainData changes
    const [normalisedX, y] = useMemo(() => {
        const y = trainData.map(sample => {
            const label = sample[0]
            return Array.from({length: 10}, (_, index) => index === label ? 1 : 0) 
        })
     
        const x = trainData.map(sample => {
            return sample.slice(1);
        })

        const xNormalised = x.map(r => r.map(v => ((+v / 255 ) * 0.99 ) + 0.01));     
        return [xNormalised,y];
    }, [trainData])

    useEffect(() => {
        console.log({normalisedX, y})
    }, [normalisedX, y])
    const trainModel = useCallback(async () => {
        if (!model.current || trainData.length === 0) return;
        setIsTraining(true);
        
        //cleanup before re training 
        //so that it doesn't overlap with the current
        //data in the loss graph
        if (trainingStepData.losses.length > 0) {
            setTrainingStepData(defaultTrainingStepData)
        }

        if (weights) model.current.reset();
        
        model.current.setLoss(lossFunc);
        model.current.setOptimiser(optimiser);

        model.current.optimiser.learningRate = learningRate;

        setModelToplogy(model.current.getModelTopology())

        await model.current.trainOnWorker({    
            epochs,
            batchSize,
            x: normalisedX,
            y,
            printEvery: 30,
            onTrainingStep: params => setTrainingStepData(prev => {
                return {
                    //for the graph
                    losses: [...prev.losses, {
                        x: params.step,
                        y: params.loss
                    }], 
                    currentEpoch: params.epoch,
                    progress: params.progress,
                    weights: params.weights
                }
            })
        })

        setIsTraining(false);
        setWeights(model.current.getEncodedWeightsAndConfig());

    }, [
        model, 
        epochs, 
        lossFunc,
        optimiser,
        learningRate,
        batchSize, 
        trainData,
        trainingStepData
    ])


    const saveModel = useCallback(() => {
        if (!model.current) return;
        setModelToplogy(model.current.getModelTopology());
        setWeights(model.current.getEncodedWeightsAndConfig());   
    }, [model])


    const predict = useCallback((digit: number[]) => {
        if (!model.current) return;
        const input = Matrix.shape1DArray( digit.slice(1), [digit.length-1, 1]);
        const normalised = input.map(v => ((v / 255 ) * 0.99 ) + 0.01)

        const output = model.current.forward(normalised);
        const {value, position} = output.max();

        setResults({
            prediction: position[0], //the row
            confidence: Math.round(value * 100)
        })
    }, [])

    //load dataset
    useEffect(() => {
        //need to remove top line from csv file
        setIsTrainDataLoading(true);

        fetchMnistCsv("./data/mnist_train.csv", (results) => {
            console.log("training data loaded. Ready to train")
            setTrainData(results.slice(1))
            setIsTrainDataLoading(false);
        })

        fetchMnistCsv("./data/mnist_test.csv", (results) => {
            console.log("test data loaded")
            setTestData(results.slice(1))
        })
    }, []) 
    
    useEffect(() => {
        //setup
        model.current = new Model();
        if (modelTopology) {
            model.current.loadModelTopology(modelTopology);

            if (model.current.optimiser) {
                setLearningRate(model.current.optimiser.learningRate)
            }

            if (weights) {
                model.current.loadEncodedWeights(weights);
            }

            return;
        }

        //load default model
        model.current.addLayer(new layers.Input({numOfNodes: 784}))

        model.current.addLayer(new layers.Dense({
            numOfNodes: 60,
            useBias: true,
            kernelInitializer: new initializers.RandomUniform(),
            activation: "sigmoid"
        }))

        model.current.addLayer(new layers.Dense({
            numOfNodes: 10, 
            useBias: true,
            activation: new activations.SoftMax()
        }))

    }, []);

    const value = {
        trainData,
        testData,

        saveModel,
        trainModel,

        modelTopology,
        weights,
        model: model.current,

        predict,
        results,
        isTraining,
        trainingStepData,
        isTrainDataLoading,
        
        epochs,
        setEpochs,
        batchSize,
        setBatchSize,
        learningRate,
        setLearningRate,
        optimiser,
        setOptimiser,
        lossFunc,
        setLossFunc
    }

    return (
        <MnistContext.Provider value={value}>
            {children}
        </MnistContext.Provider>
    )
}
