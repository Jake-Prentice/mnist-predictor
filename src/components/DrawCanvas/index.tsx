import React, { useEffect } from 'react'
import {StyledCanvas} from "./style";
import useDrawingCanvas from "./useDrawingCanvas"


const DrawCanvas = () => {
    const {drawCanvas, ctx} = useDrawingCanvas({initialHeight: 28, initialWidth: 28});
    
    useEffect(() => {
        drawCanvas.initStyles()
    }, [])
    
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
        {/* <button onClick={() => console.log(ctx?.getImageData(0,0, drawCanvas.ref.current?.width!, drawCanvas.ref.current?.height!))}>click</button> */}
        </>
    )   
}

export default DrawCanvas;