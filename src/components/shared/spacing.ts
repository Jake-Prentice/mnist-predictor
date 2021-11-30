import styled, {css} from "styled-components";

interface MarginProps { 
    auto?: boolean | null;
    all?: string | null;
    top?: string | null;
    bottom?: string | null;
    right?: string | null;
    left?: string | null;
};


export const Margin = styled.div<MarginProps>`${props => css`
    margin: ${props.auto ? "auto" : null};
    margin: ${props.all ? props.all : null};
    margin-top: ${props.top ? props.top : null};
    margin-bottom: ${props.bottom ? props.bottom : null};
    margin-right: ${props.right ? props.right: null};
    margin-left: ${props.left ? props.left : null};
`}`

