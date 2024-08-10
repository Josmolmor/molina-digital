import styled from 'styled-components';

const FullScreenIframe = styled.iframe`
  height: 100%;
  width: 100%;
  border: none;
`;

const Quizling = () => <FullScreenIframe src="https://quizling.vercel.app/" />;

export default Quizling;
