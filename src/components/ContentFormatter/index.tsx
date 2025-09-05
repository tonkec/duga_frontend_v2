import Image from '@app/components/Image';

interface IContentFormatterProps {
  text: string;
}

const ContentFormatter = ({ text }: IContentFormatterProps) => {
  const parts = text.split(/(\s+)/);

  const youtubeRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
  const giphyRegex = /(?:https?:\/\/)?(?:www\.)?giphy\.com\/(?:gifs|embed)\/([\w-]+)/;
  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
  const urlRegex = /(https?:\/\/[^\s]+)/;

  return (
    <>
      {parts.map((part, i) => {
        if (youtubeRegex.test(part)) {
          const match = part.match(youtubeRegex);
          if (match) {
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
            return (
              <iframe
                key={i}
                src={`https://giphy.com/embed/${match[1]}`}
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
            return <Image src={match[1]} alt="content" style={{ display: 'inline-block' }} />;
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
