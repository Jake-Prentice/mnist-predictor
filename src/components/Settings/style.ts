import styled from "styled-components";
import Button from "../shared/Button";

export const StyledSettings = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #F4F2F2;
    border-radius: inherit;
    transition: height 0.3s ease;
    overflow-y: auto;
    position: relative;
`

export const SlidersWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80%;
    /* border: 1px solid black; */
    padding-top: 10%;
    height: 100%;

    > * {
        margin: 1rem 0;
    }
`
export const SettingLabel = styled.h6`
    margin-bottom: 0.3rem;
`

export const SettingWrapper = styled.div`
    width: 100%;
    display: flex;
    background: #e9e9e9;
    flex-direction: column;
    padding: 0.5rem 1rem;
    border-radius: 5px;
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