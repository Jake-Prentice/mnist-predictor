import React, { useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import styled from "styled-components";
import { useMnist } from 'contexts/MnistContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  
const GraphContainer = styled.div`
    width: 600px;
    margin: 1.5rem;

`
const Graph = () => {
    const {trainingStepData} = useMnist();
    return (
        <GraphContainer>
        <Scatter
            datasetIdKey='id'
            data={{
                datasets: [{
                    label: 'Loss',
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    data: trainingStepData.losses,
                }]
            }}
            options={{
                showLine: true
            }}
        />
        </GraphContainer>
    )
}

export default Graph;