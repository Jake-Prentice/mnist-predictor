import styled from "styled-components";
import Button from "../shared/Button";

export const StyledSettings = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #F4F2F2;
    border-radius: inherit;
    transition: height 0.3s ease;
`

export const Container = styled.div`
    width: 40%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    box-shadow: 0 0 8px rgba(0,0,0,0.25);
    padding: 0.7rem;
    gap: 1rem;
`

export const TrainButton = styled(Button)`
    align-self: center;
    width: 95%;
    border-radius: 5px;
    background: #A3EEFF;
`

export const TrainButtonContainer = styled.div`
    width: 95%;
    align-self: center;
`