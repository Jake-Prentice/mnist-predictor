import React, { useEffect, useRef, useState } from 'react';
import DrawCanvas from './components/DrawCanvas';
import * as Papa from "papaparse";
import Matrix from "./matrix";
import NeuralNet from './neuralNet';

function App() {
    
    const [data,setData] = useState<string[][]>([]);
    const imgRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {        

        Papa.parse<any>("./data/mnist_train.csv", {
            download: true,
            delimiter: ",",
            complete: (results: Papa.ParseResult<string[]>, file) => {
                setData(results.data.slice(1));
            } 
        })

    },[])

    useEffect(() => {
        if (data.length === 0) return;

        const canvas = imgRef.current!;
        const ctx = canvas.getContext("2d")!;

        canvas.width = 28;
        canvas.height = 28;

        var imageData = ctx.getImageData(0, 0, 28, 28);
        const digit = data[2];
        
        for (var i = 0; i < digit.length; i++) {
          imageData.data[i * 4] = +digit[i] * 255;
          imageData.data[i * 4 + 1] = +digit[i] * 255;
          imageData.data[i * 4 + 2] = +digit[i] * 255;
          imageData.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
        

        const nn = new NeuralNet(784, 10, 10);

        const label = digit.shift()!;

        const input = new Matrix(Matrix.convertArrayToMatrix(digit));
        const y = new Matrix(Array.from({length: 10}, (_, index) => [index === +label ? 1 : 0])); 

        nn.feedForward(input, y)

    }, [data])



    // useEffect(() => {
    //     console.log(data)
    // }, [data])
    // const m1 = new Matrix([[1]])

    // const m2 = new Matrix(10,10)
    // m2.initRand(0,10);

    // // console.log(Matrix.add(m1,m2))
    // console.log(m2.transpose())
    
  
    return (
        <>
            <DrawCanvas /> 
            <canvas style={{width: 150, height: 150}} ref={imgRef} /> 
        </>
    )
}

export default App;
