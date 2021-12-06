import React, { ImgHTMLAttributes, useEffect } from 'react'
import styled from 'styled-components';
import { ButtonContainer, StyledCanvas } from '../DigitInput/style';
import Button from '../shared/Button';
import { Margin } from '../shared/spacing';
import {} from "./style";
import useDrawingCanvas from "./useDrawingCanvas"



const DrawCanvas = ({predict, drawDigit}: {
    predict: (digit: number[]) => void,
     drawDigit: (digit: number[]) => void
}) => {
    const {drawCanvas, ctx} = useDrawingCanvas({initialHeight: 300, initialWidth: 300});
    
    useEffect(() => {
        drawCanvas.initStyles({lineWidth: 28})
     
    }, [])

    const onClick = () => {
        const c = document.createElement("canvas");
        const ctx2 = c.getContext("2d")!; 
     
        
        //down scale image to 28x28
        ctx2?.drawImage(drawCanvas.ref.current!, 0, 0 ,28, 28)

        const img = ctx2?.getImageData(0,0, 28, 28)!;
        
        const inputs = [1]
        // const inputs2 = [1];

        for (let i = 0; i < img.data.length; i+= 4) {
            inputs.push(img?.data[i + 3]); 
        }

        // console.log({inputs})

        // let distanceRow = 0;
        // let distanceCol = 0;
        // let numOfPixels = 0;

        // for (let i=0; i < inputs.length; i++) {
            
        //     if (inputs[i] === 0) continue;

        //     numOfPixels += 1;

        //     const row = Math.floor(i / 28);
        
        //     const col = i - (row * 28);

        //     console.log({row,col})

        //     distanceRow += (13 - row );
        //     distanceCol += (13 - col );

        // }

        // const averageRow = Math.floor((distanceRow / numOfPixels)) 
        // const averageCol = Math.floor( (distanceCol / numOfPixels))

        // console.log({averageCol, averageRow})
        // const inputs2 = Array.from({length: 784}, () => 0);

        // for (let i=0; i < inputs.length; i++) {
        //     if (inputs[i] === 0) continue;
         
        //     const newIndex = (i + (averageRow * 28) ) + averageCol;
        //     console.log(newIndex)
        //     inputs2[newIndex] = inputs[i];
        // }

        // inputs2.unshift(1);



        predict(inputs); 
        // inputs2.push(...Array.from({length: 112}, _ => 0))
        // for (let i=0; i < inputs.length; i+=20) {
        //     inputs2.push(0,0,0,0);
        //     inputs2.push(...inputs.slice(i, i+20))
        //     inputs2.push(0,0,0,0);

        // }
        // inputs2.push(...Array.from({length: 112}, _ => 0))

    //    predict(inputs2)
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

//() => console.log(ctx?.getImageData(0,0, drawCanvas.ref.current?.width!, drawCanvas.ref.current?.height!))
export default DrawCanvas;