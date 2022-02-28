import React, { useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import * as Papa from "papaparse";
import { IModelTopology, IModelWeightData, IOnTrainingStepArgs, Model } from 'lib';
import useLocalStorage from 'hooks/useLocalStorage';
//change pls
import * as layers from "lib/NeuralNet/layers";
import * as activations from "lib/NeuralNet/activations"
import { SSE } from 'lib/NeuralNet/losses';
import { RandomUniform } from 'lib/NeuralNet/initializers';
import { SGD } from 'lib/NeuralNet/optimisers';
import Matrix from 'lib/Matrix';



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
    isTrainDataLoading: boolean;
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
}

const defaultTrainingStepData: ITrainingStepData = {
    losses: [],
    currentEpoch: 0,
    progress: 0
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
    const [weights, setWeights] = useLocalStorage<IModelWeightData | undefined>("weight-config");
    
    const [isTraining, setIsTraining] = useState(false);
    const [trainingStepData, setTrainingStepData] = useState<ITrainingStepData>(defaultTrainingStepData);

    //model paramaters
    const [epochs, setEpochs] = useState(5)
    const [batchSize, setBatchSize] = useState(32);

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


    const trainModel = useCallback(async () => {
        if (!model.current || trainData.length === 0) return;
        //cleanup before re training so that it doesn't overlap with the current
        //data in the loss graph
        if (trainingStepData.losses.length > 0) {
            console.log(defaultTrainingStepData)
            setTrainingStepData(defaultTrainingStepData)
        }
        setIsTraining(true);

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
                    progress: params.progress
                }
            })
        })

        setIsTraining(false);
        setWeights(model.current.getEncodedWeightsAndConfig());

    }, [
        model, 
        epochs, 
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
        const input = Matrix.shape1DArray( digit.slice(1), [digit.length -1, 1]);
        const normalised = input.map(v => ((v / 255 ) * 0.99 ) + 0.01)

        const output = model.current.forward(normalised);
        console.log(model)
        const {value, position} = output.max();

        setResults({
            prediction: position[0], 
            confidence: Math.round(value * 100)
        })
    }, [])

    //load dataset
    useEffect(() => {
        //need to remove top line from csv file
        setIsTrainDataLoading(true);

        fetchMnistCsv("./data/mnist_train.csv", (results) => {
            setTrainData(results.slice(1))
            setIsTrainDataLoading(false);
            console.log("training data loaded. Ready to train")
        })

        fetchMnistCsv("./data/mnist_test.csv", (results) => {
            setTestData(results.slice(1))
            console.log("test data loaded")
        })
    }, []) 
    
    useEffect(() => {
        //setup
        model.current = new Model();
        if (modelTopology) {
            model.current.loadModelTopology(modelTopology);
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
            kernelInitializer: new RandomUniform(),
            activation: new activations.ReLU()
        }))

        // model.current.addLayer(new layers.Dense({
        //     numOfNodes: 30, //note check 
        //     useBias: true,
        //     activation: new activations.ReLU()
        // }))
        model.current.addLayer(new layers.Dense({
            numOfNodes: 10, //note check 
            useBias: true,
            activation: new activations.Sigmoid()
        }))

        model.current.compile({
            loss: new SSE(),
            optimiser: new SGD(),
        });

        setModelToplogy(model.current.getModelTopology())
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
        setBatchSize
    }

    return (
        <MnistContext.Provider value={value}>
            {children}
        </MnistContext.Provider>
    )
}
