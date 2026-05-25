import { SetStateAction } from 'react';
import { ImageDescription } from '@app/components/PhotoUploader';
import PhotoLikes from '@app/components/PhotoLikes';
import Photo from './components/Photo';
import { useNavigate } from 'react-router';
import { BiImages, BiSolidCamera } from 'react-icons/bi';

export interface IImage {
  createdAt: string;
  description: string;
  fileType: string;
  id: number;
  isProfilePhoto: boolean;
  photoType?: string;
  source?: string;
  type?: string;
  origin?: string;
  chatId?: number | string;
  messageId?: number | string;
  commentId?: number | string;
  uploadCommentId?: number | string;
  uploadId?: number | string;
  messagePhotoUrl?: string;
  imageUrl?: string;
  name: string;
  updatedAt: string;
  url: string;
  userId: string;
  securePhotoUrl: string;
}

interface IPhotosProps {
  images: IImage[] | undefined;
  notFoundText: string;
  setImageDescriptions?: (e: SetStateAction<ImageDescription[]>) => void;
}

const Photos = ({ images, notFoundText }: IPhotosProps) => {
  const navigate = useNavigate();
  if (!images || !images.length) {
    return (
      <div className="relative isolate overflow-hidden rounded-3xl border border-dashed border-[#b9c6ff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef3ff] px-6 py-14 text-center">
        <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-blue/10 blur-3xl" />
        <div className="absolute -right-16 bottom-4 h-44 w-44 rounded-full bg-blue/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-white text-blue-dark shadow-lg shadow-blue/10">
            <BiImages size={40} />
          </div>

          <span className="mb-3 inline-flex rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-dark">
            Fotografije
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-gray-950">{notFoundText}</h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Ovaj profil još nema javno dodanih fotografija. Kad se pojave nove slike, prikazat će se
            ovdje.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
            <BiSolidCamera className="text-blue" />
            Galerija je trenutno prazna
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fbfcff] to-[#f7f9ff]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue/10 blur-3xl" />
      <div className="relative z-10 mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Fotografije</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-950">Galerija</h2>
          <p className="mt-1 text-sm text-gray-600">Pregled javnih fotografija s ovog profila.</p>
        </div>
        <span className="w-fit rounded-full border border-[#dce4ff] bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          {images.length} {images.length === 1 ? 'fotografija' : 'fotografije'}
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image: IImage, index: number) => {
          return (
            <div
              className="group overflow-hidden rounded-3xl border border-[#dce4ff] bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue/10"
              key={index}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef3ff]">
                <Photo image={image} onClick={() => navigate(`/photo/${image.id}`)} />
              </div>
              <div className="mt-3 rounded-2xl bg-[#f7f9ff] px-3 py-2">
                {image.description && (
                  <p className="mb-2 line-clamp-2 text-sm leading-6 text-gray-700">
                    {image.description}
                  </p>
                )}
                <PhotoLikes photoId={String(image.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Photos;
