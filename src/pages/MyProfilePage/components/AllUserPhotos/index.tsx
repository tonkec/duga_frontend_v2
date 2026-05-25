import Button from '@app/components/Button';
import { IImage } from '@app/components/Photos';
import Photo from '@app/components/Photos/components/Photo';
import { useDeletePhoto } from '@app/components/Photos/hooks';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import notFound from '@app/assets/not_found.svg';
import ConfirmModal from '@app/components/ConfirmModal';
import { useState } from 'react';
import { MAXIMUM_NUMBER_OF_IMAGES } from '@app/utils/consts';
import Image from '@app/components/Image';
import Loader from '@app/components/Loader';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useQuestionDetails, useQuestions } from '@app/features/forum/hooks/useForum';
import ForumImage from '@app/features/forum/components/ForumImage';
import {
  getUserForumAnswers,
  getUserForumQuestions,
} from '@app/features/forum/components/UserForumActivity';
import type { Answer, Question } from '@app/features/forum/types/forum.types';
import { Link } from 'react-router-dom';

const photoTypeLabels = {
  answer: 'Slika iz odgovora',
  chat: 'Chat fotografija',
  comment: 'Fotografija iz komentara',
  question: 'Slika iz pitanja',
  profile: 'Profilna fotografija',
};

type AllUserPhoto = IImage & {
  forumQuestionId?: number;
};

interface IDeletePhotoModalProps {
  setIsDeleteModalVisible: (visible: boolean) => void;
  onDeletePhoto: () => void;
  isDeleteModalVisible: boolean;
}

const DeletePhotoModal = ({
  isDeleteModalVisible,
  onDeletePhoto,
  setIsDeleteModalVisible,
}: IDeletePhotoModalProps) => {
  return (
    <ConfirmModal
      isOpen={isDeleteModalVisible}
      onConfirm={onDeletePhoto}
      onClose={() => setIsDeleteModalVisible(false)}
    >
      <h2 className="text-xl text-center"> Jesi li siguran_na da želiš obrisati fotografiju?</h2>
      <p className="text-center">
        Brisanjem fotografije uklanja se i sve što je s njom povezano (npr. komentar ili poruka).
      </p>
    </ConfirmModal>
  );
};

const getPhotoTypeLabel = (image: IImage) => {
  const explicitType = [image.photoType, image.source, image.type, image.origin]
    .find(Boolean)
    ?.toLowerCase();
  const imagePath = [
    image.url,
    image.securePhotoUrl,
    image.messagePhotoUrl,
    image.imageUrl,
    image.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    explicitType?.includes('question') ||
    explicitType?.includes('forum-question') ||
    imagePath.includes('/forum/questions') ||
    imagePath.includes('question')
  ) {
    return photoTypeLabels.question;
  }

  if (
    explicitType?.includes('answer') ||
    explicitType?.includes('forum-answer') ||
    imagePath.includes('/forum/answers') ||
    imagePath.includes('answer')
  ) {
    return photoTypeLabels.answer;
  }

  if (
    explicitType?.includes('chat') ||
    image.chatId ||
    image.messageId ||
    imagePath.includes('/chat/') ||
    imagePath.includes('chat/')
  ) {
    return photoTypeLabels.chat;
  }

  if (
    explicitType?.includes('comment') ||
    image.commentId ||
    image.uploadCommentId ||
    imagePath.includes('/comment') ||
    imagePath.includes('comment/')
  ) {
    return photoTypeLabels.comment;
  }

  return photoTypeLabels.profile;
};

const hasForumImage = (item: Question | Answer) => Boolean(item.securePhotoUrl || item.imageUrl);

export const getForumPhotos = (questions: Question[], userId: number): AllUserPhoto[] => {
  const questionPhotos = getUserForumQuestions(questions, userId)
    .filter(hasForumImage)
    .map((question) => ({
      createdAt: question.createdAt,
      description: question.title,
      fileType: 'image',
      id: -100000 - question.id,
      isProfilePhoto: false,
      name: question.title,
      photoType: 'forum-question',
      securePhotoUrl: question.securePhotoUrl ?? '',
      updatedAt: question.updatedAt,
      url: question.imageUrl ?? question.securePhotoUrl ?? '',
      userId: String(question.userId),
      forumQuestionId: question.id,
    }));

  const answerPhotos = getUserForumAnswers(questions, userId)
    .filter(({ answer }) => hasForumImage(answer))
    .map(({ answer, question }) => ({
      createdAt: answer.createdAt,
      description: question.title,
      fileType: 'image',
      id: -200000 - answer.id,
      isProfilePhoto: false,
      name: question.title,
      photoType: 'forum-answer',
      securePhotoUrl: answer.securePhotoUrl ?? '',
      updatedAt: answer.updatedAt,
      url: answer.imageUrl ?? answer.securePhotoUrl ?? '',
      userId: String(answer.userId),
      forumQuestionId: question.id,
    }));

  return [...questionPhotos, ...answerPhotos];
};

