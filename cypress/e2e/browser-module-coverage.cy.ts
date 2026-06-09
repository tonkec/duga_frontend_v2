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

    cy.intercept('GET', /\/users\/get-users\/?(?:\?.*)?$/, (req) => {
      const page = String(req.query.page ?? '1');
      const users = [
        { id: 1, username: 'verified', is_verified: true, emailVerified: false },
        { id: 2, username: 'unverified', verified: false },
      ];
      const bodyByPage: Record<string, unknown> = {
        '1': { data: { users } },
        '2': users,
        '3': { data: users },
        '4': { data: { data: users } },
        '5': { data: { rows: users } },
        '6': { rows: users },
        '7': { items: users },
        '8': { data: { items: users } },
      };

      req.reply({ statusCode: 200, body: bodyByPage[page] ?? { data: { users } } });
    }).as('getUsersWrapped');

    cy.intercept('GET', /\/users\/current-user\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 1, username: 'current', is_verified: true } },
    }).as('getCurrentUserWrapped');

    cy.intercept('GET', /\/users\/profile\/public-user(?:\?.*)?$/, {
      statusCode: 200,
      body: { user: { id: 2, username: 'public', publicId: 'public-user', verified: true } },
    }).as('getPublicUser');
    cy.intercept('GET', /\/users\/7(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: {
          data: {
            id: 7,
            username: 'numeric',
            Profile: {
              about: 'Nested bio',
              city: 'Rijeka',
              favorite_day: 'monday',
              sports: true,
            },
            isVerified: true,
          },
        },
      },
    }).as('getNumericUser');

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
    cy.intercept('GET', /https:\/\/v3\.sg\.media-imdb\.com\/suggestion\/.*/, (req) => {
      const url = req.url;
      if (url.includes('/f/fail')) {
        req.reply({ statusCode: 500, body: {} });
        return;
      }

      if (url.includes('/a/array')) {
        req.reply({
          statusCode: 200,
          body: [
            { id: 'tt0000001', l: 'Array title', y: 1901, image: { url: 'https://img.test/a.jpg' } },
            { id: 'nm0000001', l: 'Ignored person' },
          ],
        });
        return;
      }

      const itemByQuery = url.includes('/r/results')
        ? { results: [{ imdbId: 'tt0000002', title: 'Results title', year: 1902 }] }
        : url.includes('/t/titles')
          ? { titles: [{ titleId: 'tt0000003', name: 'Titles name', releaseYear: { year: 1903 } }] }
          : url.includes('/n/nested')
            ? { data: { titles: [{ tconst: 'tt0000004', primaryTitle: 'Nested title' }] } }
            : url.includes('/s/search')
              ? { data: { search: { titles: [{ id: 'tt0000005', titleText: { text: 'Search title' } }] } } }
              : { d: [{ id: 'tt0000006', l: 'Default title', i: { imageUrl: 'https://img.test/d.jpg' } }] };

      req.reply({ statusCode: 200, body: itemByQuery });
    }).as('imdbApiSearch');
    const forumQuestion = {
      id: 501,
      userId: '2',
      title: 'Forum API pitanje',
      body: 'Pitanje iz API normalizer testa.',
      createdAt: '2026-06-08T09:30:00.000Z',
      updatedAt: '2026-06-08T09:30:00.000Z',
      voteScore: '3',
      voteCount: '4',
      category: { id: 1, name: 'Odnosi', slug: 'odnosi' },
      user: {
        id: 2,
        firstName: 'Alex',
        lastName: 'Rain',
        username: 'alex_rain',
        profilePhoto: { imageUrl: 'development/user/alex.png' },
      },
      taggedUsers: [null, { id: 3, username: 'mira_sun' }],
      answers: [
        {
          id: 701,
          questionId: 501,
          userId: '',
          body: 'Odgovor s reakcijama.',
          createdAt: '2026-06-08T09:35:00.000Z',
          voteScore: '2',
          user: { id: 4, username: 'zora', avatar: 'development/user/zora.png' },
          Reactions: [
            { emoji: '👍', count: '2', users: [{ id: 1 }, { id: 2 }], hasReacted: true },
            { emoji: '👍', count: 1, userIds: ['3'] },
            { emoji: null, count: 5 },
          ],
          myReactions: ['❤️'],
          Replies: [
            {
              id: 801,
              answerId: '701',
              userId: null,
              body: 'Reply body',
              User: { id: 5, username: 'reply_user' },
              Reactions: [
                { emoji: '🎉', count: '2', currentUserHasReacted: true },
                { emoji: '', count: 5 },
              ],
            },
          ],
        },
      ],
    };
    const forumAnswer = {
      id: 702,
      questionId: 501,
      userId: 1,
      body: 'Novi API odgovor',
      createdAt: '2026-06-08T09:45:00.000Z',
      User: { id: 1, username: 'current' },
      reactions: [{ emoji: '🙏', count: 1, reactedByCurrentUser: true }],
      replies: [],
    };
    const forumReply = {
      id: 802,
      answerId: 702,
      userId: 1,
      body: 'API reply',
      User: { id: 1, username: 'current' },
      reactions: [{ emoji: '❤️', count: 1, isMine: true }],
    };
    cy.intercept('GET', /\/forum\/questions\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: [forumQuestion],
    }).as('forumApiGetQuestions');
    cy.intercept('GET', /\/forum\/questions\/501\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: forumQuestion,
    }).as('forumApiGetQuestion');
    cy.intercept('POST', /\/forum\/questions\/?(?:\?.*)?$/, {
      statusCode: 201,
      body: { data: forumQuestion },
    }).as('forumApiCreateQuestion');
    cy.intercept('PATCH', /\/forum\/questions\/501\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: forumQuestion,
    }).as('forumApiUpdateQuestion');
    cy.intercept('DELETE', /\/forum\/questions\/501\/image\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('forumApiDeleteQuestionImage');
    cy.intercept('DELETE', /\/forum\/questions\/501\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('forumApiDeleteQuestion');
    cy.intercept('POST', /\/forum\/questions\/501\/answers\/?(?:\?.*)?$/, {
      statusCode: 201,
      body: { data: forumAnswer },
    }).as('forumApiCreateAnswer');
    cy.intercept('PATCH', /\/forum\/answers\/702\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: forumAnswer,
    }).as('forumApiUpdateAnswer');
    cy.intercept('DELETE', /\/forum\/answers\/702\/image\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('forumApiDeleteAnswerImage');
    cy.intercept('DELETE', /\/forum\/answers\/702\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('forumApiDeleteAnswer');
    cy.intercept('PATCH', /\/forum\/questions\/501\/answers\/702\/accept\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: forumQuestion },
    }).as('forumApiAcceptAnswer');
    cy.intercept('POST', /\/forum\/questions\/501\/votes\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: forumQuestion,
    }).as('forumApiVoteQuestion');
    cy.intercept('DELETE', /\/forum\/questions\/501\/votes\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('forumApiDeleteQuestionVote');
    cy.intercept('POST', /\/forum\/answers\/702\/votes\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: forumAnswer },
    }).as('forumApiVoteAnswer');
    cy.intercept('DELETE', /\/forum\/answers\/702\/votes\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('forumApiDeleteAnswerVote');
    cy.intercept('POST', /\/forum\/answers\/702\/reactions\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: forumAnswer },
    }).as('forumApiAddAnswerReaction');
    cy.intercept('DELETE', /\/forum\/answers\/702\/reactions\/?(?:\?.*)?$/, {
      statusCode: 204,
    }).as('forumApiDeleteAnswerReaction');
    cy.intercept('POST', /\/forum\/answers\/702\/replies\/?(?:\?.*)?$/, {
      statusCode: 201,
      body: { data: forumReply },
    }).as('forumApiCreateAnswerReply');
    cy.intercept('PATCH', /\/forum\/answer-replies\/802\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: forumReply,
    }).as('forumApiUpdateAnswerReply');
    cy.intercept('DELETE', /\/forum\/answer-replies\/802\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('forumApiDeleteAnswerReply');
    cy.intercept('POST', /\/forum\/answer-replies\/802\/reactions\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: forumReply },
    }).as('forumApiAddAnswerReplyReaction');
    cy.intercept('DELETE', /\/forum\/answer-replies\/802\/reactions\/?(?:\?.*)?$/, {
      statusCode: 204,
    }).as('forumApiDeleteAnswerReplyReaction');

    cy.window().then(async (win) => {
      const usersApi = await importFromApp<{
        getAllUsers: (params?: { page?: number; limit?: number }) => Promise<{ data: unknown[] }>;
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
      const imdbApi = await importFromApp<{
        searchImdbTitles: (query: string) => Promise<unknown[]>;
      }>(win, '/src/api/imdb/index.ts');
      const forumApi = await importFromApp<{
        getQuestions: (params?: Record<string, unknown>) => Promise<Record<string, unknown>>;
        getQuestion: (id: number | string) => Promise<Record<string, unknown>>;
        createQuestion: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
        updateQuestion: (id: number, payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
        deleteQuestion: (id: number) => Promise<void>;
        deleteQuestionImage: (id: number) => Promise<void>;
        createAnswer: (questionId: number, payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
        updateAnswer: (id: number, payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
        deleteAnswer: (id: number) => Promise<void>;
        deleteAnswerImage: (id: number) => Promise<void>;
        acceptAnswer: (questionId: number, answerId: number) => Promise<Record<string, unknown>>;
        voteQuestion: (id: number, payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
        deleteQuestionVote: (id: number) => Promise<void>;
        voteAnswer: (id: number, payload: Record<string, unknown>) => Promise<Record<string, unknown>>;
        deleteAnswerVote: (id: number) => Promise<void>;
        addAnswerReaction: (id: number, payload: Record<string, unknown>) => Promise<unknown>;
        deleteAnswerReaction: (id: number, payload: Record<string, unknown>) => Promise<unknown>;
        createAnswerReply: (answerId: number, payload: Record<string, unknown>) => Promise<unknown>;
        updateAnswerReply: (id: number, payload: Record<string, unknown>) => Promise<unknown>;
        deleteAnswerReply: (id: number) => Promise<void>;
        addAnswerReplyReaction: (id: number, payload: Record<string, unknown>) => Promise<unknown>;
        deleteAnswerReplyReaction: (id: number, payload: Record<string, unknown>) => Promise<unknown>;
      }>(win, '/src/features/forum/api/forumApi.ts');

      const users = await usersApi.getAllUsers();
      expect(users.data[0]).to.include({ id: 1, isVerified: true });
      expect(users.data[1]).to.include({ id: 2, isVerified: false });
      await usersApi.getAllUsers({ page: 2 });
      await usersApi.getAllUsers({ page: 3 });
      await usersApi.getAllUsers({ page: 4 });
      await usersApi.getAllUsers({ page: 5 });
      await usersApi.getAllUsers({ page: 6 });
      await usersApi.getAllUsers({ page: 7 });
      await usersApi.getAllUsers({ page: 8 });
      const currentUser = await usersApi.getCurrentUser();
      expect(currentUser.data.data).to.include({ id: 1, username: 'current' });
      const publicUser = await usersApi.getUserById('public-user');
      expect(publicUser.data).to.include({ publicId: 'public-user', isVerified: true });
      const numericUser = await usersApi.getUserById('7');
      expect(numericUser.data).to.include({ bio: 'Nested bio', location: 'Rijeka', sport: true });
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
      expect(await imdbApi.searchImdbTitles('array')).to.have.length(1);
      expect(await imdbApi.searchImdbTitles('results')).to.have.length(1);
      expect(await imdbApi.searchImdbTitles('titles')).to.have.length(1);
      expect(await imdbApi.searchImdbTitles('nested')).to.have.length(1);
      expect(await imdbApi.searchImdbTitles('search')).to.have.length(1);
      expect(await imdbApi.searchImdbTitles('default')).to.have.length(1);
      try {
        await imdbApi.searchImdbTitles('fail');
        throw new Error('Expected IMDb failure');
      } catch (error) {
        expect((error as Error).message).to.equal('IMDb pretraga trenutno nije dostupna.');
      }

      const forumImage = new win.File(['forum'], 'forum.png', { type: 'image/png' });
      const questions = await forumApi.getQuestions({ page: 2, limit: 2 });
      expect(questions.data).to.have.length(1);
      expect(questions.page).to.equal(2);
      const question = await forumApi.getQuestion(501);
      expect(question.User).to.include({ id: 2, name: 'Alex Rain' });
      expect(question.Answers[0].reactions).to.have.length(2);
      expect(question.Answers[0].replies[0].reactions).to.have.length(1);
      await forumApi.createQuestion({
        title: 'Novo pitanje',
        body: 'Novo tijelo',
        categoryId: 1,
        taggedUserIds: [2, 3],
        image: forumImage,
        images: [forumImage],
      });
      await forumApi.updateQuestion(501, {
        title: 'Uredi pitanje',
        body: 'Uredi tijelo',
        categoryId: null,
        images: [forumImage],
        removeImage: true,
      });
      await forumApi.deleteQuestionImage(501);
      await forumApi.deleteQuestion(501);
      const answer = await forumApi.createAnswer(501, {
        body: 'Novi odgovor',
        taggedUserIds: [2],
        image: forumImage,
        images: [forumImage],
      });
      expect(answer.reactions).to.have.length(1);
      await forumApi.updateAnswer(702, { body: 'Uredi odgovor', images: [forumImage], removeImage: true });
      await forumApi.deleteAnswerImage(702);
      await forumApi.deleteAnswer(702);
      await forumApi.acceptAnswer(501, 702);
      await forumApi.voteQuestion(501, { value: 1 });
      await forumApi.deleteQuestionVote(501);
      await forumApi.voteAnswer(702, { value: -1 });
      await forumApi.deleteAnswerVote(702);
      await forumApi.addAnswerReaction(702, { emoji: '🙏' });
      expect(await forumApi.deleteAnswerReaction(702, { emoji: '🙏' })).to.equal(undefined);
      await forumApi.createAnswerReply(702, { body: 'Reply' });
      await forumApi.updateAnswerReply(802, { body: 'Updated reply' });
      await forumApi.deleteAnswerReply(802);
      await forumApi.addAnswerReplyReaction(802, { emoji: '❤️' });
      expect(await forumApi.deleteAnswerReplyReaction(802, { emoji: '❤️' })).to.equal(undefined);
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
              {
                id: 502,
                chatId: 44,
                fromUserId: 1,
                type: 'gif',
                message: 'https://media0.giphy.com/media/demo/giphy.gif',
                createdAt: '2026-06-08T09:35:00.000Z',
                User: { id: 1, username: 'current' },
              },
              {
                id: 503,
                chatId: 44,
                fromUserId: 2,
                type: 'text',
                securePhotoUrl: 'development/chat/photo.png',
                createdAt: '2026-06-08T09:40:00.000Z',
                User: { id: 2, username: 'alex' },
              },
              {
                id: 504,
                chatId: 44,
                fromUserId: 2,
                type: 'text',
                message: 'Bez datuma',
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
    cy.intercept('PUT', /\/notifications\/\d+\/read\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    }).as('markHarnessNotificationRead');
    cy.intercept('GET', /\/forum\/questions\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: [
          {
            id: 501,
            userId: 2,
            title: 'Hook pitanje',
            body: 'Pitanje za hook coverage.',
            createdAt: '2026-06-08T09:30:00.000Z',
            Answers: [
              {
                id: 701,
                questionId: 501,
                userId: 1,
                body: 'Moj odgovor s postojećom slikom i odgovorima.',
                createdAt: '2026-06-08T09:30:00.000Z',
                User: { id: 1, username: 'current' },
                replies: [{ id: 901, answerId: 701, userId: 1, body: 'Reply hook' }],
              },
            ],
            answerCount: 1,
          },
        ],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
      },
    });
    cy.intercept('GET', /\/forum\/questions\/501\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: {
          id: 501,
          userId: 2,
          title: 'Hook pitanje',
          body: 'Pitanje za hook coverage.',
          createdAt: '2026-06-08T09:30:00.000Z',
          Answers: [
            {
              id: 701,
              questionId: 501,
              userId: 1,
              body: 'Moj odgovor s postojećom slikom i odgovorima.',
              createdAt: '2026-06-08T09:30:00.000Z',
              User: { id: 1, username: 'current' },
              replies: [{ id: 901, answerId: 701, userId: 1, body: 'Reply hook' }],
            },
          ],
          answerCount: 1,
        },
      },
    });
    cy.intercept('POST', /\/forum\/questions\/?(?:\?.*)?$/, {
      statusCode: 201,
      body: { data: { id: 501, title: 'Hook pitanje', body: 'Pitanje', Answers: [] } },
    });
    cy.intercept('PATCH', /\/forum\/questions\/501\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 501, title: 'Hook pitanje uređeno', body: 'Pitanje', Answers: [] } },
    });
    cy.intercept('DELETE', /\/forum\/questions\/501\/image\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    });
    cy.intercept('DELETE', /\/forum\/questions\/501\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    });
    cy.intercept('POST', /\/forum\/questions\/501\/answers\/?(?:\?.*)?$/, {
      statusCode: 201,
      body: {
        data: {
          id: 703,
          questionId: 501,
          userId: 1,
          body: 'Novi hook odgovor',
          createdAt: '2026-06-08T09:45:00.000Z',
          User: { id: 1, username: 'current' },
          replies: [],
        },
      },
    });
    cy.intercept('PATCH', /\/forum\/questions\/501\/answers\/701\/accept\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 501, title: 'Hook pitanje', body: 'Pitanje', Answers: [] } },
    });
    cy.intercept('PATCH', /\/forum\/answers\/701\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 701, questionId: 501, userId: 1, body: 'Uredi odgovor hook' } },
    });
    cy.intercept('DELETE', /\/forum\/answers\/701\/image\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    });
    cy.intercept('DELETE', /\/forum\/answers\/(?:701|702)\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    });
    cy.intercept('POST', /\/forum\/questions\/501\/votes\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 501, title: 'Hook pitanje', body: 'Pitanje', Answers: [] } },
    });
    cy.intercept('DELETE', /\/forum\/questions\/501\/votes\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    });
    cy.intercept('POST', /\/forum\/answers\/701\/votes\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 701, questionId: 501, userId: 1, body: 'Vote odgovor hook' } },
    });
    cy.intercept('DELETE', /\/forum\/answers\/701\/votes\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    });
    cy.intercept('POST', /\/forum\/answers\/701\/reactions\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: {
          id: 701,
          questionId: 501,
          userId: 1,
          body: 'Reaction odgovor hook',
          reactions: [{ emoji: '🙏', count: 1, reactedByCurrentUser: true }],
        },
      },
    });
    cy.intercept('DELETE', /\/forum\/answers\/701\/reactions\/?(?:\?.*)?$/, {
      statusCode: 204,
    });
    cy.intercept('POST', /\/forum\/answers\/701\/replies\/?(?:\?.*)?$/, {
      statusCode: 201,
      body: { data: { id: 903, answerId: 701, userId: 1, body: 'Novi reply hook' } },
    });
    cy.intercept('PATCH', /\/forum\/answer-replies\/901\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { data: { id: 901, answerId: 701, userId: 1, body: 'Uredi reply hook' } },
    });
    cy.intercept('DELETE', /\/forum\/answer-replies\/902\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: { ok: true },
    });
    cy.intercept('POST', /\/forum\/answer-replies\/901\/reactions\/?(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        data: {
          id: 901,
          answerId: 701,
          userId: 1,
          body: 'Reply hook',
          reactions: [{ emoji: '👍', count: 1, reactedByCurrentUser: true }],
        },
      },
    });
    cy.intercept('DELETE', /\/forum\/answer-replies\/901\/reactions\/?(?:\?.*)?$/, {
      statusCode: 204,
    });

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
      $body.find('button').filter((_, button) => button.textContent?.includes('Nova poruka u chatu') ?? false).first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Netko je lajkao tvoju fotku.') ?? false).first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Netko je dao glas tvom pitanju.') ?? false).first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Netko je odgovorio na tvoje pitanje.') ?? false).first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Netko je odgovorio na tvoj odgovor.') ?? false).first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Obična obavijest') ?? false).first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Sakrij odgovore (2)') ?? false).first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Reakcije') ?? false).first().trigger('click');
      $body.find('button').filter((_, button) => button.textContent?.includes('Akcije') ?? false).first().trigger('click');
    });
  });
});
