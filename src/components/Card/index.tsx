import Badge from 'components/Badge';
import NextLink from 'next/link';
import { RichText } from 'prismic-reactjs-custom';
import type { FC } from 'react';
import { useState } from 'react';
import styledTag from 'utils/richTextFormatter';

import {
  ArrowContainer,
  ArrowRightIcon,
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
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const imagesSrcArray = imageGallery.map(({ image }) => image.url);

  function setNextImage(): void {
    const newValue = imageIndex + 1;
    if (newValue >= imagesSrcArray.length) {
      return setImageIndex(0);
    }
    setImageIndex(newValue);
  }

  return (
    <Container className={className} $borderColor={mainColor}>
      <ImageContent>
        <Image
          loading="lazy"
          src={imagesSrcArray[imageIndex] ?? ''}
          alt={imageGallery[0]?.image.alt ?? ''}
          style={{
            ...(imageGallery[0]?.image.url?.includes('alloy') && {
              borderRadius: '1rem',
            }),
          }}
        />
        {imagesSrcArray.length > 1 && (
          <ArrowContainer onClick={setNextImage}>
            <ArrowRightIcon $mainColor={mainColor} onClick={setNextImage} />
          </ArrowContainer>
        )}
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
                      key={title}
                      title={`${
                        title.charAt(0).toUpperCase() + title.slice(1)
                      }`}
                    />
                  ),
              )}
            </Tags>
          </TagsContainer>
        )}
      </Content>
    </Container>
  );
};

export default Card;
