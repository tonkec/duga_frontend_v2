/// <reference types="cypress" />

export {};

type SocketEvent = {
  event: string;
  payload?: Record<string, unknown>;
};

type BackendUser = {
  id: number;
  username: string;
  onboarding_done: boolean;
  status?: string;
  [key: string]: unknown;
};

type ChatFixture = {
  existing: Array<{
    Users?: BackendUser[];
  }>;
};

const REKOGNITION_REJECTION_MESSAGE =
  'Fotografija nije prošla sigurnosnu provjeru sadržaja.';

const getRequestBodyText = (body: unknown) => {
  if (body instanceof FormData) {
    return Array.from(body.entries())
      .map(([key, value]) => `${key}:${value instanceof File ? value.name : String(value)}`)
      .join('\n');
  }

  return typeof body === 'string' ? body : JSON.stringify(body);
};

const imageFile = (fileName: string) => ({
  contents: Cypress.Buffer.from('fake png contents'),
  fileName,
  mimeType: 'image/png',
});

const rekognitionRejectionResponse = () => ({
    statusCode: 422,
    body: {
      message: REKOGNITION_REJECTION_MESSAGE,
      errors: [
        {
          reason: REKOGNITION_REJECTION_MESSAGE,
        },
      ],
    },
  });

const setupPhotoCommentPage = (
  currentUser: BackendUser,
  profilePhoto: Record<string, unknown>
) => {
  const photo = {
    ...profilePhoto,
    securePhotoUrl: '/uploads/files/development/user/1/comment-target.png',
    url: '/uploads/files/development/user/1/comment-target.png',
    userId: 1,
  };

  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ uploads: [] });

  cy.intercept('GET', /\/uploads\/photo\/801(?:\?.*)?$/, {
    statusCode: 200,
    body: photo,
  }).as('getPhoto');

  cy.intercept('GET', /\/uploads\/files\/.*comment-target\.png(?:\?.*)?$/, {
    statusCode: 200,
    headers: { 'content-type': 'image/png' },
    body: Cypress.Buffer.from('fake png contents'),
  });

  cy.intercept('GET', /\/users\/1(?:\?.*)?$/, {
    statusCode: 200,
    body: currentUser,
  }).as('getPhotoOwner');

  cy.intercept('GET', /\/comments\/get-comments\/801(?:\?.*)?$/, {
    statusCode: 200,
    body: [],
  }).as('getPhotoComments');

  cy.intercept('GET', /\/likes\/all-likes\/801(?:\?.*)?$/, {
    statusCode: 200,
    body: [],
  }).as('getPhotoLikes');
};

const setupProfilePhotoEditor = (
  currentUser: BackendUser,
  existingPhotos: Record<string, unknown>[]
) => {
  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ uploads: existingPhotos, forumQuestions: [] });

  cy.intercept('GET', /\/uploads\/user\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: { images: existingPhotos },
  }).as('getProfilePhotos');

  cy.intercept('GET', /\/uploads\/user-photos\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: existingPhotos,
  }).as('getAllUserPhotos');
};

const setupExistingChat = (
  currentUser: BackendUser,
  chats: ChatFixture,
  messages: Record<string, unknown>
) => {
  const otherUser = chats.existing[0]?.Users?.find(
    (user) => Number(user.id) !== Number(currentUser.id)
  );

  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ chats: chats.existing, uploads: [] });

  if (otherUser) {
    cy.intercept('GET', `**/users/${otherUser.id}**`, {
      statusCode: 200,
      body: otherUser,
    }).as('getOtherChatUser');
  }

  cy.intercept('GET', /\/chats\/messages\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: messages.existingChat,
  }).as('getMessages');
};

const expectNoSocketEvent = (
  predicate: (event: SocketEvent) => boolean,
  label: string
) => {
  cy.window().should((win) => {
    const events = (
      win as Window & {
        __dugaCypressSocketEvents?: SocketEvent[];
      }
    ).__dugaCypressSocketEvents;

    expect(Boolean(events?.some(predicate)), label).to.equal(false);
  });
};

