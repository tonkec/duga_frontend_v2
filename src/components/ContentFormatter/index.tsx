interface IContentFormatterProps {
  text: string;
}

const ContentFormatter = ({ text }: IContentFormatterProps) => {
  const youtubeRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

  const giphyRegex = /(?:https?:\/\/)?(?:www\.)?giphy\.com\/(?:gifs|embed)\/([\w-]+)/;

  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;

  const urlRegex = /(https?:\/\/[^\s]+)/;

  const youtubeMatch = text.match(youtubeRegex);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <iframe
        width="400"
        height="200"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  const giphyMatch = text.match(giphyRegex);
  if (giphyMatch) {
    const giphyId = giphyMatch[1];
    return (
      <iframe
        src={`https://giphy.com/embed/${giphyId}`}
        width="480"
        height="270"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    );
  }

  const imageMatch = text.match(imageRegex);
  if (imageMatch) {
    return <img src={imageMatch[1]} alt="content" style={{ maxWidth: '100px' }} />;
  }

  const linkMatch = text.match(urlRegex);
  if (linkMatch) {
    return (
      <a href={linkMatch[1]} target="_blank" rel="noopener noreferrer" className="underline">
        {linkMatch[1]}
      </a>
    );
  }

  return <span>{text}</span>;
};

export default ContentFormatter;
