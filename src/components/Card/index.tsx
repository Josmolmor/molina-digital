import Badge from 'components/Badge';
import NextLink from 'next/link';
import { RichText } from 'prismic-reactjs-custom';
import type { FC } from 'react';
import styledTag from 'utils/richTextFormatter';

import {
  Container,
  Content,
  Description,
  GlobeIcon,
  Heading,
  Image,
  ImageContent,
  Role,
  Subheading,
  Tags,
  TagsContainer,
  Title,
  TopSide,
  Year,
} from './styles';
import type Props from './types';

const Card: FC<Props> = ({
  name,
  description,
  role,
  mainColor,
  techStack,
  websiteUrl,
  year,
  imageGallery,
  className,
}) => (
  <Container className={className} $borderColor={mainColor}>
    <ImageContent>
      <Image
        loading="lazy"
        src={imageGallery[0]?.image.url}
        alt={imageGallery[0]?.image.alt ?? ''}
        style={{
          ...(imageGallery[0]?.image.url?.includes('alloy') && {
            borderRadius: '1rem',
          }),
        }}
      />
    </ImageContent>
    <Content>
      <TopSide>
        <Heading>
          <Title>{name}</Title>
          {!!websiteUrl && websiteUrl.url && (
            <NextLink href={websiteUrl.url} passHref>
              <a target="_blank">
                <GlobeIcon size={16} />
              </a>
            </NextLink>
          )}
        </Heading>
        <Subheading>
          <Year>{year}</Year>
          <Role>&nbsp;·&nbsp;{role}</Role>
        </Subheading>
        <RichText
          richText={description}
          {...styledTag(description, Description)}
        />
      </TopSide>
      {techStack.length > 0 && (
        <TagsContainer>
          <Tags>
            {techStack.map(
              ({ title }) =>
                !!title && (
                  <Badge
                    color={mainColor}
                    key={title}
                    title={`${title.charAt(0).toUpperCase() + title.slice(1)}`}
                  />
                ),
            )}
          </Tags>
        </TagsContainer>
      )}
    </Content>
  </Container>
);

export default Card;
