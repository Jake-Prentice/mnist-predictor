import { Margin } from 'components/shared/spacing';
import { ITrainingStepData, useMnist } from 'contexts/MnistContext';
import { IOnTrainingStepArgs } from 'lib';
import React, { useEffect } from 'react'
import styled from 'styled-components';
import Button from '../shared/Button';
import { Container, SliderWrapper, StyledSettings, TrainButton } from './style';
import Slider from "@mui/material/Slider"

const LoaderWrapper = styled.div`
    width: 90%;
    height: 3%;
    display: inline-block;
    background: #C4C4C4;
    border-radius: 10px;
    margin-bottom: 1rem; 
    margin-top: auto;
`

const StatsContainer = styled.div`
    position: absolute;
    transform: translate(.5rem, -115%);
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
        isTrainDataLoading
    } = useMnist();

    const onEpochChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    }

    return (
        <Container>
            <StyledSettings>
                <SliderWrapper>
                    Epochs
                    <Slider 
                        onChange={(w, value) => setEpochs(value as number)} 
                        size={"small"} 
                        value={epochs} 
                        sx={{width: "75%"}}
                        min={0}
                        max={10}
                        marks={true}
                        valueLabelDisplay={"auto"}
                    />
                    learning rate
                    <Slider 
                        sx={{width: "75%"}}
                        size={"small"}
                    />
                    batch size
                    <Slider 
                        sx={{width: "75%"}}
                        size={"small"}
                        step={null}
                        marks={[{value: 1, label: "1"}, {value: 16, label: "16"}, {value: 32, label: "32"}, {value: 60000, label: "60k"}]}
                        valueLabelDisplay={"auto"}

                    />
                </SliderWrapper>
                {true && (
                    <Loader 
                        progress={trainingStepData.progress}
                        totalEpochs={epochs}
                        currentEpoch={trainingStepData.currentEpoch}
                    />
                )}
            </StyledSettings> 
            <TrainButton disabled={isTrainDataLoading} onClick={trainModel}>Train</TrainButton>
        </Container>
    )
}

export default Settings;