import {
    IKernelFunctionThis,
} from 'gpu.js';
import { makeKernel } from 'lib/kernel';
import Matrix from "./index";


function _dotKernel(this: IKernelFunctionThis, a: number[][], b: number[][], aCols: number) { 
    let sum = 0;
    for (let i = 0; i < aCols; i++) {
      sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
}

export const dotKernel = makeKernel(_dotKernel, {
    dynamicOutput: true
})


