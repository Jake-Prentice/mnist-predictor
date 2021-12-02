import React, { useContext, useEffect, useState } from 'react'
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

export function MnistProvider({children}: React.PropsWithChildren<IProps>) {
        
    const [trainData, setTrainData] = useState<number[][]>([]);
    const [testData, setTestData] = useState<number[][]>([]);


    useEffect(() => {
        Papa.parse<any>("./data/mnist_train.csv", {
            download: true,
            delimiter: ",",
            dynamicTyping: true,
            complete: (results: Papa.ParseResult<number[]>, file) => {
                setTrainData(results.data.slice(1));
            } 
        })

        Papa.parse<any>("./data/mnist_test.csv", {
            download: true,
            delimiter: ",",
            dynamicTyping: true,
            complete: (results: Papa.ParseResult<number[]>, file) => {
                setTestData(results.data.slice(1)); 
            } 
        })
    }, [])

    useEffect(() => {
        console.log(testData)
    }, [testData])
    useEffect(() => {
        console.log("bere", {trainData})
    }, [trainData])

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
