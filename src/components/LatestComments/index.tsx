import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Loader from '@app/components/Loader';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useGetLatestComments } from './hooks';
import DOMPurify from 'dompurify';
import { useGetImageBlob } from '../LatestUploads/hooks';
import UserAvatar from '../UserAvatar';
import Image from '../Image';
import ContentFormatter from '../ContentFormatter';
import { BiCommentDetail, BiImage } from 'react-icons/bi';

interface IComment {
  id: number;
  comment: string;
  createdAt: string;
  uploadId: number;
  userId: number;
  taggedUsers?: { id: number; username: string }[];
  imageUrl: string;
  securePhotoUrl?: string;
}

export const LatestComment = ({ comment, onClick }: { comment: IComment; onClick: () => void }) => {
  const navigate = useNavigate();
  const { user } = useGetUserById(comment.userId.toString());
  const { data: imageBlob } = useGetImageBlob(comment.securePhotoUrl || comment.imageUrl);
  const username = user?.data.username || 'Korisnik';

  const renderFormattedComment = (text: string) => {
    const cleanText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    if (!cleanText) return null;

    const parts = cleanText.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        const matchedUser = comment.taggedUsers?.find((u) => u.username === username);

        if (matchedUser) {
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/user/${matchedUser.id}`);
              }}
              className="cursor-pointer text-blue underline"
            >
              {part}
            </span>
          );
        }
      }

      return (
        <span key={index}>
          <ContentFormatter text={part} renderRichContent={false} />
        </span>
      );
    });
  };

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-3xl border border-[#dce4ff] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onClick={onClick}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 text-left"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/user/${comment.userId}`);
          }}
        >
          <UserAvatar
            color="#eef3ff"
            userId={String(comment.userId)}
            avatarFallbackName={username}
            className="h-10 w-10 shrink-0 rounded-full"
            fgColor="#1f2937"
          />
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-950">{username}</p>
            <RecordCreatedAt createdAt={comment.createdAt} />
          </div>
        </button>

        <span className="rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-3 py-1 text-xs font-semibold text-blue-dark">
          Fotka
        </span>
      </div>

      <div className="flex gap-3 rounded-2xl bg-[#f7f9ff] p-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white">
          {imageBlob ? (
            <Image
              src={URL.createObjectURL(imageBlob)}
              alt="Slika iz komentara"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/photo/${comment.uploadId}`);
              }}
            />
          ) : (
            <BiImage size={28} className="text-blue" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-3 text-sm leading-6 text-gray-700">
            {comment.comment ? (
              renderFormattedComment(comment.comment)
            ) : (
              <span className="text-gray-500">Komentar s fotografijom</span>
            )}
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-dark">
            Otvori fotografiju
          </p>
        </div>
      </div>
    </article>
  );
};

const LatestComments = () => {
  const navigate = useNavigate();
  const numberOfComments = 3;
  const { allComments, isAllCommentsLoading } = useGetLatestComments();
  if (isAllCommentsLoading) {
    return (
      <section className="mt-8 rounded-3xl border border-[#dce4ff] bg-white py-10">
        <Loader variant="inline" label="Učitavanje komentara..." />
      </section>
    );
  }

  if (!allComments?.data.length) {
    return null;
  }

  const comments =
    allComments?.data
      .slice()
      .sort(
        (a: IComment, b: IComment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, numberOfComments) || [];

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Komentari</p>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <BiCommentDetail className="text-blue" />
            Zadnji komentari na fotografije
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Najnovije reakcije i razgovori ispod korisničkih fotografija.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-blue-dark shadow-sm">
          <BiCommentDetail />
          {comments.length} komentara
        </span>
      </div>

      <div className="rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-white via-[#fbfcff] to-[#f7f9ff] p-4 shadow-sm md:p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          {comments.map((comment: IComment) => (
            <LatestComment
              key={comment.id}
              comment={comment}
              onClick={() => navigate(`/photo/${comment.uploadId}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestComments;
