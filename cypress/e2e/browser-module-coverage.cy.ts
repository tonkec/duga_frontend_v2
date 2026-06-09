/// <reference types="cypress" />

export {};

const importFromApp = <T = Record<string, unknown>>(win: Window, path: string) =>
  win.eval(`import('${path}')`) as Promise<T>;

describe('browser module branch coverage probes', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('covers media, profile path, emoji, IMDb, YouTube, and directory utility branches', () => {
    cy.visit('/login');

    cy.window().then(async (win) => {
      const media = await importFromApp<Record<string, (value?: string | null) => string | boolean>>(
        win,
        '/src/utils/mediaSafety.ts'
      );
      expect(media.getSafeBackendMediaPath('uploads/photo.png')).to.equal('/uploads/photo.png');
      expect(media.getSafeBackendMediaPath('http://localhost/uploads/photo.png')).to.equal(
        '/uploads/photo.png'
      );
      expect(media.getSafeBackendMediaPath('https://evil.test/uploads/photo.png')).to.equal('');
      expect(media.getSafeBackendMediaPath('../photo.png')).to.equal('');
      expect(
        media.getSafeS3BackendMediaPath(
          'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/photo.png'
        )
      ).to.equal('/uploads/files/development/user/photo.png');
      expect(media.getSafeS3BackendMediaPath('development/forum/photo.png')).to.equal(
        '/uploads/files/development/forum/photo.png'
      );
      expect(media.getSafeS3BackendMediaPath('https://evil.test/development/user/photo.png')).to.equal(
        ''
      );
      expect(media.getSafeRemoteImageUrl('https://media0.giphy.com/media/demo/giphy.gif')).to.equal(
        'https://media0.giphy.com/media/demo/giphy.gif'
      );
      expect(media.getSafeRemoteImageUrl('http://media0.giphy.com/media/demo/giphy.gif')).to.equal(
        ''
      );
      expect(media.getSafeYouTubeEmbedUrl('dQw4w9WgXcQ')).to.equal(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
      );
      expect(media.getSafeYouTubeEmbedUrl('bad id')).to.equal('');
      expect(media.getSafeGiphyEmbedUrl('abc-123')).to.equal('https://giphy.com/embed/abc-123');
      expect(media.getSafeGiphyEmbedUrl('../bad')).to.equal('');

      const emoji = await importFromApp<{
        getEmojiSearchQueryFromText: (value: string) => string | null;
        replaceEmojiToken: (value: string, selectedEmoji: string) => string;
        searchEmojiNatives: (query: string) => Promise<string[]>;
      }>(win, '/src/utils/emojis.ts');
      expect(emoji.getEmojiSearchQueryFromText('hello :)')).to.equal('smile');
      expect(emoji.getEmojiSearchQueryFromText('hello :party')).to.equal('party');
      expect(emoji.getEmojiSearchQueryFromText('hello')).to.equal(null);
      expect(emoji.replaceEmojiToken('hello :)', '😊')).to.equal('hello 😊');
      expect(emoji.replaceEmojiToken('hello', '😊')).to.equal('hello😊');
      expect(await emoji.searchEmojiNatives('')).to.include('😀');

      const imdb = await importFromApp<{
        formatImdbTitleUrl: (value?: string | null) => string;
        isImdbTitleUrl: (value?: string | null) => boolean;
        getImdbTitleUrl: (value?: string | null) => string;
      }>(win, '/src/utils/imdb.ts');
      expect(imdb.formatImdbTitleUrl('tt0133093')).to.equal('https://www.imdb.com/title/tt0133093/');
      expect(imdb.formatImdbTitleUrl('bad')).to.equal('https://www.imdb.com/title/bad/');
      expect(imdb.isImdbTitleUrl('https://www.imdb.com/title/tt0133093/')).to.equal(true);
      expect(imdb.isImdbTitleUrl('https://example.com/title/tt0133093/')).to.equal(false);
      expect(imdb.getImdbTitleUrl('https://www.imdb.com/title/tt0133093/?ref_=test')).to.equal(
        'https://www.imdb.com/title/tt0133093/'
      );

      const youtube = await importFromApp<{
        getYouTubeEmbedUrl: (value?: string | null) => string;
        isYouTubeUrl: (value?: string | null) => boolean;
      }>(win, '/src/utils/youtube.ts');
      expect(youtube.getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).to.equal(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
      );
      expect(youtube.getYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).to.equal(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
      );
      expect(youtube.getYouTubeEmbedUrl('https://example.com/watch?v=dQw4w9WgXcQ')).to.equal(null);
      expect(youtube.isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).to.equal(true);

      const profilePath = await importFromApp<{
        getUserProfilePath: (user: { id?: number | string; publicId?: string }) => string;
      }>(win, '/src/utils/userProfilePath.ts');
      expect(profilePath.getUserProfilePath({ id: 4, publicId: 'public-user' })).to.equal(
        '/user/public-user'
      );
      expect(profilePath.getUserProfilePath({ id: 4 })).to.equal('/users');
      expect(profilePath.getUserProfilePath({})).to.equal('/users');

      const directory = await importFromApp<{
        getVisibleVerifiedUsers: (users: Array<Record<string, unknown>>, currentUserId?: number) => unknown[];
        getLastOnlineUsers: (users: Array<Record<string, unknown>>) => unknown[];
      }>(win, '/src/utils/userDirectory.ts');
      expect(
        directory.getVisibleVerifiedUsers(
          [
            { id: 1, isVerified: true, username: 'self' },
            { id: 2, isVerified: true, username: 'visible' },
            { id: 3, isVerified: false, username: 'hidden' },
          ],
          1
        )
      ).to.have.length(1);
      expect(
        directory.getLastOnlineUsers([
          { id: 1, status: 'offline', lastOnlineAt: '2026-06-01T10:00:00Z' },
          { id: 2, status: 'online', lastOnlineAt: null },
          { id: 3, status: 'offline', lastOnlineAt: '2026-06-02T10:00:00Z' },
        ])
      ).to.have.length(3);
      expect(
        directory.filterUsers(
          [
            { id: 1, username: 'alex', gender: 'Nebinarna osoba', sexuality: 'Queer', location: 'Zagreb' },
            { id: 2, username: 'bo', gender: 'Žena', sexuality: 'Lezbijka', location: 'Split' },
          ],
          'zag',
          { value: 'location', label: 'Lokacija' }
        )
      ).to.have.length(1);
      expect(
        directory.filterUsers([{ id: 1, username: 'alex' }], 'alex', {
          value: 'unknown',
          label: 'Unknown',
        })
      ).to.have.length(0);

      const chatMemberStorage = await importFromApp<{
        clearLegacyChatMemberStorage: () => void;
        mergeChatMembers: (current?: Array<Record<string, unknown>>, next?: Array<Record<string, unknown>>) => unknown[];
      }>(win, '/src/utils/chatMemberStorage.ts');
      win.localStorage.setItem('dugaAdditionalChatMembers', 'legacy');
      win.localStorage.setItem('dugaGroupChatAdmins', 'legacy');
      chatMemberStorage.clearLegacyChatMemberStorage();
      expect(win.localStorage.getItem('dugaAdditionalChatMembers')).to.equal(null);
      expect(
        chatMemberStorage.mergeChatMembers(
          [{ id: 1, username: 'one' }, { id: Number.NaN, username: 'bad' }],
          [{ userId: 1, username: 'updated' }, { userId: 2, username: 'two' }]
        )
      ).to.deep.include({ id: 2, userId: 2, username: 'two' });

      const legacyError = await importFromApp<{
        getErrorMessage: (error: { response?: { data?: { errors?: Array<{ message: string }> } }; message: string }) => string;
      }>(win, '/src/utils/getErrorMessage.ts');
      expect(
        legacyError.getErrorMessage({
          response: { data: { errors: [{ message: 'Prva' }, { message: 'Druga' }] } },
          message: 'Fallback',
        })
      ).to.equal('Prva Druga');
      expect(legacyError.getErrorMessage({ message: 'Fallback' })).to.equal('Fallback');

      const photoUrl = await importFromApp<{
        getPhotoUrl: (photo?: { url: string }) => string;
      }>(win, '/src/utils/getPhotoUrl.ts');
      expect(photoUrl.getPhotoUrl(undefined)).to.equal('');
      expect(photoUrl.getPhotoUrl({ url: 'development/user/photo.png' })).to.contain(
        '/development/user/photo.png'
      );

      const profilePhoto = await importFromApp<{
        getProfilePhotoUrl: (photo?: { securePhotoUrl?: string }) => string;
        getProfilePhoto: (photos?: Array<{ isProfilePhoto: boolean; id: number }>) => unknown;
      }>(win, '/src/utils/getProfilePhoto.ts');
      expect(profilePhoto.getProfilePhotoUrl(undefined)).to.equal('');
      expect(profilePhoto.getProfilePhotoUrl({ securePhotoUrl: 'secure.png' })).to.equal('secure.png');
      expect(
        profilePhoto.getProfilePhoto([
          { id: 1, isProfilePhoto: false },
          { id: 2, isProfilePhoto: true },
        ])
      ).to.deep.equal({ id: 2, isProfilePhoto: true });

      const messagePreview = await importFromApp<{
        getMessagePreviewText: (message: Record<string, unknown>) => string;
      }>(win, '/src/utils/getMessagePreviewText.ts');
      expect(messagePreview.getMessagePreviewText({ type: 'gif' })).to.equal('GIF');
      expect(messagePreview.getMessagePreviewText({ type: 'file' })).to.equal('Fotografija');
      expect(messagePreview.getMessagePreviewText({ type: 'text', securePhotoUrl: 'secure.png' })).to.equal(
        'Fotografija'
      );
      expect(messagePreview.getMessagePreviewText({ type: 'text', message: '   ' })).to.equal('');

      const offlineStatus = await importFromApp<{
        setOfflineStatus: (
          socket: { connected: boolean; emit: (...args: unknown[]) => void },
          options?: { waitForAck?: boolean }
        ) => Promise<void>;
      }>(win, '/src/utils/setOfflineStatus.ts');
      const emitted: unknown[][] = [];
      await offlineStatus.setOfflineStatus({ connected: false, emit: (...args) => emitted.push(args) });
      await offlineStatus.setOfflineStatus(
        { connected: true, emit: (...args) => emitted.push(args) },
        { waitForAck: false }
      );
      await offlineStatus.setOfflineStatus({
        connected: true,
        emit: (...args) => {
          emitted.push(args);
          const ack = args[2];
          if (typeof ack === 'function') ack();
        },
      });
      expect(emitted).to.have.length(2);

      const profileCardUtils = await importFromApp<{
        getLookingForTranslation: (value: string) => string;
        getRelationshipStatusTranslation: (value: string) => string;
        getFavoriteDayOfWeekTranslation: (value: string) => string;
        shouldRenderField: (value: string) => string | boolean;
        getUserBio: (value: string) => string;
      }>(win, '/src/components/UserProfileCard/utils/index.ts');
      [
        'friendship',
        'date',
        'relationship',
        'marriage',
        'partnership',
        'nothing',
        'idk',
        'unknown',
      ].forEach((value) => profileCardUtils.getLookingForTranslation(value));
      [
        'single',
        'relationship',
        'marriage',
        'partnership',
        'inbetween',
        'divorced',
        'widowed',
        'separated',
        'open',
        'engaged',
        'idk',
        'unknown',
      ].forEach((value) => profileCardUtils.getRelationshipStatusTranslation(value));
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'unknown'].forEach(
        (value) => profileCardUtils.getFavoriteDayOfWeekTranslation(value)
      );
      expect(profileCardUtils.shouldRenderField('N/A')).to.equal(false);
      expect(profileCardUtils.shouldRenderField('Visible')).to.equal(true);
      expect(profileCardUtils.getUserBio('https://example.com')).to.equal(
        'Biografija još nije postavljena.'
      );
      expect(profileCardUtils.getUserBio('A short bio')).to.equal('A short bio');

      const forumValidation = await importFromApp<{
        validateForumImages: (images: File[], existingImageCount?: number) => string;
      }>(win, '/src/features/forum/utils/forumValidation.ts');
      const imageFile = new win.File(['ok'], 'ok.png', { type: 'image/png' });
      const textFile = new win.File(['bad'], 'bad.txt', { type: 'text/plain' });
      const oversizedImage = new win.File([new Blob([new Uint8Array(1024 * 1024 + 1)])], 'big.png', {
        type: 'image/png',
      });
      expect(forumValidation.validateForumImages([imageFile])).to.equal('');
      expect(forumValidation.validateForumImages([imageFile, imageFile, imageFile, imageFile, imageFile, imageFile])).to.contain(
        'najviše 5 slika'
      );
      expect(forumValidation.validateForumImages([imageFile, imageFile], 4)).to.contain(
        'Trenutno imaš 4'
      );
      expect(forumValidation.validateForumImages([textFile])).to.contain('samo slike');
      expect(forumValidation.validateForumImages([oversizedImage])).to.contain('1 MB');

      const forumImages = await importFromApp<{
        getForumImageUrl: (securePhotoUrl?: string | null, imageUrl?: string | null) => string;
        getForumImageItems: (item: Record<string, unknown>) => Array<Record<string, unknown>>;
      }>(win, '/src/features/forum/utils/forumImages.ts');
      expect(forumImages.getForumImageUrl('https://cdn.test/photo.png', 'fallback.png')).to.equal(
        'https://cdn.test/photo.png'
      );
      expect(forumImages.getForumImageUrl(null, '/forum/photo.png')).to.contain('/forum/photo.png');
      expect(forumImages.getForumImageUrl(null, null)).to.equal('');
      expect(
        forumImages.getForumImageItems({
          securePhotoUrl: 'https://cdn.test/main.png',
          imageUrls: ['one.png', 'two.png'],
          securePhotoUrls: ['https://cdn.test/one.png'],
        })
      ).to.have.length(3);

      const forumAvatar = await importFromApp<{
        getForumUserAvatarProfilePhoto: (user?: Record<string, unknown> | null) => unknown;
      }>(win, '/src/features/forum/utils/forumUserAvatar.ts');
      expect(forumAvatar.getForumUserAvatarProfilePhoto(null)).to.equal(undefined);
      expect(
        forumAvatar.getForumUserAvatarProfilePhoto({
          profilePhoto: { imageUrl: 'development/user/avatar.png' },
        })
      ).to.include({ imageUrl: '/uploads/files/development/user/avatar.png' });

      const forumLabels = await importFromApp<{ getVoteLabel: (count: number) => string }>(
        win,
        '/src/features/forum/utils/forumLabels.ts'
      );
      expect([forumLabels.getVoteLabel(1), forumLabels.getVoteLabel(3), forumLabels.getVoteLabel(8)]).to.deep.equal([
        'glas',
        'glasa',
        'glasova',
      ]);

      const apiErrors = await importFromApp<{
        getApiErrorMessage: (error: unknown, fallback: string) => string;
      }>(win, '/src/utils/apiErrorMessage.ts');
      expect(apiErrors.getApiErrorMessage(null, 'fallback')).to.equal('fallback');
      expect(apiErrors.getApiErrorMessage({ response: { data: 'bad' } }, 'fallback')).to.equal(
        'fallback'
      );
      expect(
        apiErrors.getApiErrorMessage(
          { response: { data: { errors: ['first', { reason: 'second' }, null] } } },
          'fallback'
        )
      ).to.equal('first second');

      const forumErrors = await importFromApp<{
        getForumErrorMessage: (error: unknown, fallback: string) => string;
      }>(win, '/src/features/forum/utils/forumErrors.ts');
      expect(forumErrors.getForumErrorMessage(new Error('plain'), 'fallback')).to.equal('fallback');
      expect(
        forumErrors.getForumErrorMessage(
          { isAxiosError: true, response: { data: { message: 'Forum message' } } },
          'fallback'
        )
      ).to.equal('Forum message');
    });
  });

  it('covers API response normalizers and request helper branches in the browser', () => {
    cy.visit('/login');

    cy.intercept('GET', /\/users\/get-users\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: {
          users: [
            { id: 1, username: 'verified', is_verified: true, emailVerified: false },
            { id: 2, username: 'unverified', verified: false },
          ],
        },
      },
    }).as('getUsersWrapped');

    cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 1, username: 'current', is_verified: true } },
    }).as('getCurrentUserWrapped');

    cy.intercept('GET', /\/users\/profile\/public-user(?:\?.*)?$/, {
      statusCode: 200,
      body: { user: { id: 2, username: 'public', publicId: 'public-user', verified: true } },
    }).as('getPublicUser');

    cy.intercept('GET', /\/users\/profile-views(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: [],
        pagination: { page: 1, limit: 5, total: 0, totalPages: 1 },
      },
    }).as('getProfileViews');
    cy.intercept('GET', /\/chats(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        Chats: [
          { id: 41, name: 'Group chat' },
          { ChatUser: { chatId: 42 }, name: 'Legacy chat' },
        ],
      },
    }).as('getChats');
    cy.intercept('POST', /\/chats\/create(?:\?.*)?$/, { statusCode: 200, body: { id: 42 } }).as(
      'createChat'
    );
    cy.intercept('DELETE', /\/chats\/42(?:\?.*)?$/, { statusCode: 200, body: { ok: true } }).as(
      'deleteChat'
    );
    cy.intercept('POST', /\/chats\/42\/leave(?:\?.*)?$/, {
      statusCode: 200,
      body: { chatId: 42, userId: 1, notifyUsers: [2], newAdminUserId: 2 },
    }).as('leaveChat');
    cy.intercept('GET', /\/chats\/messages\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { messages: [], pagination: { page: 1, totalPages: 1 } },
    }).as('getChatMessages');
    cy.intercept('POST', /\/messages(?:\?.*)?$/, { statusCode: 200, body: { id: 100 } }).as(
      'sendMessage'
    );
    cy.intercept('POST', /\/messages\/read-message\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('markRead');
    cy.intercept('GET', /\/messages\/is-read\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { isRead: true },
    }).as('isRead');
    cy.intercept('GET', /https:\/\/api\.giphy\.com\/v1\/gifs\/trending.*/, {
      statusCode: 200,
      body: { data: [{ id: 'trending' }] },
    }).as('trendingGifs');
    cy.intercept('GET', /https:\/\/api\.giphy\.com\/v1\/gifs\/search.*/, {
      statusCode: 200,
      body: { data: [{ id: 'search' }] },
    }).as('searchGifs');
    cy.intercept('GET', /https:\/\/www\.googleapis\.com\/youtube\/v3\/search.*/, {
      statusCode: 200,
      body: {
        items: [
          {
            id: { kind: 'youtube#video', videoId: 'dQw4w9WgXcQ' },
            snippet: {
              title: 'Duga &amp; Cypress',
              channelTitle: 'QA &quot;Channel&quot;',
              thumbnails: { medium: { url: 'https://img.youtube.com/demo.jpg' } },
            },
          },
          { id: { kind: 'youtube#playlist', videoId: 'ignored' }, snippet: { title: 'Ignored' } },
          { id: { kind: 'youtube#video' }, snippet: { title: 'Missing video id' } },
        ],
      },
    }).as('youtubeSearch');

    cy.window().then(async (win) => {
      const usersApi = await importFromApp<{
        getAllUsers: () => Promise<{ data: unknown[] }>;
        getCurrentUser: () => Promise<{ data: Record<string, unknown> }>;
        getUserById: (id: string) => Promise<{ data: Record<string, unknown> }>;
        getProfileViews: (params: { page?: number; limit?: number }) => Promise<unknown>;
      }>(win, '/src/api/users/index.ts');
      const uploadApi = await importFromApp<{
        getDeletePhotoUrl: (value: string) => string;
      }>(win, '/src/api/uploads/index.ts');
      const chatsApi = await importFromApp<{
        createChat: (data: Record<string, unknown>) => Promise<unknown>;
        getAllUserChats: () => Promise<unknown>;
        getCurrentChat: (chatId: string) => Promise<{ data?: Record<string, unknown> }>;
        deleteCurrentChat: (chatId: string) => Promise<unknown>;
        leaveCurrentChat: (chatId: string) => Promise<unknown>;
      }>(win, '/src/api/chats/index.ts');
      const messagesApi = await importFromApp<{
        getChatMessages: (chatId: string, page: number) => Promise<unknown>;
        sendChatMessage: (data: Record<string, unknown>) => Promise<unknown>;
        markMessagesAsRead: (messageId: string) => Promise<unknown>;
        isMessageRead: (messageId: string) => Promise<unknown>;
        getTrendingGIFS: (page?: number, limit?: number) => Promise<Array<Record<string, unknown>>>;
        getSearchGIFS: (
          term: string,
          page?: number,
          limit?: number
        ) => Promise<Array<Record<string, unknown>>>;
      }>(win, '/src/api/chatMessages/index.ts');
      const youtubeApi = await importFromApp<{
        searchYouTubeVideos: (query: string) => Promise<unknown[]>;
      }>(win, '/src/api/youtube/index.ts');

      const users = await usersApi.getAllUsers();
      expect(users.data[0]).to.include({ id: 1, isVerified: true });
      expect(users.data[1]).to.include({ id: 2, isVerified: false });
      const currentUser = await usersApi.getCurrentUser();
      expect(currentUser.data.data).to.include({ id: 1, username: 'current' });
      const publicUser = await usersApi.getUserById('public-user');
      expect(publicUser.data).to.include({ publicId: 'public-user', isVerified: true });
      await usersApi.getProfileViews({ page: 1, limit: 5 });

      expect(
        uploadApi.getDeletePhotoUrl(
          'https://duga-user-photo.s3.eu-north-1.amazonaws.com/development/user/photo.png'
        )
      ).to.equal('development/user/photo.png');
      expect(uploadApi.getDeletePhotoUrl('/uploads/files/development/user/photo.png')).to.equal(
        'development/user/photo.png'
      );
      expect(uploadApi.getDeletePhotoUrl(' relative/photo.png ')).to.equal('relative/photo.png');

      await chatsApi.createChat({ partnerId: 2 });
      await chatsApi.getAllUserChats();
      expect((await chatsApi.getCurrentChat('42')).data).to.include({ name: 'Legacy chat' });
      expect((await chatsApi.getCurrentChat('999')).data).to.equal(undefined);
      await chatsApi.deleteCurrentChat('42');
      await chatsApi.leaveCurrentChat('42');

      await messagesApi.getChatMessages('42', 2);
      await messagesApi.sendChatMessage({ chatId: 42, message: 'Hi', type: 'text' });
      await messagesApi.markMessagesAsRead('100');
      await messagesApi.isMessageRead('100');
      expect(await messagesApi.getTrendingGIFS()).to.deep.equal([{ id: 'trending' }]);
      expect(await messagesApi.getSearchGIFS('duga', 2, 3)).to.deep.equal([{ id: 'search' }]);

      expect(await youtubeApi.searchYouTubeVideos('x')).to.deep.equal([]);
      expect(await youtubeApi.searchYouTubeVideos('duga')).to.deep.equal([
        {
          id: 'dQw4w9WgXcQ',
          title: 'Duga & Cypress',
          channelTitle: 'QA "Channel"',
          thumbnailUrl: 'https://img.youtube.com/demo.jpg',
          url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        },
      ]);
    });
  });

  it('renders isolated branch-heavy components in the app browser context', () => {
    cy.visit('/login');

    cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 1, username: 'current', publicId: 'current-public', isVerified: true } },
    });
    cy.intercept('GET', /\/users\/2(?:\?.*)?$/, {
      statusCode: 200,
      body: { user: { id: 2, username: 'alex', publicId: 'alex-public', isVerified: true } },
    });
    cy.intercept('GET', /\/users\/profile\/2(?:\?.*)?$/, {
      statusCode: 200,
      body: { user: { id: 2, username: 'alex', publicId: 'alex-public', isVerified: true } },
    });
    cy.intercept('GET', /\/uploads\/user\/2(?:\?.*)?$/, {
      statusCode: 200,
      body: { images: [{ id: 1, isProfilePhoto: true, securePhotoUrl: 'development/user/avatar.png' }] },
    });
    cy.intercept('GET', /\/uploads\/latest(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: [
          {
            id: '778',
            userId: '2',
            userPublicId: 'alex-public',
            url: 'development/user/latest-two.png',
            securePhotoUrl: 'development/user/latest-two.png',
          },
        ],
      },
    });
    cy.intercept('GET', /\/uploads\/comments\/latest(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: [
          {
            id: 702,
            comment: 'Najnoviji komentar',
            createdAt: '2026-06-08T09:30:00.000Z',
            uploadId: 901,
            userId: 2,
            userPublicId: 'alex-public',
            imageUrl: 'development/user/comment.png',
          },
        ],
      },
    });
    cy.intercept('GET', /\/uploads\/901\/likes(?:\?.*)?$/, { statusCode: 200, body: { data: [] } });
    cy.intercept('GET', /\/uploads\/902\/likes(?:\?.*)?$/, { statusCode: 200, body: { data: [] } });
    cy.intercept('GET', /\/uploads\/files\/.*(?:\?.*)?$/, {
      statusCode: 200,
      headers: { 'content-type': 'image/png' },
      body: Cypress.Buffer.from('fake png contents'),
    });
    cy.intercept('GET', /\/chats(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: [
          {
            id: 44,
            Users: [{ id: 1 }, { id: 2 }],
            Messages: [
              {
                id: 501,
                chatId: 44,
                fromUserId: 2,
                type: 'text',
                message: 'Zadnja poruka',
                createdAt: '2026-06-08T09:30:00.000Z',
                User: { id: 2, username: 'alex' },
              },
            ],
          },
        ],
      },
    });
    cy.intercept('GET', /\/messages\/is-read\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { is_read: false },
    });
    cy.intercept('POST', /\/messages\/read-message\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('markHarnessMessageRead');

    cy.window().then(async (win) => {
      const reactRefresh = await importFromApp<{
        default: {
          injectIntoGlobalHook: (target: Window) => void;
        };
      }>(win, '/@react-refresh');
      reactRefresh.default.injectIntoGlobalHook(win);
      const viteWindow = win as Window & {
        $RefreshReg$?: () => void;
        $RefreshSig$?: () => (type: unknown) => unknown;
        __vite_plugin_react_preamble_installed__?: boolean;
      };
      viteWindow.$RefreshReg$ = () => undefined;
      viteWindow.$RefreshSig$ = () => (type: unknown) => type;
      viteWindow.__vite_plugin_react_preamble_installed__ = true;
      const container = win.document.createElement('div');
      container.setAttribute('id', 'component-coverage-root');
      win.document.body.appendChild(container);

      const harness = await importFromApp<{
        renderCoverageComponentHarness: (container: HTMLElement) => () => void;
      }>(win, `/src/test/e2eComponentHarness.ts?coverage=${Date.now()}`);

      harness.renderCoverageComponentHarness(container);
    });

    cy.getByTestId('component-coverage-harness').should('exist');
    cy.get('body').then(($body) => {
      $body.find('button[aria-label="Makni grešku"]').first().trigger('click');
      $body.find('button[aria-label="Sljedeća stranica"]').first().trigger('click');
      $body.find('button[aria-label="Prethodna stranica"]').first().trigger('click');
      $body.find('input[placeholder*="Pretraži emoji"]').first().val('smile').trigger('input');
      $body.find('button').filter((_, button) => button.textContent === 'Zatvori').first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Sheraj sliku') ?? false).first().trigger('click');
      $body.find('*').filter((_, element) => element.textContent?.includes('Zadnja poruka') ?? false).first().trigger('click');
    });
  });
});
