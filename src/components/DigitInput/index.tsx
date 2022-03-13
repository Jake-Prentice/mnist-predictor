

import React, { useState } from 'react'
import DigitLibrary from '../DigitLibrary';
import DrawCanvas from '../DrawCanvas';
import { Container, SwitchButton, SwitcherContainer} from './style';


enum DigitInputTypeEnum {
    DRAW = "DRAW",
    LIBRARY = "LIBRARY"
}

const DigitInput = () => {

    const [digitInputType, setDigitInputType] = useState<DigitInputTypeEnum>(DigitInputTypeEnum.DRAW);

    return (
        <Container>
            <SwitcherContainer> 
                <SwitchButton 
                    isSelected={digitInputType === DigitInputTypeEnum.DRAW}
                    onClick={() => setDigitInputType(DigitInputTypeEnum.DRAW)}
                >Draw</SwitchButton>
                <SwitchButton 
                    isSelected={digitInputType === DigitInputTypeEnum.LIBRARY}
                    onClick={() => setDigitInputType(DigitInputTypeEnum.LIBRARY)}
                >Digit Library</SwitchButton>
            </SwitcherContainer>
            {digitInputType === DigitInputTypeEnum.DRAW && <DrawCanvas />} 
            {digitInputType === DigitInputTypeEnum.LIBRARY && <DigitLibrary />}
        </Container>
    )
}

export default DigitInput;
