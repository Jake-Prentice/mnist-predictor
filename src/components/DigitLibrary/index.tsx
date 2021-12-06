

import React, { useEffect, useRef, useState } from 'react'
import { TrainingStatus } from '../App';
import { ButtonContainer, StyledCanvas } from '../DigitInput/style';
import Button from '../shared/Button';
import { Container} from './style';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight, faCaretLeft} from '@fortawesome/free-solid-svg-icons'
import { useMnist } from '../../contexts/MnistContext';


const CaretButtonStyles = {
    fontSize: "1.8rem",
    color: "#a0a0a0",
    cursor: "pointer"
}

const DigitLibrary = () => {

    const [digitIndex, setDigitIndex] = useState(0);

    const imgRef = useRef<HTMLCanvasElement>(null);

    const {testData} = useMnist();
    
    useEffect(() => {
        const canvas = imgRef.current;
        const ctx = canvas?.getContext("2d");

        if (!ctx || !canvas || testData.length === 0) return;

        canvas.width = 28;
        canvas.height = 28;

        const imageData = ctx.getImageData(0, 0, 28, 28); 
        
        const digit = testData[digitIndex];

        for (var i = 0; i < digit.length; i++) {
            const value = digit[i] > 0 ? 255 : 0;
            imageData.data[i * 4] = value;
            imageData.data[i * 4 + 1] = value;
            imageData.data[i * 4 + 2] = value;
            imageData.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

    }, [digitIndex, testData])

    const onLeftCaretClick = () => {
        if (digitIndex - 1 < 0) return;
        setDigitIndex(prev => prev - 1);
    }

    const onRightCaretClick = () => {
        if (digitIndex + 1 > 10000) return;
        setDigitIndex(prev => prev + 1);
    }

    return (
        <>
            <StyledCanvas 
               style={{width: 300, height: 300}}
         
                ref={imgRef} 
            />
            <ButtonContainer> 
                <FontAwesomeIcon onClick={onLeftCaretClick} style={CaretButtonStyles} icon={faCaretLeft} /> 
                <Button>predict image</Button>
                <FontAwesomeIcon onClick={onRightCaretClick} style={CaretButtonStyles} icon={faCaretRight} />
            </ButtonContainer>
        </>
    )
}

export default DigitLibrary;
   