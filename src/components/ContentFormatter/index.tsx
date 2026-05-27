import Image from '@app/components/Image';
import { Link } from 'react-router-dom';
import { getUserProfilePath } from '@app/utils/userProfilePath';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import {
  getSafeGiphyEmbedUrl,
  getSafeRemoteImageUrl,
  getSafeYouTubeEmbedUrl,
} from '@app/utils/mediaSafety';
import { useObjectUrl } from '@app/hooks/useObjectUrl';

interface IContentFormatterProps {
  text: string;
  renderRichContent?: boolean;
  taggedUsers?: { id: number; publicId?: string; username?: string }[];
  linkClassName?: string;
}

const SecureInlineImage = ({ secureUrl }: { secureUrl: string }) => {
  const { data: imageBlob } = useGetImageBlob(secureUrl);
  const imageUrl = useObjectUrl(imageBlob);

  if (!imageUrl) {
    return <span>Slika</span>;
  }

  return (
    <Image
      src={imageUrl}
      alt="Slika iz poruke"
      className="mt-2 max-h-72 max-w-full rounded-2xl object-contain"
    />
  );
};

const ContentFormatter = ({
  text,
  renderRichContent = true,
  taggedUsers = [],
  linkClassName = 'text-blue underline',
}: IContentFormatterProps) => {
  const parts = text.split(/(\s+)/);

  const youtubeRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
  const giphyRegex =
    /(?:https?:\/\/)?(?:(?:www\.)?giphy\.com\/(?:gifs|embed)\/([\w-]+)|media[0-9]?\.giphy\.com\/media\/([\w-]+)\/giphy\.gif)/;
  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
  const urlRegex = /(https?:\/\/[^\s]+)/;
  const internalProfilePathRegex =
    /^\/user\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const secureImagePathRegex = /^\/?uploads\/[^\s]+$/;

  return (
    <>
      {parts.map((part, i) => {
        const mentionMatch = part.match(/^@([\w\d_]+)$/);
        if (mentionMatch) {
          const username = mentionMatch[1];
          const taggedUser = taggedUsers.find(
            (user) => user.username?.toLowerCase() === username.toLowerCase()
          );

          if (taggedUser) {
            return (
              <Link key={i} to={getUserProfilePath(taggedUser)} className={linkClassName}>
                {part}
              </Link>
            );
          }
        }

        if (youtubeRegex.test(part)) {
          const match = part.match(youtubeRegex);
          if (match) {
            if (!renderRichContent) {
              return <span key={i}>YouTube video</span>;
            }

            const embedUrl = getSafeYouTubeEmbedUrl(match[1]);
            if (!embedUrl) {
              return <span key={i}>{part}</span>;
            }

            return (
              <iframe
                key={i}
                width="360"
                height="200"
                src={embedUrl}
                title="YouTube video"
                allow="encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="no-referrer"
                loading="lazy"
                allowFullScreen
              ></iframe>
            );
          }
        }

        if (giphyRegex.test(part)) {
          const match = part.match(giphyRegex);
          if (match) {
            const giphyId = match[1] || match[2];

            if (!renderRichContent) {
              return <span key={i}>GIF</span>;
            }

            const embedUrl = getSafeGiphyEmbedUrl(giphyId);
            if (!embedUrl) {
              return <span key={i}>{part}</span>;
            }

            return (
              <iframe
                key={i}
                src={embedUrl}
                width="280"
                height="170"
                sandbox="allow-scripts allow-same-origin"
                referrerPolicy="no-referrer"
                loading="lazy"
                allowFullScreen
              ></iframe>
            );
          }
        }

        if (secureImagePathRegex.test(part)) {
          if (!renderRichContent) {
            return <span key={i}>Slika</span>;
          }

          return <SecureInlineImage key={i} secureUrl={part} />;
        }

        if (internalProfilePathRegex.test(part)) {
          return (
            <Link key={i} to={part} className={linkClassName}>
              {part}
            </Link>
          );
        }

        if (imageRegex.test(part)) {
          const match = part.match(imageRegex);
          if (match) {
            if (!renderRichContent) {
              return <span key={i}>Slika</span>;
            }

            const safeImageUrl = getSafeRemoteImageUrl(match[1]);
            if (!safeImageUrl) {
              return (
                <a
                  key={i}
                  href={match[1]}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  referrerPolicy="no-referrer"
                  className="underline"
                >
                  {match[1]}
                </a>
              );
            }

            return (
              <Image
                src={safeImageUrl}
                alt="content"
                style={{ display: 'inline-block' }}
                loading
                referrerPolicy="no-referrer"
                key={i}
              />
            );
          }
        }

        if (urlRegex.test(part)) {
          const match = part.match(urlRegex);
          if (match) {
            return (
              <a
                key={i}
                href={match[1]}
                target="_blank"
                rel="noopener noreferrer nofollow"
                referrerPolicy="no-referrer"
                className="underline"
              >
                {match[1]}
              </a>
            );
          }
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default ContentFormatter;
