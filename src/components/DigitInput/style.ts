import styled, { css } from "styled-components";
import Button from "../shared/Button";

export const Container = styled.div`
    width: 100%;
    height: 70%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    /* padding: 1rem 1.4rem 0.5rem 1.4rem; */
    /* border: 2px solid grey; */
    border-radius: 5px;
    box-shadow: 0 0 8px rgba(0,0,0,0.25);
    padding: 1rem;
`

export const SwitcherContainer = styled.div`
    display: flex;
    justify-content: center;
`

export const SwitchButton = styled(Button)<{isSelected: boolean}>`
    ${props => props.isSelected && css`
        border: 2px solid black;
        border-bottom: none;
    `}
`