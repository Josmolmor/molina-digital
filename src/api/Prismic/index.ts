import { API_GRAPHQL, API_TOKEN, PrismicClient } from 'api/Prismic/config';
import type { Project, Result } from 'context/Prismic/types';
import type { PreviewData } from 'next';

async function fetchAPI(
  query: string,
  { previewData = {}, variables = undefined } = {},
) {
  const prismicAPI = await PrismicClient.getApi();
  const res = await fetch(
    `${API_GRAPHQL ?? ''}?query=${query}&variables=${JSON.stringify(
      variables,
    )}`,
    {
      headers: {
        'Prismic-Ref':
          (previewData as { ref: string })?.ref || prismicAPI.masterRef.ref,
        'Content-Type': 'application/json',
        Authorization: `Token ${API_TOKEN ?? ''}`,
      },
    },
  );

  if (res.status !== 200) {
    throw new Error('Failed to fetch API');
  }

  const json = (await res.json()) as { data: unknown; errors: unknown };
  if (json.errors) {
    throw new Error('Failed to fetch API');
  }
  return json.data;
}

export async function getAllProjects(
  previewData: PreviewData,
): Promise<Result<Project>> {
  const data = await fetchAPI(
    `
    query {
      allProjects(sortBy: year_DESC) {
        edges {
          node {
            _meta {
              uid
              id
              tags
              type
            }
            image_gallery {
              image
            }
            name
            role
            year
            description
            website_url {
              _linkType
            }
            tech_stack {
              title
            }
            main_color
          }
        }
      }
    }
  `,
    { previewData },
  );

  return (data as { allProjects: { edges: Result<Project> } }).allProjects
    .edges;
}
