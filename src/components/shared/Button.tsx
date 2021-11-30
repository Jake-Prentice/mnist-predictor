import React from "react";
import styled from "styled-components";

const Button = styled.button`
    border: none;
    outline: none;
    padding: 0.5rem 1.2rem;
    cursor: pointer;

    :hover {
        filter: brightness(1.1);
    }
`

export default Button