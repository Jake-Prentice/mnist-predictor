import { useMnist } from 'contexts/MnistContext';
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components';

function scaleImageData(imageData: ImageData, scale: number, ctx: CanvasRenderingContext2D ) {
    var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);
    var subLine = ctx.createImageData(scale, 1).data
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = imageData.data.subarray(
                (row * imageData.width + col) * 4,
                (row * imageData.width + col) * 4 + 4
            );
            for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x*4)
            for (var y = 0; y < scale; y++) {
                var destRow = row * scale + y;
                var destCol = col * scale;
                scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
            }
        }
    }

    return scaled;
}


const drawAtPosition = (
    digit: number[] | Float32Array, 
    ctx: CanvasRenderingContext2D, 
    x:number=0, 
    y:number=0
) => {
    // const imageData = {data: new Float32Array(56* 56)}

    // console.log(Matrix.shape1DArray(imageData.data, [56,56]))

    const imageData = ctx.getImageData(0, 0, 28, 28); 

    for (var i = 0; i < digit.length; i++) {
        const color = digit[i] > 0 ? 255 * digit[i] : 0; 
      imageData.data[i * 4] = 255;
      imageData.data[i * 4 + 1] = 255;
      imageData.data[i * 4 + 2] = 255;
      imageData.data[i * 4 + 3] = 255 ;
      console.log(imageData.data[i * 4])
    }

    const scaled = scaleImageData(imageData, 3, ctx);

    ctx.putImageData(scaled, x,y)

    // console.log(Matrix.shape1DArray(imageData.data as any as number[], [56,56]))
    // console.log(Matrix.shape1DArray(digit as any as number[], [28,28]).map(x => x * 255))

    // ctx.putImageData(imageData, x,y);

}

const Canvas = styled.canvas`

  /* width: 400px;
  height 400px; */
  /* image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges; */


`

const WeightVisualizaton = () => {

    const weightCanvasRef = useRef<HTMLCanvasElement>(null);

    const drawMnistGrid = (digits: number[][] | Float32Array[]) => {
        //each row is the all the weights for one neuron
        const canvas = weightCanvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const rows = digits.length;
    
        let dimensions = Math.floor(rows ** 0.5);
        if (rows ** 0.5 != dimensions) dimensions++;
    
        const padding = 3;
        const scalingFactor = 3;
    
        canvas.width =  dimensions * (28 * scalingFactor + padding)
        canvas.height = dimensions * (28 * scalingFactor + padding);
    
        ctx.imageSmoothingEnabled = false;
    
        let y=-1
        for (let neuronNum=0; neuronNum < rows; neuronNum++) {
            const digit = digits[neuronNum];
            if (neuronNum % dimensions === 0) y+=1; 
            drawAtPosition(
                digit,
                ctx,
                ( neuronNum % dimensions * (28 * scalingFactor + padding)), 
                y * (28 * scalingFactor + padding)
            );
        }
    }


    useEffect(() => {

    }, [])

    const {trainingStepData} = useMnist();
    return (
        <div>

            <Canvas ref={weightCanvasRef} />
        </div>

    )
}

export default WeightVisualizaton;