import { css } from '@emotion/react';
import React from 'react'
import styled from 'styled-components';

const Container = styled.div<{size: number}>`
    width: ${props => props.size + "px"};
    height: ${props => props.size + "px"};
    border-radius: 50%;
    background: rgb(255, 99, 132);
`

interface IProps {
    size?: number;
    id: string;
} 


const Neuron = ({
    id, 
    size=25,
}: IProps) => {

    return (
        <Container 
            id={id} 
            size={size}
        />
    )
}

export default Neuron;

/* 
    <Neuron id={} etcetera={true}/>

*/