import React, { useEffect, useRef, useState } from 'react';
import DrawCanvas from '../DrawCanvas';
import * as Papa from "papaparse";
import Matrix from "../../matrix";
import NeuralNet, { INeuralNet } from '../../neuralNet';
import Settings from '../Settings';
import { Container, GlobalStyle, OutputContainer } from './style';
import DigitInput from '../DigitInput';
import styled from 'styled-components';
import * as mnist from "../../mnist";



// const train =  (nn: NeuralNet, inputBatches: number[][][], outputBatches: number[][][]) => new Promise<void>((resolve, reject) => {
    

//     resolve();
// })


export enum TrainingStatus {
    INCOMPLETE = "INCOMPLETE",
    LOADING = "LOADING",
    DONE = "DONE"
}


const ResultsContainer = styled.div`
    height: 30%;
    width: 100%;
    box-shadow: 0 0 5px rgba(0,0,0,.25);
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`
const Results = () => {
    return (
        <ResultsContainer>
            <h4>Prediction: 5</h4>
            <h4>Confidence: 99%</h4>
        </ResultsContainer>
    )
}

function App() {
    
    const [trainData, setTrainData] = useState<number[][]>([]);
    const [testData, setTestData] = useState<number[][]>([]);

    const [testDigitIndex, setTestDigitIndex] = useState(1)

    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>(TrainingStatus.INCOMPLETE);

    const [nnData, setNNData] = useState<INeuralNet>()

    const imgRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {        

        Papa.parse<any>("./data/mnist_train.csv", {
            download: true,
            delimiter: ",",
            dynamicTyping: true,
            complete: (results: Papa.ParseResult<number[]>, file) => {
                setTrainData(results.data.slice(1));
            } 
        })

        Papa.parse<any>("./data/mnist_test.csv", {
            download: true,
            delimiter: ",",
            dynamicTyping: true,
            complete: (results: Papa.ParseResult<number[]>, file) => {
                setTestData(results.data.slice(1));
            } 
        })

    },[])

 
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

        drawDigit(digit); 
   
    }


    return (
        <>
        <GlobalStyle />
        <Container>
            <div style={{gap: "inherit", display: "flex", flexDirection: "column", height: "100%", width: "60%"}}>
                <DigitInput predict={predict} />
                <Results />
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
                  <div style={{width: "300px", height: "300px"}}>
                <div>
                    test data index
                    <input type={"number"} onChange={e => setTestDigitIndex(+e.target.value)}/>
                    <button onClick={() => predict(testData[testDigitIndex])}>predict</button>
                </div>
            
            </div> */
        </Container>
        <canvas style={{width: 300, height: 300}} ref={imgRef} /> 
        </>
    )
}

export default App;
