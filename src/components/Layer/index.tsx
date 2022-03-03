import Neuron from 'components/Neuron';
import React, { useState } from 'react'
import styled, { css } from 'styled-components';
import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';

interface IProps {
    numOfNodes: number;
    prevNumOfNodes: number | null;
    isSelected?: boolean;
    onClick?: () => void;
    index: number;
}

const Container = styled.div<{isSelected: boolean}>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    gap: 1.5rem;
    ${props => props.isSelected && css`
        border: 2px solid blue;
    `}
    padding: 1rem;

`

const EtceteraDot = styled.div`
    border-radius: 50%;
    background: grey;
    width: 5px;
    height: 5px;
`

const EtceteraContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
`


const Etcetera = ({id}: {id: string}) => {
    return (
        <EtceteraContainer id={id}>
            <EtceteraDot />
            <EtceteraDot />
            <EtceteraDot />
        </EtceteraContainer>
    )
}

const LayerSettingsContainer = styled.div`
    position: absolute;
    width: 300px;
    height: 200px;
    border: 2px solid grey;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 105%);  
    box-shadow: 0 0 10px rgba(0,0,0,.5);
    border-radius: 15px;
    background: white;
`

const LayerSettings = () => {
    return (
        <LayerSettingsContainer />
    )
}

const Layer = ({
    numOfNodes, 
    isSelected=false,
    onClick,
    index,
    prevNumOfNodes
}: IProps) => {

    
    return (
        <Container
            onClick={onClick}
            isSelected = {isSelected}
        >
            <h4>{numOfNodes}</h4>
            {Array.from({length: numOfNodes > 10 ? 11: numOfNodes}, (_, i) => i).map((el, neuronIndex) => {
                const neuronId = `layer${index}neuron${neuronIndex}`
                if (neuronIndex === 5 && numOfNodes > 10) return <Etcetera id={neuronId} />
                return (
                <>
                    <Neuron id={neuronId} />
                    {prevNumOfNodes && Array.from({length: prevNumOfNodes > 10 ? 11 : prevNumOfNodes}, (_,i) => i).map((_, prevIndex) => {

                        if (prevIndex  && prevIndex !== 5) return (
                            <Xarrow 
                                curveness={0}
                                strokeWidth={1}
                                showHead={false} 
                                start={neuronId} 
                                end={`layer${index - 1}neuron${prevIndex}`} 
                            />
                        )

                    })}
                </>
                )
            })}
            {isSelected && <LayerSettings />}
        </Container>
    )
}

export default Layer; 