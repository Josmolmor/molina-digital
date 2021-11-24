import config from 'config/seo.json';
import { DefaultSeo } from 'next-seo';

const Head = () => (
  <>
    <DefaultSeo {...config} />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=no"
    />
    <link rel="manifest" href="/manifest.json" />
    <link rel="shortcut icon" href="/favicon.ico" />
  </>
);

export default Head;
