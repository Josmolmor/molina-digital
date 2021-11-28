import { CheckCircle, Loader } from 'react-feather';
import styled, { css } from 'styled-components';
import { commonButtonCss } from 'styles/mixins';
import { from } from 'styles/responsive';
import addAlpha from 'utils/addAlpha';

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.fontColor};
  border-radius: 1rem;
  color: ${({ theme }) => theme.colors.background};
  display: flex;
  justify-content: center;
  margin: auto;
  max-width: 40rem;
  padding: 2rem 1rem;
  position: relative;

  ${from.mobile} {
    padding: 2rem;
  }

  ${from.tablet} {
    padding: 3rem;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

export const Header = styled.h1`
  margin: 0 0 0.5rem;
`;

export const Subtitle = styled.span`
  display: block;
  font-size: 1rem;
  font-weight: normal;
`;

export const Label = styled.label`
  display: flex;
  flex-direction: column;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;

  ${from.tablet} {
    margin-top: 1rem;
  }
`;

export const Button = styled.button`
  ${commonButtonCss};
  background-color: ${({ theme }) => theme.colors.fontColor};
  border: 2px solid ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.background};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.fontColor};
  }
`;

const commonInputCss = css`
  border: 1px solid ${({ theme }) => theme.colors.background};
  border-radius: 0.25rem;
  padding: 1rem;
  transition: border 0.25s ease;
  &:hover {
    border: 1px solid ${({ theme }) => addAlpha(theme.colors.background, 0.25)};
  }
`;

export const Input = styled.input`
  ${commonInputCss};
  margin-top: 0.25rem;
`;

export const TextArea = styled.textarea`
  ${commonInputCss};
  max-width: 34rem;
`;

export const SayHiImage = styled.img`
  display: none;
  position: fixed;
  left: 0;
  bottom: -5rem;
  height: 25rem;
  width: 25rem;
  ${from.tablet} {
    display: block;
  }
`;

export const TouchImage = styled.img`
  display: none;
  position: fixed;
  right: 3rem;
  top: 10rem;
  height: 20rem;
  width: 20rem;
  animation: floatDesktop 4s ease-in-out infinite;
  ${from.desktop} {
    display: block;
  }
`;

export const LoaderIcon = styled(Loader)`
  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    0% {
      transform: rotate(-360deg);
    }
  }

  animation: rotate 3s forwards infinite;
  color: ${({ theme }) => theme.colors.background};
  height: 10rem;
  margin: auto;
  width: 10rem;
`;

export const ErrorMessage = styled.p`
  color: tomato;
  margin: 0;
  word-break: break-word;
`;

export const SuccessContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const CheckCircleIcon = styled(CheckCircle)`
  color: springgreen;
  height: 10rem;
  width: 10rem;
`;

export const SuccessTitle = styled.h2`
  margin: 1rem 0 0 0;
  text-align: center;
`;
