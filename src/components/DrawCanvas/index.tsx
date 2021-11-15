import React, { ImgHTMLAttributes, useEffect } from 'react'
import {StyledCanvas} from "./style";
import useDrawingCanvas from "./useDrawingCanvas"


const DrawCanvas = ({predict}: {predict: (digit: string[] | number[]) => void}) => {
    const {drawCanvas, ctx} = useDrawingCanvas({initialHeight: 300, initialWidth: 300});
    
    useEffect(() => {
        drawCanvas.initStyles({lineWidth: 26})
    }, [])

    const onClick = () => {
        const c = document.createElement("canvas");
        const ctx2 = c.getContext("2d");
        
        //down scale image to 28x28
        ctx2?.drawImage(drawCanvas.ref.current!, 0, 0 ,28, 28)

        const img = ctx2?.getImageData(0,0, 28, 28)!;
        
        const inputs = [1]

        for (let i = 0; i < img.data.length; i+= 4) {
            inputs.push(img?.data[i + 3]); 
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
        <div style={{marginBottom: "40px"}}>
            <button onClick={onClick}>predict image</button>
            <button onClick={drawCanvas.clear}>clear</button>
        </div>
        </>
    )   
}

//() => console.log(ctx?.getImageData(0,0, drawCanvas.ref.current?.width!, drawCanvas.ref.current?.height!))
export default DrawCanvas;