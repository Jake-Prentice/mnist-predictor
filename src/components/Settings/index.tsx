import { Margin } from 'components/shared/spacing';
import { ITrainingStepData, useMnist } from 'contexts/MnistContext';
import React, { useEffect } from 'react'
import styled from 'styled-components';
import Button from '../shared/Button';
import { 
    Container, 
    SettingLabel, 
    SlidersWrapper, 
    SettingWrapper, 
    StyledSettings, 
    TrainButton 
} from './style';
import Slider from "@mui/material/Slider";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import { MenuItem } from '@mui/material';
import { activations, initializers, layers, losses, Model, optimisers } from 'lib/NeuralNet';
import { matrix } from 'lib/Matrix';

const LoaderWrapper = styled.div`
    width: 90%;
    height: 12px;
    background: #C4C4C4;
    border-radius: 10px;
    margin-bottom: 1rem; 
    margin-top: auto;
    position: absolute;
    bottom: 0;
`

const StatsContainer = styled.div`
    position: absolute;
    transform: translate(.5rem, -115%);
    background: #f6f6f6;
    border: 3px solid #1976d2;
    padding: 0.8rem 1.5rem 0.8rem 0.6rem;
    border-radius: 10px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
`

interface ILoaderProps {
    currentEpoch: number;
    totalEpochs: number;
    progress: number;
}

const Progress = styled.div<{progress: number}>`
    height: 100%;
    width: ${props => props.progress}%;
    background: #85FF66;
    border-radius: inherit;
    transition: width: 0.3s ease;
`

const Loader = ({
    currentEpoch, 
    totalEpochs, 
    progress
}: ILoaderProps) => {
    return (
        <>
        <LoaderWrapper>
            <StatsContainer>
                <h5>training: {progress}%</h5>
                <Margin bottom={"3px"} />
                <h5>epoch: {currentEpoch} / {totalEpochs}</h5>
            </StatsContainer>
            <Progress progress={progress}/>
        </LoaderWrapper>
        </>
    )
}

const Settings = () => {
    const {
        trainModel,  
        trainingStepData,
        epochs,
        setEpochs,
        batchSize,
        setBatchSize,
        isTrainDataLoading,
        isTraining,
        learningRate,
        setLearningRate,
        optimiser,
        setOptimiser,
        lossFunc,
        setLossFunc
    } = useMnist();


   

    }, [])

    return (
        <Container>
            <StyledSettings>
                <SlidersWrapper>
                    <SettingWrapper>
                        <SettingLabel>Epochs</SettingLabel>
                        <Slider 
                            onChange={(_, value) => setEpochs(value as number)} 
                            size={"small"} 
                            value={epochs} 
                            sx={{width: "100%"}}
                            aria-label="sopch"
                            min={0}
                            max={10}
                            valueLabelDisplay={"auto"}
                        >
                        </Slider>
                    </SettingWrapper>
                    <SettingWrapper>
                        <SettingLabel>Learning rate</SettingLabel>
                        <Slider 
                            onChange={(_ ,value) => setLearningRate(value as number)}
                            value={learningRate}
                            sx={{width: "100%"}}
                            size={"small"}
                            step={0.01}
                            min={0.01}
                            max={1}
                            valueLabelDisplay={"auto"}
                        />
                    </SettingWrapper>
                    <SettingWrapper>
                        <SettingLabel>Batch size</SettingLabel>
                        <Slider 
                            sx={{width: "100%"}}
                            onChange={(e, value) => setBatchSize(value as number)}
                            value={batchSize}
                            size={"small"}
                            min={1}
                            max={128} 
                            step={15}
                            valueLabelDisplay={"auto"}
                        />
                    </SettingWrapper>
                    <SettingWrapper>
                        <SettingLabel>Loss function</SettingLabel>    
                        <Select 
                            style={{background: "white"}}
                            value={lossFunc}
                            onChange={(event: SelectChangeEvent) => setLossFunc(event.target.value as string)}
                            size='small' 
                        >
                            <MenuItem value={"sse"}>SSE</MenuItem>
                            <MenuItem value={"categoricalcrossentropy"}>Categorical Crossentropy</MenuItem>
                        </Select>
                    </SettingWrapper>
                    <SettingWrapper>
                        <SettingLabel>Optimiser</SettingLabel>
                        <Select
                            style={{background: "white"}}
                            value={optimiser}
                            size="small"
                            disabled={isTraining}
                            onChange={(event: SelectChangeEvent) => setOptimiser(event.target.value as string)}
                        >
                            <MenuItem value={"sgd"}>SGD </MenuItem>
                        </Select>
                    </SettingWrapper>
                </SlidersWrapper>
                {isTraining && (
                    <Loader 
                        progress={trainingStepData.progress}
                        totalEpochs={epochs}
                        currentEpoch={trainingStepData.currentEpoch}
                    />
                )}
            </StyledSettings> 
            <TrainButton 
                disabled={isTrainDataLoading || isTraining} 
                onClick={trainModel}
            >
                Train
            </TrainButton>
        </Container>
    )
}

