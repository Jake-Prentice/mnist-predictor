import { create2dArray } from "lib/util";
import Matrix, { Shape,  } from ".";


const getStrideMask = (inShape: [number, number], outShape: [number, number]) => {
    return [
      +!(outShape[0] > 1 && inShape[0] === 1 || inShape[0] === 0),
      +!(outShape[1] > 1 && inShape[1] === 1 || inShape[0] === 0),
    ];
}

const assertAndGetBroadcastShape = (shapeA: Shape, shapeB: Shape) => {
    const resultShape = []
    for (let i=0; i < shapeA.length; i++) {
        const a = shapeA[i];
        const b = shapeB[i];

        if (a === 1){
            resultShape.push(b);
        }else if (b === 1) {
            resultShape.push(a);
        }else if (a !== b) {
            throw new Error(`Operation could not broadcast shapes: ${shapeA} and ${shapeB}`);
        }else {
            //they're both the same shape
            resultShape.push(a);
        }

    }
    
    return resultShape as Shape;
} 


//binary operation e.g add, subtract, multiply... Supports broadcasting
// const createBinaryOperation = (op: (aValue: number, bValue: number) => number) => {
//     return (shapeA: [number, number], shapeB: [number, number], aValues: number[][], bValues: number[][]) => {
//         const newShape = assertAndGetBroadcastShape(shapeA, shapeB);

//         const result = create2dArray(newShape);

//         const aStrideMask = getStrideMask(shapeA, newShape)
//         const bStrideMask = getStrideMask(shapeB, newShape)

//         for (let i=0; i < newShape[0]; i++) {
//             for (let j=0; j < newShape[1]; j++) {
//                 const aValue = aValues[i * aStrideMask[0]][j * aStrideMask[1]];
//                 const bValue = bValues[i * bStrideMask[0]][j * bStrideMask[1]];
//                 result[i][j] = op(aValue, bValue);
//             }
//         }

//         return result;
//     }
// }

export type BinaryOperation = (a: Matrix | number, b: Matrix | number) => Matrix;

export const createBinaryOperation = (op: (aValue: number, bValue: number) => number): BinaryOperation => {
        return (a: Matrix | number, b: Matrix | number) => {
       
            if (typeof a === "number") a = new Matrix([[a]]);
            if (typeof b === "number") b = new Matrix([[b]]);

            const newShape = assertAndGetBroadcastShape(a.shape, b.shape);
    
            const result = create2dArray(newShape);
    
            const aStrideMask = getStrideMask(a.shape, newShape)
            const bStrideMask = getStrideMask(b.shape, newShape)
    
            for (let i=0; i < newShape[0]; i++) {
                for (let j=0; j < newShape[1]; j++) {
                    const aValue = a.values[i * aStrideMask[0]][j * aStrideMask[1]];
                    const bValue = b.values[i * bStrideMask[0]][j * bStrideMask[1]];
                    result[i][j] = op(aValue, bValue);
                }
            }
    
            return new Matrix(result);
        }
    }

    
export const add = createBinaryOperation((aValue, bValue) => aValue + bValue);

export const sub = createBinaryOperation((aValue, bValue) => aValue - bValue);

export const mul = createBinaryOperation((aValue, bValue) => aValue * bValue);

export const div = createBinaryOperation((aValue, bValue) => aValue / bValue);

export const pow = createBinaryOperation((aValue, bValue) => aValue ** bValue);

