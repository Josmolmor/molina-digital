import Contact from 'containers/Contact';
import type { NextPage } from 'next';
import { NextSeo } from 'next-seo';

const ContactPage: NextPage = () => (
  <>
    <NextSeo title="Contact" description="Let's talk." />
    <Contact />
  </>
);

export default ContactPage;
