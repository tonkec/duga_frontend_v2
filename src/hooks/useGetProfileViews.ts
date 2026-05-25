import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { getProfileViews, ProfileView, ProfileViewsResponse } from '@app/api/users';
import { useSocket } from '@app/context/useSocket';

interface ProfileViewCreatedPayload {
  data?: ProfileView;
}

const getTotalPages = (total: number, limit: number) => Math.max(Math.ceil(total / limit), 1);

export const useGetProfileViews = ({ page = 1, limit = 20 }: { page?: number; limit?: number }) => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const {
    data: profileViews,
    error: profileViewsError,
    isPending: areProfileViewsLoading,
  } = useQuery({
    queryKey: ['profile-views', page, limit],
    queryFn: () => getProfileViews({ page, limit }),
    retry: false,
  });

  useEffect(() => {
    if (!socket) return;

    const handleProfileViewCreated = (payload: ProfileViewCreatedPayload) => {
      const profileView = payload?.data;
      if (!profileView?.id) return;

      queryClient.setQueryData<AxiosResponse<ProfileViewsResponse>>(
        ['profile-views', 1, limit],
        (currentProfileViews) => {
          if (!currentProfileViews) return currentProfileViews;

          const currentData = currentProfileViews.data;
          const viewsWithoutDuplicate = currentData.data.filter(
            (currentProfileView) => Number(currentProfileView.id) !== Number(profileView.id)
          );
          const isDuplicate = viewsWithoutDuplicate.length !== currentData.data.length;
          const nextTotal = isDuplicate
            ? currentData.pagination.total
            : currentData.pagination.total + 1;

          return {
            ...currentProfileViews,
            data: {
              ...currentData,
              data: [profileView, ...viewsWithoutDuplicate].slice(0, limit),
              pagination: {
                ...currentData.pagination,
                page: 1,
                limit,
                total: nextTotal,
                totalPages: getTotalPages(nextTotal, limit),
              },
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['profile-views'], exact: false });
    };

    socket.on('profile-view-created', handleProfileViewCreated);

    return () => {
      socket.off('profile-view-created', handleProfileViewCreated);
    };
  }, [limit, queryClient, socket]);

  return { profileViews, profileViewsError, areProfileViewsLoading };
};
