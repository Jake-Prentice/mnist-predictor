import React, { useEffect, useRef, useState } from 'react';
import DrawCanvas from './components/DrawCanvas';
import * as Papa from "papaparse";
import Matrix from "./matrix";
import NeuralNet, { INeuralNet } from './neuralNet';

enum TrainingStatus {
    INCOMPLETE = "INCOMPLETE",
    LOADING = "LOADING",
    DONE = "DONE"
}


function App() {
    
    const [trainData, setTrainData] = useState<string[][]>([]);
    const [testData, setTestData] = useState<string[][]>([]);

    const [testDigitIndex, setTestDigitIndex] = useState(1)

    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>(TrainingStatus.INCOMPLETE);

    const [nnData, setNNData] = useState<INeuralNet>()

    const imgRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {        

        Papa.parse<any>("./data/mnist_train.csv", {
            download: true,
            delimiter: ",",
            complete: (results: Papa.ParseResult<string[]>, file) => {
                setTrainData(results.data.slice(1));
            } 
        })

        Papa.parse<any>("./data/mnist_test.csv", {
            download: true,
            delimiter: ",",
            complete: (results: Papa.ParseResult<string[]>, file) => {
                setTestData(results.data.slice(1));
            } 
        })

    },[])


    //train
    useEffect(() => {
        if (trainData.length === 0 || trainingStatus !== TrainingStatus.LOADING) return;
        
        const nnParams = {
            numOfInputs: 784, 
            numOfHiddens: 10, 
            numOfOutputs: 10
        }

        const nn = new NeuralNet(nnParams);

        console.log("training...");

        for (let i=0; i < 60000; i++) {
            const label = trainData[i][0];

            const input = new Matrix(Matrix.convertArrayToMatrix( trainData[i].slice(1) ));

            const normalised = input.map(v => ((+v / 255 ) * 0.99 ) + 0.01)
            const y = new Matrix(Array.from({length: 10}, (_, index) => [index === +label ? 1 : 0])); 
            
            
            nn.feedForward(normalised)

            if ( i % 11 === 0 ) console.log(`cost ${nn.calculateCost(y)}`)
            
            nn.backpropagate(y);
        }

        setNNData({...nnParams, w0: nn.w0, w1: nn.w1, b0: nn.b0, b1: nn.b1})

        setTrainingStatus(TrainingStatus.DONE);

        console.log("done");

    }, [trainData, trainingStatus])


    const predict = () => {
        if (!nnData) return;

        const nn = new NeuralNet(nnData);

        const current = testData[testDigitIndex];
        const label = current[0];

        const input = new Matrix(Matrix.convertArrayToMatrix( current.slice(1) )); 
        const normalised = input.map(v => ((+v / 255 ) * 0.99 ) + 0.01)
        const y = new Matrix(Array.from({length: 10}, (_, index) => [index === +label ? 1 : 0])); 

        nn.feedForward(normalised);

        console.log(`prediction: ${nn.getPrediction()}, actual: ${current[0]}, confidence: ${ nn.a2.values[nn.getPrediction()][0] * 100}%`)

        const canvas = imgRef.current!;
        const ctx = canvas.getContext("2d")!;

        canvas.width = 28;
        canvas.height = 28;

        const imageData = ctx.getImageData(0, 0, 28, 28); 
        
        for (var i = 0; i < current.length; i++) {
          imageData.data[i * 4] = +current[i] * 255;
          imageData.data[i * 4 + 1] = +current[i] * 255;
          imageData.data[i * 4 + 2] = +current[i] * 255;
          imageData.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
    }


    return (
        <>
            <DrawCanvas /> 
            <div>
                <button onClick={() => setTrainingStatus(TrainingStatus.LOADING)}>start training</button>
            </div>

            <div>
                test data index
                <input type={"number"} onChange={e => setTestDigitIndex(+e.target.value)}/>
                <button onClick={predict}>predict</button>
            </div>
            <canvas style={{width: 150, height: 150}} ref={imgRef} /> 
        </> 
    )
}

export default App;
