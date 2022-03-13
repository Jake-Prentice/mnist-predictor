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
                disabled={isTrainDataLoading} 
                onClick={trainModel}
            >
                Train
            </TrainButton>
        </Container>
    )
}

export default Settings;