const isForumPhoto = (image: AllUserPhoto) => image.photoType?.startsWith('forum-');

const AllUserPhotos = () => {
  const { user: currentUser } = useGetCurrentUser();
  const currentUserId = currentUser?.data?.id;
  const numericCurrentUserId = Number(currentUserId);
  const { allUserImages, allUserImagesError, allUserImagesLoading } = useGetAllUserImages();
  const { data: forumData, isPending: isForumLoading } = useQuestions({ page: 1, limit: 100 });
  const forumQuestions = forumData?.data ?? [];
  const forumDetailQueries = useQuestionDetails(forumQuestions);
  const detailedForumQuestions = forumDetailQueries
    .map((query) => query.data)
    .filter((question): question is Question => Boolean(question));
  const forumQuestionsWithDetails = forumQuestions.map(
    (question) =>
      detailedForumQuestions.find((detailedQuestion) => detailedQuestion.id === question.id) ??
      question
  );
  const isForumDetailsLoading = forumDetailQueries.some((query) => query.isPending);
  const { deletePhoto, isDeleting } = useDeletePhoto(['uploads', 'user-photos']);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const uploadPhotos: AllUserPhoto[] = Array.isArray(allUserImages?.data)
    ? allUserImages.data
    : allUserImages?.data?.images || [];
  const forumPhotos = Number.isFinite(numericCurrentUserId)
    ? getForumPhotos(forumQuestionsWithDetails, numericCurrentUserId)
    : [];
  const photos = [...uploadPhotos, ...forumPhotos];

  const handleDelete = () => {
    deletePhoto({ url: photoUrl });
    setIsDeleteModalVisible(false);
  };

  if (allUserImagesLoading || isForumLoading || isForumDetailsLoading) {
    return <Loader />;
  }

  if (allUserImagesError && !forumPhotos.length) {
    return <h2 className="font-bold mt-5 mb-2 text-center">Fotografije se nisu učitale.</h2>;
  }

  if (!photos.length) {
    return (
      <>
        <Image src={notFound} alt="Nema fotografija" className="mx-auto block max-w-[300px]" />
        <h2 className="font-bold mt-5 mb-2 text-center">Nema fotografija</h2>
      </>
    );
  }

  return (
    <>
      <DeletePhotoModal
        isDeleteModalVisible={isDeleteModalVisible}
        onDeletePhoto={handleDelete}
        setIsDeleteModalVisible={setIsDeleteModalVisible}
      />
      <p className="mb-4">
        Trenutno imaš {uploadPhotos.length} od maksimalno {MAXIMUM_NUMBER_OF_IMAGES} profilnih
        fotografija.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((image) => (
          <div
            key={image.id}
            className="relative overflow-hidden rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] p-3 shadow-sm"
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-white">
              {isForumPhoto(image) ? (
                <ForumImage
                  securePhotoUrl={image.securePhotoUrl}
                  imageUrl={image.imageUrl || image.url}
                  alt={getPhotoTypeLabel(image)}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <Photo image={image} />
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#dce4ff] px-3 py-1 text-sm font-semibold text-blue">
                {getPhotoTypeLabel(image)}
              </span>
              {image.isProfilePhoto && (
                <span className="inline-flex rounded-full bg-blue px-3 py-1 text-sm font-semibold text-white">
                  Trenutna profilna
                </span>
              )}
            </div>
            {isForumPhoto(image) && image.forumQuestionId ? (
              <Link
                to={`/forum/questions/${image.forumQuestionId}`}
                className="mt-4 inline-flex rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-blue-dark transition-colors hover:border-blue hover:text-blue"
              >
                Otvori pitanje
              </Link>
            ) : (
              <Button
                onClick={() => {
                  setIsDeleteModalVisible(true);
                  setPhotoUrl(image.url);
                }}
                disabled={isDeleting}
                type="danger"
                className="mt-4"
              >
                Obriši
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default AllUserPhotos;
