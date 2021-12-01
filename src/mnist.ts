import { shuffleArray } from "./utils";


export const getMiniBatches = (size: number, dataSet: number[][]): [number[][][], number[][][]] => {

    let shuffled = [...dataSet];
    shuffleArray(shuffled);

    console.log(shuffled)
    
    const inputBatches: number[][][] = [];

    for (let i=0; i < (shuffled.length - 1 )/ size; i++) {
        inputBatches.push(shuffled.slice(i * size, (i+1)*size))
    }

    console.log({inputBatches})
    
    const outputBatches = inputBatches.map(batch => batch.map(digit => {
        const label = digit.shift() 
        return Array.from({length: 10}, (_, index) => index === label ? 1 : 0) 
    })); 

    return [inputBatches, outputBatches];
}
