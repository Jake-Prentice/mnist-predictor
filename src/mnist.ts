import Matrix from "lib/matrix";
import { shuffleArray } from "./utils";

export const getMiniBatches = (size: number, dataSet: number[][]): [number[][][], number[][][]] => {

    let shuffled = JSON.parse(JSON.stringify(dataSet));
    shuffleArray(shuffled);
    console.log({shuffled})

    const inputBatches: number[][][] = [];

    for (let i=0; i <= (shuffled.length - 1 )/ size; i++) {
        inputBatches.push(shuffled.slice(i * size, (i+1)*size))
    }

    
    const outputBatches = inputBatches.map(batch => batch.map(digit => {
        const label = digit.shift() 
        return Array.from({length: 10}, (_, index) => index === label ? 1 : 0) 
    })); 

    return [inputBatches, outputBatches];
}

export const getData = (dataSet: number[][]): [number[][], number[][]] => {
   const y = dataSet.map(sample => {
       const label = sample[0]
       return Array.from({length: 10}, (_, index) => index === label ? 1 : 0) 
   })

   const x = dataSet.map(sample => {
       return sample.slice(1);
   })

   return [x,y];

}