export default Settings;

useEffect(() => {

    const model = new Model();

    model.addLayer(new layers.Input({
        numOfNodes: 2
    }))

    model.addLayer(new layers.Dense({
        numOfNodes: 2,
        activation: "sigmoid",
        kernelInitializer: new initializers.Constant(0.5)
    }))
    
    const inputs = matrix([[1],
                           [2]])
    
    const output = model.forward(inputs)


}, [])

useEffect(() => {

    // const input = matrix([[1,2],
    //                       [3,4]])

    const dense = new layers.Dense({
        numOfNodes: 2,
        activation: "sigmoid",
        biasInitializer: new initializers.Constant(0.5),
        kernelInitializer: new initializers.RandomUniform(-1,1),
        useBias: true
    })

    const input = new layers.Input({
        numOfNodes: 2
    })

    const optimiser = new optimisers.SGD({
        learningRate: 0.1
    })

    const config = optimiser.getConfig();

    const model = new Model();

    model.setOptimiser(optimiser);
    model.setLoss("sse");

    model.addLayer(input)
    model.addLayer(dense)


    const topology = model.getModelTopology();
    
    // const model2 = new Model();

    // model2.loadModelTopology(topology);

    // console.log("here", base64StringToArrayBuffer("7Qm8vhF9Gz/etV0/455jvw=="))
    // const weightData = model.getEncodedWeightsAndConfig();
    // console.log(weightData)
    // model.loadEncodedWeights(weightData);

    // console.log("output", output);

},[])

useEffect(() => {
    const sigmoid = new activations.Sigmoid();
    const ReLU = new activations.ReLU();
    const softMax = new activations.SoftMax();

    // for activation.forward
    const input = matrix([[0.1, -0.5],
                          [0.7, 0.3]])
    
    // for activation.backward
    const passBackError = matrix([[1,2],
                                  [3,4]])
;
    // console.log(softMax.backward(passBackError))
    // console.log(input.getColumn(0));
    // console.log(     ReLU.forward(input)            )

    // console.log(     ReLU.backward(passBackError)       ) 
},[])

useEffect(() => {
    let outputs = matrix([[0.7, 0.1, 0.2],
                            [0.1, 0.5, 0.4],
                            [0.02, 0.9, 0.08]])

    outputs = outputs.transpose();

    const classTargets = matrix([[1,0,0],
                                 [0,1,1],
                                 [0,0,0]])

    const passBackError = matrix([[1,2],
                                  [3,4]])

    const softMax = new activations.SoftMax();
    softMax.output = outputs;

    const loss = new losses.CategoricalCrossentropy();

    const dLoss = loss.backward(classTargets, outputs)
    
    // console.log({"softmax-backward": softMax.backward(dLoss)});

}, [])

//Matrix testing
useEffect(() => {

    // const matrix1 = matrix([])

    
}, [])

//neural net testing
useEffect(() => {

    const model = new Model();

    model.setOptimiser("sgd");
    model.setLoss("sse");

    model.addLayer(new layers.Input({
        numOfNodes: 2
    }))

    model.addLayer(new layers.Dense({
        numOfNodes: 2,
        activation: "sigmoid",
        kernelInitializer: new initializers.Constant(0.5)
    }))

    model.train({
        epochs: 5,
        x: [[1,2], [3,4]],
        y: [[5,6], [7,8]]
    })

}, [])


useEffect(() => {

    const matrix1 = matrix([[1,2],
                            [3,4]]);
    
    const matrix2 = matrix([[5,6], [7,8]]);
    
    const result1 = matrix1.div(matrix2)
    const result2 = matrix2.div(matrix1)

    // console.log(result1, result2)

    const config = new initializers.RandomUniform().getConfig();

    
    console.log(config);
    

