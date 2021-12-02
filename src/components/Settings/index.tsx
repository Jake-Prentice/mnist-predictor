import React from 'react'
import { TrainingStatus } from '../App';
import Button from '../shared/Button';
import { Container, StyledSettings, TrainButton } from './style';

interface IProps {
    setTrainingStatus: React.Dispatch<React.SetStateAction<TrainingStatus>>;
}

const Settings = ({setTrainingStatus}: IProps) => {
    return (
        <Container>
            <StyledSettings>

            </StyledSettings> 
            <TrainButton onClick={() => setTrainingStatus(TrainingStatus.LOADING)}>Train</TrainButton>
        </Container>
    )
}

export default Settings;