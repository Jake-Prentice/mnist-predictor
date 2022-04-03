import {
    IKernelFunctionThis,
} from 'gpu.js';
import { makeKernel } from 'lib/kernel';

function _dotKernel(this: IKernelFunctionThis, a: number[][], b: number[][], aCols: number) { 
    let sum = 0;
    for (let k = 0; k < aCols; k++) {
      sum += a[this.thread.y][k] * b[k][this.thread.x];
    }
    return sum;
}

export const dotKernel = makeKernel(_dotKernel, {
    dynamicOutput: true
})


