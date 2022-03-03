import React, { useEffect, useRef, useState } from 'react';
import Matrix, { matrix, scalar, MatrixValuesType} from "lib/Matrix";
import Settings from '../Settings';
import { Container, GlobalStyle, OutputContainer } from './style';
import DigitInput from '../DigitInput';
import styled from 'styled-components';
import * as mnist from "../../mnist";
import { MnistProvider, useMnist } from '../../contexts/MnistContext';
import Graph from 'components/Graph';
import RightPanel from 'components/RightPanel';

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

const Canvas = styled.canvas`

  /* width: 400px;
  height 400px; */
  /* image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges; */


`

const PanelWrapper = styled.div`
    display: flex;
`
const LeftPanel = styled.div`
    border: 2px solid red;
`

function App() {
    
    const [testDigitIndex, setTestDigitIndex] = useState(1)

    const imgRef = useRef<HTMLCanvasElement>(null);

    const {
        model,
        saveModel,
        predict,
        results,
        trainingStepData
    } = useMnist();
    
    const drawDigit = (digit: number[] | Float32Array, x: number=0, y:number=0) => {
        console.log({digit})
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

        ctx.putImageData(imageData, x,y);
    }


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
            const color = digit[i]; 
          imageData.data[i * 4] = color * 255;
          imageData.data[i * 4 + 1] = color * 255;
          imageData.data[i * 4 + 2] = color * 255;
          imageData.data[i * 4 + 3] = 255;
        }

        const scaled = scaleImageData(imageData, 3, ctx);

        ctx.putImageData(scaled, x,y)

        // console.log(Matrix.shape1DArray(imageData.data as any as number[], [56,56]))
        // console.log(Matrix.shape1DArray(digit as any as number[], [28,28]).map(x => x * 255))

        // ctx.putImageData(imageData, x,y);

    }

    const drawMnistGrid = (digits: number[][] | Float32Array[]) => {
        //each row is the all the weights for one neuron
        const canvas = imgRef.current!;
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

    // useEffect(() => {
    //     if (!model || trainingStepData.weights.length===0) return;
    //     // console.log((trainingStepData.weights[0] as any ).value._values!)
    //     drawMnistGrid((trainingStepData.weights[0] as any ).value._values! as unknown as number[][])
    //     // drawMnistGrid(model.layers[1].weights[0].value.values)
    //     // console.log(trainingStepData.weights)
    // }, [model, trainingStepData])

    return (
        <>
        <GlobalStyle />
        <PanelWrapper>
            <LeftPanel>
                <Container>
                    <div style={{gap: "inherit", display: "flex", flexDirection: "column", height: "100%", width: "60%"}}>
                        <DigitInput predict={predict} drawDigit={drawDigit}/>
                        <Results results={results} />
                    </div>
                    <Settings/>  
                </Container>
                <Graph />
            </LeftPanel>
            <RightPanel />
        </PanelWrapper>
        </>
    )
}

export default App;


