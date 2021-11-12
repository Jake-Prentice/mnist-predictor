import React, {useState, useRef, useEffect} from 'react'

type options = Partial<CanvasRenderingContext2D>;

function isMouseEvent<T> (e: React.MouseEvent<T>): e is React.MouseEvent<T> {
    return e?.nativeEvent instanceof MouseEvent
}

function isTouchEvent<T> (e: React.TouchEvent<T>): e is React.TouchEvent<T> {
    return e?.nativeEvent instanceof TouchEvent
}


const useDrawingCanvas = (
    {initialHeight=200, initialWidth=200}: 
    {initialHeight: number; initialWidth: number}
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [width, setWidth] = useState(initialHeight);
    const [height, setHeight] = useState(initialWidth);
    
    useEffect(() => {
        adjustForDifferentPxRatios();        
    }, [width, height])

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.style.width = width.toString();
        }
    },[width])
    
    useEffect(() => {
        if (canvasRef.current){
            canvasRef.current.height = height;  
            canvasRef.current.style.height = height.toString();  
        } 
    },[height])
 
    function getOffsetCoords (e: any) {
        if (isMouseEvent<HTMLCanvasElement>(e)) return [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
        if (isTouchEvent<HTMLCanvasElement>(e) && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top]
        }

        throw new Error("not of event touch or mouse")
    }

    const adjustForDifferentPxRatios = () => {
        if (!canvasRef.current || !ctxRef.current) return;
        
        const { width, height } = canvasRef.current.getBoundingClientRect()
        if (canvasRef.current.width !== width || canvasRef.current.height !== height) {
            const { devicePixelRatio:ratio=1 } = window
            canvasRef.current.width = width*ratio
            canvasRef.current.height = height*ratio
            ctxRef.current.scale(ratio, ratio)
        }
    }
    
    const initStyles = (options: options) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctxRef.current = ctx;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "" + ctx.strokeStyle || "black";
        ctx.shadowBlur = 2;
        Object.assign(ctx, options);
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!ctxRef.current) return
        setIsDrawing(true);
        const [x,y] = getOffsetCoords(e);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(x,y);
        drawPoint(x,y);
    }

    const finishDrawing = () => {
        if (!ctxRef.current) return
        setIsDrawing(false);
        ctxRef.current.closePath();
    }

    const drawPoint = (x: number, y: number) => {
        ctxRef.current!.lineTo(x,y);
        ctxRef.current!.stroke();
    }
    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctxRef.current) return;
        const [x,y] = getOffsetCoords(e);
        drawPoint(x,y)
    }

    const clear = () => {
        if (!canvasRef.current || !ctxRef.current) return;
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    const convertToImage = () => {
        if (!canvasRef.current) return;
        return canvasRef.current.toDataURL("image/png");
    }

    const drawCanvas = {
        setWidth,
        setHeight,
        initStyles,
        ref: canvasRef,
        startDrawing,
        finishDrawing,
        draw,
        getOffsetCoords,
        clear,
        setIsDrawing,
        convertToImage
    }
    return {
        drawCanvas,
        ctx: ctxRef.current
    }
}

export default useDrawingCanvas;
