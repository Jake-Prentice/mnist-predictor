import { Margin } from 'components/shared/spacing';
import { ITrainingStepData, useMnist } from 'contexts/MnistContext';
import { IOnTrainingStepArgs } from 'lib';
import React, { useEffect } from 'react'
import styled from 'styled-components';
import Button from '../shared/Button';
import { Container, StyledSettings, TrainButton } from './style';
import Slider from "@mui/material/Slider"

const LoaderWrapper = styled.div`
    width: 90%;
    height: 3%;
    align-self: self-end;
    background: #C4C4C4;
    border-radius: 10px;
    margin-bottom: 1rem; 
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
        isTraining, 
        trainingStepData,
        epochs,
        isTrainDataLoading
    } = useMnist();

    return (
        <Container>
            <StyledSettings>
                {/* <Slider aria-label="Volume" /> */}
                {isTraining && (
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