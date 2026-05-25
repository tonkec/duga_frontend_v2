import Image from '@app/components/Image';
import { Link } from 'react-router-dom';

interface IContentFormatterProps {
  text: string;
  renderRichContent?: boolean;
  taggedUsers?: { id: number; username?: string }[];
}

const ContentFormatter = ({
  text,
  renderRichContent = true,
  taggedUsers = [],
}: IContentFormatterProps) => {
  const parts = text.split(/(\s+)/);

  const youtubeRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
  const giphyRegex =
    /(?:https?:\/\/)?(?:(?:www\.)?giphy\.com\/(?:gifs|embed)\/([\w-]+)|media[0-9]?\.giphy\.com\/media\/([\w-]+)\/giphy\.gif)/;
  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
  const urlRegex = /(https?:\/\/[^\s]+)/;

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
              <Link key={i} to={`/user/${taggedUser.id}`} className="text-blue underline">
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

            return (
              <iframe
                key={i}
                width="360"
                height="200"
                src={`https://www.youtube.com/embed/${match[1]}`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

            return (
              <iframe
                key={i}
                src={`https://giphy.com/embed/${giphyId}`}
                width="280"
                height="170"
                allowFullScreen
              ></iframe>
            );
          }
        }

        if (imageRegex.test(part)) {
          const match = part.match(imageRegex);
          if (match) {
            if (!renderRichContent) {
              return <span key={i}>Slika</span>;
            }

            return (
              <Image src={match[1]} alt="content" style={{ display: 'inline-block' }} key={i} />
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
                rel="noopener noreferrer"
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
