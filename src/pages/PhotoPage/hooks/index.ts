import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSingleImage, uploadPhotos } from '@app/api/uploads';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { removeSpacesAndDashes } from '@app/utils/removeSpacesAndDashes';

export const useGetSingleImage = (id: string) => {
  const {
    data: singleImage,
    error: singleImageError,
    isPending: singleImageLoading,
  } = useQuery({
    queryKey: ['uploads', 'photo', id],
    queryFn: () => getSingleImage(id),
    enabled: !!id,
  });

  return {
    singleImage,
    singleImageError,
    singleImageLoading,
  };
};

interface ISetProfilePhotoProps {
  imageName: string;
  description?: string;
  photoId: string;
  userId: string;
}

export const useSetProfilePhoto = () => {
  const queryClient = useQueryClient();

  const { mutate: setProfilePhoto, isPending: isSettingProfilePhoto } = useMutation({
    mutationFn: ({ imageName, description = '', userId }: ISetProfilePhotoProps) => {
      const formData = new FormData();
      formData.append(
        'text',
        JSON.stringify([
          {
            description,
            imageId: removeSpacesAndDashes(imageName),
            isProfilePhoto: true,
          },
        ])
      );
      formData.append('userId', userId);

      return uploadPhotos(formData);
    },
    onSuccess: (_response, variables) => {
      toast.success('Profilna fotografija je ažurirana.', toastConfig);
      queryClient.invalidateQueries({ queryKey: ['uploads'] });
      queryClient.invalidateQueries({ queryKey: ['uploads', 'photo', variables.photoId] });
      queryClient.invalidateQueries({ queryKey: ['uploads', 'user-photos'] });
      queryClient.invalidateQueries({ queryKey: ['profilePhoto', variables.userId] });
    },
    onError: () => {
      toast.error('Došlo je do greške prilikom postavljanja profilne fotografije.', toastConfig);
    },
  });

  return { setProfilePhoto, isSettingProfilePhoto };
};
