import React, { useEffect, useRef, useState } from 'react';
import DrawCanvas from './components/DrawCanvas';
import * as Papa from "papaparse";
import Matrix from "./matrix";

function App() {
    
    const [data,setData] = useState([]);
    const imgRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {        

        Papa.parse<any>("./data/mnist_test.csv", {
            download: true,
            delimiter: ",",
            complete: (results, file) => {
                setData(results.data[25].slice(1));
            } 
        })

    },[])

    useEffect(() => {
        if (!data) return;
        console.log(data);
        const canvas = imgRef.current!;
        const ctx = canvas.getContext("2d")!;

        canvas.width = 28;
        canvas.height = 28;

        var imageData = ctx.getImageData(0, 0, 28, 28);
        for (var i = 0; i < data.length; i++) {
          imageData.data[i * 4] = data[i] * 255;
          imageData.data[i * 4 + 1] = data[i] * 255;
          imageData.data[i * 4 + 2] = data[i] * 255;
          imageData.data[i * 4 + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
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
