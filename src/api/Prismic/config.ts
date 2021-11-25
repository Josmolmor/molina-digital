import Prismic from '@prismicio/client';

export const API_ENDPOINT = process.env.NEXT_PUBLIC_PRISMIC_API_ENDPOINT ?? '';
export const API_GRAPHQL = process.env.NEXT_PUBLIC_PRISMIC_GRAPHQL;
export const API_TOKEN = process.env.NEXT_PUBLIC_PRISMIC_API_ACCESS_TOKEN;
export const API_LOCALE = process.env.NEXT_PUBLIC_PRISMIC_REPOSITORY_LOCALE;

export const PrismicClient = Prismic.client(API_ENDPOINT, {
  accessToken: API_TOKEN,
});
