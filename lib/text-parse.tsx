import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ParseTextOptions {
  parseHtml?: boolean; // Whether to parse HTML tags like <strong>, <br/>, etc.
  linkClassName?: string; // Custom CSS classes for links
}

/**
 * Parses text content and converts URLs to clickable links.
 * Optionally handles HTML tags like <strong>, <br/>, <a> tags.
 *
 * @param text - The text content to parse
 * @param options - Configuration options for parsing
 * @returns Array of JSX elements representing the parsed content
 */
export function parseTextWithLinks(
  text: string,
  options: ParseTextOptions = {},
): (React.ReactElement | string)[] {
  const {
    parseHtml = false,
    linkClassName = 'text-primary font-semibold hover:underline',
  } = options;

  if (parseHtml) {
    // Handle complex HTML parsing (for timeline descriptions)
    const paragraphs = text.split('<br/><br/>');

    return paragraphs.map((paragraph, paragraphIndex) => {
      // Split each paragraph by various patterns (links, bold tags, line breaks)
      const parts = paragraph.split(
        /(<a[^>]*>.*?<\/a>|<strong>.*?<\/strong>|<br\/?>)/g,
      );

      const parsedContent = parts.map((part, index) => {
        // Handle existing anchor tags
        if (part.match(/<a[^>]*>.*?<\/a>/)) {
          const hrefMatch = part.match(/href="([^"]*)"/);
          const textMatch = part.match(/>([^<]*)</);
          if (hrefMatch && textMatch) {
            return (
              <a
                key={index}
                href={hrefMatch[1]}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {textMatch[1]}
              </a>
            );
          }
        }

        // Handle bold tags
        if (part.match(/<strong>.*?<\/strong>/)) {
          const textMatch = part.match(/<strong>(.*?)<\/strong>/);
          if (textMatch) {
            return <strong key={index}>{textMatch[1]}</strong>;
          }
        }

        // Handle line breaks
        if (part.match(/<br\/?>/)) {
          return <br key={index} />;
        }

        // Handle URLs that aren't wrapped in anchor tags
        if (part.match(/https?:\/\/[^\s]+/)) {
          const urlParts = part.split(/(https?:\/\/[^\s]+)/g);
          return urlParts.map((urlPart, urlIndex) => {
            if (urlPart.match(/^https?:\/\//)) {
              return (
                <a
                  key={`${index}-${urlIndex}`}
                  href={urlPart}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  {urlPart}
                </a>
              );
            }
            return urlPart;
          });
        }

        // Return plain text
        return part;
      });

      return (
        <p key={paragraphIndex} className="mb-4 last:mb-0">
          {parsedContent}
        </p>
      );
    });
  } else {
    // Handle simple URL parsing (for experiment cards)
    const parts = text.split(/(https?:\/\/[^\s]+)/g);

    return parts.map((part, index) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  }
}
