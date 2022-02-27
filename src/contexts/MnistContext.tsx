import React, { useContext, useEffect, useState, useRef } from 'react'
import * as Papa from "papaparse";


const MnistContext = React.createContext<IValue>({
    trainData: [],
    testData: []
})

interface IProps {
    
}

interface IValue {
    trainData: number[][];
    testData: number[][]
}

export function useMnist() {
  return useContext(MnistContext)
}


const fetchMnistCsv = async (path: string, cb: (results: number[][]) => void) => {
    const file = await fetch(path)
    const blob = await file.blob();

    const results: number[][] = [];

    Papa.parse<any>(blob, {
        delimiter: ",",
        dynamicTyping: true,
        skipEmptyLines: true,
        worker: true,
        step: (stepResults) => {
            results.push(stepResults.data);
        },
        complete: () => cb(results)
    })
} 

export function MnistProvider({children}: React.PropsWithChildren<IProps>) {
        
    const [trainData, setTrainData] = useState<number[][]>([]);
    const [testData, setTestData] = useState<number[][]>([]);


    useEffect(() => {

        (async () => {
            //need to remove top line from csv file
            console.log("Loading csvs...")
            await fetchMnistCsv("./data/mnist_train.csv", (results) => setTrainData(results.slice(1)))
            await fetchMnistCsv("./data/mnist_test.csv", (results) => setTestData(results.slice(1)));
            console.log("finished loading csvs")
        })();

    }, [])


    const value = {
        trainData,
        testData,
    }

    return (
        <MnistContext.Provider value={value}>
            {children}
        </MnistContext.Provider>
    )
}
