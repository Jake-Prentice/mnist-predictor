import React, { useState } from 'react'
import WeightVisualizaton from 'components/WeightVisualization'
import {Container} from "./style";
import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';
import { Margin } from 'components/shared/spacing';
import Neuron from 'components/Neuron';
import { useMnist } from 'contexts/MnistContext';
import Layer from 'components/Layer';
import styled from 'styled-components';

const LayerContainer = styled.div`
    display: flex;
    gap: 5rem;
`
const RightPanel = () => {
    
    const {model} = useMnist();
    const [selectedLayer, setSelectedLayer] = useState<number>(1);

    if (!model) return <div>loading...</div>
    
    
    return (
        <Container>
            <Xwrapper>
                <LayerContainer>
                    {model.layers.map((layer, index) => 
                        <Layer 
                            numOfNodes={layer.numOfNodes}
                            isSelected={index === selectedLayer}
                            onClick={() => setSelectedLayer(index)}
                            index={index}
                            prevNumOfNodes={model.layers?.[index - 1]?.numOfNodes || null}
                        />    
                    )}
                </LayerContainer>
            </Xwrapper>
            <WeightVisualizaton />
        </Container>
    )
}

export default RightPanel
