import Prismic from '@prismicio/client';
import { PrismicClient } from 'api/Prismic/config';
import Home from 'containers/Home';
import type {
  GetStaticProps,
  GetStaticPropsContext,
  InferGetServerSidePropsType,
} from 'next';

export const getStaticProps: GetStaticProps =
  async ({}: GetStaticPropsContext) => {
    const prismicResults = await PrismicClient.query(
      Prismic.predicates.at('document.type', 'project'),
      { orderings: '[my.project.year desc, document.first_publication_date]' },
    );
    return {
      props: {
        prismicResults,
      },
      revalidate: 60,
    };
  };

const HomePage = ({
  prismicResults,
}: InferGetServerSidePropsType<typeof getStaticProps>) => (
  <Home results={prismicResults} />
);

export default HomePage;
