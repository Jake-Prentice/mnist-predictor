import styled from "styled-components";
import Button from "../shared/Button";

export const StyledSettings = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`

export const Container = styled.div`
    width: 40%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    box-shadow: 0 0 8px rgba(0,0,0,0.25);
    padding: 0.7rem;
`

export const TrainButton = styled(Button)`
    align-self: center;
    width: 95%;
    border-radius: 5px;
`
