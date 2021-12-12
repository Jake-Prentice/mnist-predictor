import React, { useEffect, useRef, useState } from 'react';
import DrawCanvas from '../DrawCanvas';
import * as Papa from "papaparse";
import Matrix from "../../lib/matrix";
import NeuralNet, { INeuralNet } from '../../neuralNet';
import Settings from '../Settings';
import { Container, GlobalStyle, OutputContainer } from './style';
import DigitInput from '../DigitInput';
import styled from 'styled-components';
import * as mnist from "../../mnist";
import { MnistProvider, useMnist } from '../../contexts/MnistContext';

import neuralNet from "lib/NeuralNet";
import * as layers from "lib/NeuralNet/layers";
import * as activations from "lib/NeuralNet/activations"

import { GPU, KernelVariable } from 'gpu.js';

const gpu = new GPU();


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



function App() {
    

    const [testDigitIndex, setTestDigitIndex] = useState(1)

    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>(TrainingStatus.INCOMPLETE);

    const [nnData, setNNData] = useState<INeuralNet>()
    const [results, setResults] = useState<IResults>({});

    const imgRef = useRef<HTMLCanvasElement>(null);

    const {trainData, testData } = useMnist();
    

    useEffect(() => {
 
        // function test() {
        //     const m1 = new Matrix(1000, 1000);
        //     const m2 = new Matrix(1000, 1000);

        //     return Matrix.dot(m1, m2)._values;
        // }

        // const testKernal = gpu.createKernel(test).setOutput([1000, 1000])

        // console.log(testKernal());
    }, [])


    useEffect(() => {
        const nn = new neuralNet();

        nn.addLayer(new layers.Input({numOfNodes: 784}))
        nn.addLayer(new layers.Dense({
            numOfNodes: 60,

            useBias: true,
            activation: activations.ReLU
        }))

        nn.addLayer(new layers.Dense({
            numOfNodes: 10,
            useBias: false,
            activation: activations.ReLU
        }))

        const inputs = new Matrix(785, 1);

        console.log("nn", nn.predict(inputs));


    }, [])
    //train
    useEffect(() => {
        if (trainData.length === 0 || trainingStatus !== TrainingStatus.LOADING) return;
        
 

        // //SGD
        // for (let i=0; i < 60000; i++) {
        //     const label = trainData[i][0];

        //     const input = new Matrix(Matrix.convertArrayToMatrix( trainData[i].slice(1) ));

        //     const normalised = input.map(v => ((+v / 255 ) * 0.99 ) + 0.01)
        //     const y = new Matrix(Array.from({length: 10}, (_, index) => [index === label ? 1 : 0])); 
            
            
        //     nn.feedForward(normalised)

        //     if ( i % 11 === 0 ) console.log(`cost ${nn.calculateCost(y)}`)
            
        //     nn.backpropagate(y);
        // }

        //Mini-batch

        // inputBatches.forEach((batch, i) => {
        //     const inputs = new Matrix(batch);
        //     const normalised = inputs.map(v => ((+v / 255 ) * 0.99 ) + 0.01).transpose();


        //     const ys = new Matrix(outputBatches[i]).transpose();


        //     console.log(nn);
        //     nn.feedForward(normalised);

        //     nn.backpropagate(ys)

        //     console.log(i);

        // })

   
            const nnParams = {
                numOfInputs: 784, 
                numOfHiddens: 60, 
                numOfOutputs: 10,
                batchSize: 32
            }
    
            const nn = new NeuralNet(nnParams);
    
            console.log("training...");
            console.log({trainData})
    
            const [inputBatches, outputBatches] = mnist.getMiniBatches(nnParams.batchSize, trainData);

            console.log({inputBatches})

            for (let e=0; e < 5; e++) {
                inputBatches.forEach((batch, i) => {
                    const inputs = new Matrix(batch);

                    const normalised = inputs.map(v => ((+v / 255 ) * 0.99 ) + 0.01).transpose();

                    const ys = new Matrix(outputBatches[i]).transpose();
                    nn.feedForward(normalised);
        
                    nn.backpropagate(ys)
        
                    console.log(i);
        
                })
            }
                
            setNNData({...nnParams, w0: nn.w0, w1: nn.w1, b0: nn.b0, b1: nn.b1})

            setTrainingStatus(TrainingStatus.DONE);

            console.log("done");
   


    }, [trainData, trainingStatus])


    const drawDigit = (digit: number[]) => {
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
        if (!nnData) return;

        const nn = new NeuralNet(nnData);

        const input = new Matrix(Matrix.convertArrayToMatrix( digit.slice(1) )); 
        const normalised = input.map(v => ((+v / 255 ) * 0.99 ) + 0.01)

        nn.feedForward(normalised);

        console.log(`prediction: ${nn.getPrediction()}, actual: ${digit[0]}, confidence: ${ nn.a2._values[nn.getPrediction()][0] * 100}%`)

        setResults({
            prediction: nn.getPrediction(), 
            confidence: Math.round(nn.a2._values[nn.getPrediction()][0] * 100 )
        })
        console.log("outside", {digit}) 
        drawDigit(normalised._values.flat()); 
        
   
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
                
                {/* <div>
                    <button onClick={() => setTrainingStatus(TrainingStatus.LOADING)}>start training</button>
                </div>
                <OutputContainer>
                    prediction: 
                </OutputContainer>
                <div style={{width: "300px", height: "300px"}}>
                    <div>
                        test data index
                        <input type={"number"} onChange={e => setTestDigitIndex(+e.target.value)}/>
                        <button onClick={() => predict(testData[testDigitIndex])}>predict</button>
                    </div>
                
                </div> */}
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
