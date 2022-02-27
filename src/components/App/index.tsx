import React, { useEffect, useRef, useState } from 'react';
import Matrix, { matrix, scalar, MatrixValuesType} from "lib/Matrix";
import Settings from '../Settings';
import { Container, GlobalStyle, OutputContainer } from './style';
import DigitInput from '../DigitInput';
import styled from 'styled-components';
import * as mnist from "../../mnist";
import { MnistProvider, useMnist } from '../../contexts/MnistContext';
// import NeuralNet from "lib/NeuralNet";
import * as layers from "lib/NeuralNet/layers";
import * as activations from "lib/NeuralNet/activations"

import { SSE } from 'lib/NeuralNet/losses';
import { SGD } from 'lib/NeuralNet/optimisers';
import { getFuncExecTime } from 'utils';
import {wrap} from "comlink"
import { Model } from 'lib';
import { NodeBuilderFlags } from 'typescript';
import { RandomUniform } from 'lib/NeuralNet/initializers';


export enum TrainingStatus {
    INCOMPLETE = "INCOMPLETE",
    LOADING = "LOADING", 
    DONE = "DONE"
}

const ResultsContainer = styled.div`
    height: 30%;
    width: 100%;
    box-shadow: 0 0 5px rgba(0,0,0,.25);
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`

interface IResults {
    prediction?: number;
    confidence?: number;
}

const Results = ({results}: {results: IResults}) => {
    return (
        <ResultsContainer>
            <h4>Prediction: {results.prediction}</h4>
            <h4>Confidence: {results.confidence}%</h4> 
        </ResultsContainer>
    )
}

function isTypedArray(arr: MatrixValuesType): arr is Float32Array[] {
    return arr[0] instanceof Float32Array
}


function App() {
    

    const [testDigitIndex, setTestDigitIndex] = useState(1)

    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>(TrainingStatus.INCOMPLETE);

    const [results, setResults] = useState<IResults>({});
    const [data, setData] = useState<{loss: number, epoch: number}[]>([]);
   const nn2 = useRef<Model>()


    const imgRef = useRef<HTMLCanvasElement>(null);

    const {trainData, testData } = useMnist();
    
    useEffect(() => {
        console.log({nn2: nn2.current})
        if (!nn2.current) return;
            const [testX, testY] = mnist.getData(testData);
            const testXNorm = testX[0].map(v => [((+v / 255 ) * 0.99 ) + 0.01]);

            console.log({testXNorm, testX, testY: testY[0]})

            console.log("nn", nn2.current.forward(new Matrix(testXNorm)));
    }, [nn2.current])


    //train
    useEffect(() => {
        if (trainData.length === 0 || trainingStatus !== TrainingStatus.LOADING) return;

        const nn = new Model(); 
        
        const [x,y] = mnist.getData(trainData);
        
        const start = window.performance.now();
        const xNormalised = x.map(r => r.map(v => ((+v / 255 ) * 0.99 ) + 0.01));
        const end = window.performance.now();

        console.log(end - start);

        nn.addLayer(new layers.Input({numOfNodes: 784}))

        nn.addLayer(new layers.Dense({
            numOfNodes: 60,
            useBias: true,
            kernelInitializer: new RandomUniform(),
            activation: new activations.Sigmoid()
        }))

        nn.addLayer(new layers.Dense({
            numOfNodes: 30, //note check 
            useBias: true,
            activation: new activations.Sigmoid()
        }))
        nn.addLayer(new layers.Dense({
            numOfNodes: 10, //note check 
            useBias: true,
            activation: new activations.Sigmoid()
        }))

        nn.compile({
            loss: new SSE(),
            optimiser: new SGD(),
        });

        (async() => {
            await nn.trainOnWorker({    
                epochs: 1,
                batchSize: 32,
                x: xNormalised,
                y,
                printEvery: 1500000,
                onTrainingStep: ({loss, epoch}) => setData(prev => [...prev, {loss, epoch}])
            })

            nn2.current = nn;
        })();

    }, [trainData, trainingStatus])

    useEffect(() => {
        console.log({data});
    }, [data])

    const drawDigit = (digit: number[] | Float32Array) => {
        const canvas = imgRef.current!;
        const ctx = canvas.getContext("2d")!;

        canvas.width = 28;
        canvas.height = 28;

        const imageData = ctx.getImageData(0, 0, 28, 28); 
        
        for (var i = 0; i < digit.length; i++) {
          imageData.data[i * 4] = digit[i] * 255;
          imageData.data[i * 4 + 1] = digit[i] * 255;
          imageData.data[i * 4 + 2] = digit[i] * 255;
          imageData.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    const predict = (digit: number[]) => {
        const nn = nn2.current
        if (!nn) return;

        const input = Matrix.shape1DArray( digit.slice(1), [digit.length -1, 1]);
        const normalised = input.map(v => ((+v / 255 ) * 0.99 ) + 0.01)

        const outputs = nn.forward(normalised);

        let maxValue = 0;
        let maxIndex = 0;
        let maxcol = 0;

        outputs.iterate((v, i,j)=> {
            if (v > maxValue) {
                maxValue = v; maxIndex = i;  maxcol=j;
            } 
        })

        setResults({
            prediction: maxIndex, 
            confidence: Math.round(outputs.values[maxIndex][maxcol] * 100)
        })
        console.log("outside", {digit}) 
        drawDigit(normalised.flat()); 
    }

    return (
        <>
        <GlobalStyle />
            <Container>
                <div style={{gap: "inherit", display: "flex", flexDirection: "column", height: "100%", width: "60%"}}>
                    <DigitInput predict={predict} drawDigit={drawDigit}/>
                    <Results results={results} />
                </div>
                <Settings setTrainingStatus={setTrainingStatus}/>  
            </Container>
            <div style={{width: "300px", height: "300px"}}>
                <div>
                    test data index
                    <input type={"number"} onChange={e => setTestDigitIndex(+e.target.value)}/>
                    <button onClick={() => predict(testData[testDigitIndex])}>predict</button>
                </div>
            </div> 
            <canvas style={{width: 300, height: 300}} ref={imgRef} /> 
        </>
    )
}

export default App;


