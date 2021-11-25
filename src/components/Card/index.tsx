import Badge from 'components/Badge';
import NextLink from 'next/link';
import { RichText } from 'prismic-reactjs-custom';
import type { FC } from 'react';
import { Globe } from 'react-feather';
import styledTag from 'utils/richTextFormatter';

import {
  Container,
  Description,
  Heading,
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
  className,
}) => (
  <Container className={className} borderColor={mainColor}>
    <TopSide>
      <Heading>
        <Title>{name}</Title>
        {!!websiteUrl && websiteUrl.url && (
          <NextLink href={websiteUrl.url} passHref>
            <a target="_blank">
              <Globe color="white" size={16} />
            </a>
          </NextLink>
        )}
      </Heading>
      <Subheading>
        <Year>{year}</Year>&nbsp;·&nbsp;<Role>{role}</Role>
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
                  title={`${title.charAt(0).toUpperCase() + title.slice(1)}`}
                />
              ),
          )}
          {/*<NextLink passHref href={`/projects/${name}`}>
            <LearnMoreButton>
              Read more <ArrowRight size={16} />
            </LearnMoreButton>
          </NextLink>*/}
        </Tags>
      </TagsContainer>
    )}
  </Container>
);

export default Card;
