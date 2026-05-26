export interface UserProfilePathLike {
  id?: string | number | null;
  publicId?: string | null;
}

export const getUserProfileIdentifier = (user: UserProfilePathLike | undefined | null) => {
  if (!user) return '';
  return user.publicId || '';
};

export const getUserProfilePath = (user: UserProfilePathLike | undefined | null) => {
  const identifier = getUserProfileIdentifier(user);
  return identifier ? `/user/${identifier}` : '/users';
};
