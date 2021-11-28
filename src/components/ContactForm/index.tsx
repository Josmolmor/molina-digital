import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Mail } from 'react-feather';

import useAcceptCookies from '../../hooks/useAcceptCookies';
import {
  Button,
  ButtonContainer,
  CheckCircleIcon,
  Container,
  ErrorMessage,
  Form,
  Header,
  Input,
  Label,
  LoaderIcon,
  SayHiImage,
  Subtitle,
  SuccessContent,
  SuccessTitle,
  TextArea,
  TouchImage,
} from './styles';

const ContactForm: FC = () => {
  const { acceptedCookies, onAcceptCookies } = useAcceptCookies();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (acceptedCookies) {
      return setErrorMessage(
        "You've already sent an email recently, use a different method or wait and try again tomorrow (nobody wants my inbox overloaded!)",
      );
    }
    setLoading(true);
    const res = await fetch('/api/sendgrid', {
      body: JSON.stringify({
        email: email,
        fullName: fullName,
        subject: subject,
        message: message,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { error } = await res.json();
    if (error) {
      setErrorMessage(error as string);
      return setLoading(false);
    }

    setSuccess(true);
    setFullName('');
    setEmail('');
    setSubject('');
    setMessage('');
    onAcceptCookies();
    return setLoading(false);
  };

  return (
    <Container>
      <SayHiImage
        src="/static/images/say-hi.svg"
        alt="Illustration of a robot saying hi"
        loading="lazy"
      />
      <TouchImage
        src="/static/images/touch.svg"
        alt="Get in touch"
        loading="lazy"
      />
      {loading ? (
        <LoaderIcon />
      ) : success ? (
        <SuccessContent>
          <CheckCircleIcon />
          <SuccessTitle>Mail sent!</SuccessTitle>I&apos;ll reply back as soon as
          possible
        </SuccessContent>
      ) : (
        <Form onSubmit={(e) => handleSubmit(e)}>
          <Header>
            Get in touch
            <Subtitle>
              Want to get in touch? Fill the form below to do so.
            </Subtitle>
          </Header>

          <Label htmlFor="fullName">
            Full name *
            <Input
              id="fullName"
              type="text"
              name="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
              }}
              required
            />
          </Label>

          <Label htmlFor="email">
            E-mail *
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
            />
          </Label>

          <Label htmlFor="subject">
            Subject *
            <Input
              id="subject"
              type="text"
              name="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
              }}
              required
            />
          </Label>

          <Label htmlFor="message">
            Message *
            <TextArea
              id="message"
              name="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              required
            />
          </Label>

          <ErrorMessage>{errorMessage}</ErrorMessage>
          <ButtonContainer>
            <Button type="submit">
              Submit
              <Mail />
            </Button>
          </ButtonContainer>
        </Form>
      )}
    </Container>
  );
};

export default ContactForm;
