import { Shape } from "./Matrix";

export const create2dArray = (shape: Shape) => {
    const arr = [];
    for (let row=0; row < shape[0]; row++) {
       arr.push(new Float32Array(shape[1]));
    }
    return arr as unknown as number[][];
}
