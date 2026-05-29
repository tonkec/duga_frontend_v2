import { getForumUserAvatarProfilePhoto } from './forumUserAvatar';

describe('getForumUserAvatarProfilePhoto', () => {
  it('maps a safe forum user avatar path to a UserAvatar profile photo override', () => {
    expect(
      getForumUserAvatarProfilePhoto({
        id: 7,
        username: 'forum_user',
        avatar: 'staging/user/7/avatar.png',
      })
    ).toEqual({
      securePhotoUrl: '/uploads/files/staging/user/7/avatar.png',
      imageUrl: '/uploads/files/staging/user/7/avatar.png',
      url: '/uploads/files/staging/user/7/avatar.png',
    });
  });

  it('uses nested profile photo data when present', () => {
    expect(
      getForumUserAvatarProfilePhoto({
        id: 7,
        username: 'forum_user',
        profilePhoto: {
          securePhotoUrl: '/uploads/profile-photo.png',
        },
      })
    ).toEqual({
      securePhotoUrl: '/uploads/profile-photo.png',
      imageUrl: '/uploads/profile-photo.png',
      url: '/uploads/profile-photo.png',
    });
  });

  it('ignores unsafe avatar values', () => {
    expect(
      getForumUserAvatarProfilePhoto({
        id: 7,
        username: 'forum_user',
        avatar: 'javascript:alert(1)',
      })
    ).toBeUndefined();
  });
});
