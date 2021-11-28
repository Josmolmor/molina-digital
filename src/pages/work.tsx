import { getAllProjects } from 'api/Prismic';
import Projects from 'containers/Projects';
import normalizeProject from 'context/Prismic/helpers/normalizeProject';
import type { NormalizedProject } from 'context/Prismic/types';
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

export async function getStaticProps({ previewData }: GetStaticPropsContext) {
  const allProjects = await getAllProjects(previewData);

  return {
    props: { allProjects },
  };
}

const WorkPage = ({
  allProjects,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { isFallback } = useRouter();
  const normalizedProjects: NormalizedProject[] = allProjects?.map(
    ({ node: project }) => normalizeProject(project),
  );

  return (
    <>
      <NextSeo
        title="Work"
        description="Check out some of the latests projects I've worked on."
      />
      {isFallback ? (
        <h1>Loading</h1>
      ) : (
        <Projects results={normalizedProjects} />
      )}
    </>
  );
};

export default WorkPage;
