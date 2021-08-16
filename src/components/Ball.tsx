import styled from 'styled-components';

const StyledBall = styled.div`
    @keyframes in {
        0% {
            transform: translate(-50%, -100vh) scale(1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
        }
    }
    @keyframes out {
        0% {
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            transform: translate(-50%, -50%) scale(0);
        }
    }

    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Nova Mono', monospace;
    font-size: 40px;
    position: absolute;
    width: 128px;
    height: 128px;
    background-color: #cd4fd1;
    background-image: linear-gradient(to bottom, #fff4, #fff0),
        url('/res/ballground.svg');
    box-shadow: 0 0 32px #0008;
    top: 50%;
    left: 50%;
    z-index: 99;
    border-radius: 128px;
    animation: in 0.5s cubic-bezier(0.5, 1.5, 0.5, 1),
        out 1s cubic-bezier(0.5, -0.5, 1, 0.5) 2s;
    animation-fill-mode: forwards;
    text-decoration: underline;
`;
export default StyledBall;