describe('AWS Rekognition photo moderation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('accepts a clean photo attached to a comment', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupPhotoCommentPage(currentUser, profilePhotos.existing[0]);

        cy.intercept('POST', /\/comments\/add-comment\/?(?:\?.*)?$/, (req) => {
          const bodyText = getRequestBodyText(req.body);
          expect(bodyText).to.include('cleancomment.png');
          expect(bodyText).to.include('Rekognition clean comment');

          req.reply({
            statusCode: 201,
            body: {
              id: 9001,
              uploadId: 801,
              userId: currentUser.id,
              comment: 'Rekognition clean comment',
              commentImageUrl: '/uploads/files/development/comments/cleancomment.png',
              createdAt: '2026-06-06T12:00:00.000Z',
              updatedAt: '2026-06-06T12:00:00.000Z',
              User: currentUser,
            },
          });
        }).as('addComment');

        cy.visitAsAuthenticated('/photo/801');
        cy.getByTestId('photo-comment-form').should('be.visible');
        cy.getByTestId('photo-comment-input').type('Rekognition clean comment');
        cy.getByTestId('photo-comment-file-input').selectFile(imageFile('clean-comment.png'), {
          force: true,
        });
        cy.getByTestId('photo-comment-submit').click();

        cy.wait('@addComment');
        cy.contains('Komentar uspješno dodan.').should('be.visible');
        cy.assertSocketEvent('send-comment', { comment: 'Rekognition clean comment' });
      });
    });
  });

  it('rejects an unsafe photo attached to a comment', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupPhotoCommentPage(currentUser, profilePhotos.existing[0]);

        cy.intercept('POST', /\/comments\/add-comment\/?(?:\?.*)?$/, (req) => {
          expect(getRequestBodyText(req.body)).to.include('unsafecomment.png');
          req.reply(rekognitionRejectionResponse());
        }).as('addComment');

        cy.visitAsAuthenticated('/photo/801');
        cy.getByTestId('photo-comment-form').should('be.visible');
        cy.getByTestId('photo-comment-input').type('Comment text should remain');
        cy.getByTestId('photo-comment-file-input').selectFile(imageFile('unsafe-comment.png'), {
          force: true,
        });
        cy.getByTestId('photo-comment-submit').click();

        cy.wait('@addComment');
        cy.contains(REKOGNITION_REJECTION_MESSAGE).should('be.visible');
        cy.getByTestId('photo-comment-input').should('have.value', 'Comment text should remain');
        expectNoSocketEvent((event) => event.event === 'send-comment', 'blocked comment socket');
      });
    });
  });

  it('accepts a clean profile photo upload', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupProfilePhotoEditor(currentUser, profilePhotos.existing);

        cy.intercept('POST', /\/uploads\/photos\/?(?:\?.*)?$/, (req) => {
          expect(getRequestBodyText(req.body)).to.include('cleanprofile.png');
          req.reply({
            statusCode: 200,
            body: {
              images: [...profilePhotos.existing, profilePhotos.uploaded],
            },
          });
        }).as('uploadProfilePhoto');

        cy.visitAsAuthenticated('/edit?tab=1');
        cy.getByTestId('profile-photo-upload-form').should('be.visible');
        cy.getByTestId('profile-photo-file-input').selectFile(imageFile('clean-profile.png'), {
          force: true,
        });
        cy.contains('clean-profile.png').should('be.visible');
        cy.getByTestId('profile-photo-upload-submit').click();

        cy.wait('@uploadProfilePhoto');
        cy.contains('Fotografije uspješno spremljene').should('be.visible');
      });
    });
  });

  it('rejects an unsafe profile photo upload', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupProfilePhotoEditor(currentUser, profilePhotos.existing);

        cy.intercept('POST', /\/uploads\/photos\/?(?:\?.*)?$/, (req) => {
          expect(getRequestBodyText(req.body)).to.include('unsafeprofile.png');
          req.reply(rekognitionRejectionResponse());
        }).as('uploadProfilePhoto');

        cy.visitAsAuthenticated('/edit?tab=1');
        cy.getByTestId('profile-photo-upload-form').should('be.visible');
        cy.getByTestId('profile-photo-file-input').selectFile(imageFile('unsafe-profile.png'), {
          force: true,
        });
        cy.getByTestId('profile-photo-upload-submit').click();

        cy.wait('@uploadProfilePhoto');
        cy.contains(REKOGNITION_REJECTION_MESSAGE).should('be.visible');
        cy.contains('unsafe-profile.png').should('be.visible');
      });
    });
  });

  it('accepts a clean chat photo message', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('chats').then((chats) => {
        cy.fixture('messages').then((messages) => {
          setupExistingChat(currentUser, chats, messages);

          cy.intercept('POST', /\/uploads\/message-photos\/?(?:\?.*)?$/, (req) => {
            expect(getRequestBodyText(req.body)).to.include('cleanchat.png');
            req.reply({ statusCode: 201, body: { ok: true } });
          }).as('uploadChatPhoto');

          cy.visitAsAuthenticated('/chat/201');
          cy.getByTestId('chat-page').should('be.visible');
          cy.wait('@getMessages');
          cy.getByTestId('chat-photo-file-input').selectFile(imageFile('clean-chat.png'), {
            force: true,
          });
          cy.getByTestId('chat-message-submit').click();

          cy.wait('@uploadChatPhoto');
          cy.window()
            .its('__dugaCypressSocketEvents')
            .should((events: SocketEvent[] | undefined) => {
              const fileMessage = events?.find(
                (event) => event.event === 'message' && event.payload?.type === 'file'
              );

              expect(fileMessage?.payload).to.deep.include({
                type: 'file',
                chatId: '201',
                message: null,
              });
              expect(String(fileMessage?.payload?.messagePhotoUrl)).to.include('cleanchat.png');
            });
        });
      });
    });
  });

  it('rejects an unsafe chat photo message', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('chats').then((chats) => {
        cy.fixture('messages').then((messages) => {
          setupExistingChat(currentUser, chats, messages);

          cy.intercept('POST', /\/uploads\/message-photos\/?(?:\?.*)?$/, (req) => {
            expect(getRequestBodyText(req.body)).to.include('unsafechat.png');
            req.reply(rekognitionRejectionResponse());
          }).as('uploadChatPhoto');

          cy.visitAsAuthenticated('/chat/201');
          cy.getByTestId('chat-page').should('be.visible');
          cy.wait('@getMessages');
          cy.getByTestId('chat-photo-file-input').selectFile(imageFile('unsafe-chat.png'), {
            force: true,
          });
          cy.getByTestId('chat-message-submit').click();

          cy.wait('@uploadChatPhoto');
          cy.contains(REKOGNITION_REJECTION_MESSAGE).should('be.visible');
          expectNoSocketEvent(
            (event) => event.event === 'message' && event.payload?.type === 'file',
            'blocked chat photo socket'
          );
        });
      });
    });
  });
});
