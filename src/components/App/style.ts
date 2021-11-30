import styled, {createGlobalStyle} from "styled-components";

export const Container = styled.div`
    width: 600px;
    height: 600px;
    /* border: 1px solid black; */
    display: flex;
    gap: 1rem;
    margin: 1.5rem;
`

export const OutputContainer = styled.div`
    width: 300px;
    height: 300px;
    border: 1px solid blue;
`


export const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    } 
    html {
        font-size: 16px;
    }
    body {
        font-family: sans-serif;
    }
    body, html, #root {
        height: 100%;    
        width: 100%;
    }
    
` 