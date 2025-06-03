import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <svg viewBox="25 25 50 50">
        <circle r={20} cy={50} cx={50} />
      </svg>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9d8c3;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  svg {
   width: 3.25em;
   transform-origin: center;
   animation: rotate4 2s linear infinite;
  }

  circle {
   fill: none;
   stroke: hsl(214, 97%, 59%);
   stroke-width: 2;
   stroke-dasharray: 1, 200;
   stroke-dashoffset: 0;
   stroke-linecap: round;
   animation: dash4 1.5s ease-in-out infinite;
  }

  @keyframes rotate4 {
   100% {
    transform: rotate(360deg);
   }
  }

  @keyframes dash4 {
   0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
   }

   50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35px;
   }

   100% {
    stroke-dashoffset: -125px;
   }
  }
`;

export default Loader; 