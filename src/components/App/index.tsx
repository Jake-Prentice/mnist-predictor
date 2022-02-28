import React, { useEffect, useRef, useState } from 'react';
import Matrix, { matrix, scalar, MatrixValuesType} from "lib/Matrix";
import Settings from '../Settings';
import { Container, GlobalStyle, OutputContainer } from './style';
import DigitInput from '../DigitInput';
import styled from 'styled-components';
import * as mnist from "../../mnist";
import { MnistProvider, useMnist } from '../../contexts/MnistContext';
import Graph from 'components/Graph';

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

    const imgRef = useRef<HTMLCanvasElement>(null);

    const {
        model,
        saveModel,
        predict,
        results
    } = useMnist();
    
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

    return (
        <>
        <GlobalStyle />
        <Container>
            <div style={{gap: "inherit", display: "flex", flexDirection: "column", height: "100%", width: "60%"}}>
                <DigitInput predict={predict} drawDigit={drawDigit}/>
                <Results results={results} />
            </div>
            <Settings/>  
        </Container>
        <Graph />
        </>
    )
}

export default App;


