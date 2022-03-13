import { useMnist } from 'contexts/MnistContext';
import React, { ImgHTMLAttributes, useEffect } from 'react'
import styled from 'styled-components';
import { ButtonContainer, StyledCanvas } from '../DigitInput/style';
import Button from '../shared/Button';
import { Margin } from '../shared/spacing';
import {} from "./style";
import useDrawingCanvas from "./useDrawingCanvas"



const DrawCanvas = () => {
    const {predict} = useMnist();
    const {drawCanvas, ctx} = useDrawingCanvas({
        initialHeight: 300, 
        initialWidth: 300
    });
    
    useEffect(() => {
        drawCanvas.initStyles({lineWidth: 28})
    }, [])

    const onClick = () => {
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d")!; 
        //down scale image to 28x28
        ctx?.drawImage(drawCanvas.ref.current!, 0, 0 ,28, 28)
        const img = ctx?.getImageData(0,0, 28, 28)!;
        const inputs = [1]
        for (let i = 0; i < img.data.length; i+= 4) {
            inputs.push(img?.data[i + 3]); 
        }

        predict(inputs); 
    }
    
    return (
        <>
        <StyledCanvas
            ref={drawCanvas.ref}
            onMouseDown={drawCanvas.startDrawing}
            onTouchStart={drawCanvas.startDrawing}

            onMouseUp={drawCanvas.finishDrawing}
            onTouchEnd={drawCanvas.finishDrawing}
            
            onMouseMove={drawCanvas.draw}
            onTouchMove={drawCanvas.draw}
        />
        <ButtonContainer> 
            <Button onClick={onClick}>predict image</Button>
            <Button onClick={drawCanvas.clear}>clear</Button>
        </ButtonContainer>
        </>
    )   
}

export default DrawCanvas;