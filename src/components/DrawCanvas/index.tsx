import React, { useEffect } from 'react'
import {StyledCanvas} from "./style";
import useDrawingCanvas from "./useDrawingCanvas"


const DrawCanvas = ({predict}: {predict: (digit: string[] | number[]) => void}) => {
    const {drawCanvas, ctx} = useDrawingCanvas({initialHeight: 300, initialWidth: 300});
    
    useEffect(() => {
        drawCanvas.initStyles()
    }, [])

    const onClick = () => {
        ctx?.drawImage(drawCanvas.ref.current!, 0, 0 ,28, 28)
        const img = ctx?.getImageData(0,0, 28, 28)!;
        const inputs = [1]


        for (let i = 1; i <= 784; i++) {
            inputs.push(img?.data[(i * 4) - 1]) 
        }

       predict(inputs)
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
        <button onClick={onClick}>click</button>
        </>
    )   
}

//() => console.log(ctx?.getImageData(0,0, drawCanvas.ref.current?.width!, drawCanvas.ref.current?.height!))
export default DrawCanvas;