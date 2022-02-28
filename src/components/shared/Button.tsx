import React from "react";
import styled, { css } from "styled-components";

const Button = styled.button<{isDisabled?: boolean}>`
    border: none;
    outline: none;
    padding: 0.5rem 1.2rem;
    cursor: pointer;
    transition: opacity 0.3s ease;
    
    :hover {
        filter: brightness(0.9);
    }
`

export default Button
