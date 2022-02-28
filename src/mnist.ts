import { shuffleArray } from "./utils";

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


