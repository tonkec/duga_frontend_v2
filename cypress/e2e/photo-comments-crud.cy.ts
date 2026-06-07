/// <reference types="cypress" />

export {};

type BackendUser = {
  id: number;
  username: string;
  onboarding_done: boolean;
  status?: string;
  [key: string]: unknown;
};

type PhotoComment = {
  id: number;
  comment: string;
  userId: string;
  uploadId: string;
  createdAt: string;
  updatedAt?: string;
  taggedUsers?: Array<{ id: number; publicId?: string; username: string }>;
  securePhotoUrl?: string;
  [key: string]: unknown;
};

const getRequestBodyText = (body: unknown) => {
  if (body instanceof FormData) {
    return Array.from(body.entries())
      .map(([key, value]) => `${key}:${value instanceof File ? value.name : String(value)}`)
      .join('\n');
  }

  return typeof body === 'string' ? body : JSON.stringify(body);
};

const createComment = (overrides: Partial<PhotoComment> = {}): PhotoComment => ({
  id: 9101,
  comment: 'Originalni komentar na fotografiji',
  userId: '1',
  uploadId: '801',
  createdAt: '2026-06-06T12:00:00.000Z',
  updatedAt: '2026-06-06T12:00:00.000Z',
  taggedUsers: [],
  ...overrides,
});

const setupPhotoCommentsPage = ({
  currentUser,
  profilePhoto,
  initialComments = [],
}: {
  currentUser: BackendUser;
  profilePhoto: Record<string, unknown>;
  initialComments?: PhotoComment[];
}) => {
  const photo = {
    ...profilePhoto,
    id: 801,
    securePhotoUrl: '/uploads/files/development/user/1/comment-crud-target.png',
    url: '/uploads/files/development/user/1/comment-crud-target.png',
    userId: 1,
  };
  const comments = [...initialComments];

  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ uploads: [] });

  cy.intercept('GET', /\/uploads\/photo\/801(?:\?.*)?$/, {
    statusCode: 200,
    body: photo,
  }).as('getPhoto');

  cy.intercept('GET', /\/uploads\/files\/.*comment-crud-target\.png(?:\?.*)?$/, {
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
    body: comments,
  }).as('getPhotoComments');

  cy.intercept('GET', /\/likes\/all-likes\/801(?:\?.*)?$/, {
    statusCode: 200,
    body: [],
  }).as('getPhotoLikes');

  cy.intercept('POST', /\/comments\/add-comment\/?(?:\?.*)?$/, (req) => {
    const bodyText = getRequestBodyText(req.body);
    expect(bodyText).to.include('uploadId');
    expect(bodyText).to.include('801');
    expect(bodyText).to.include('comment');
    expect(bodyText).to.include('Komentar dodan iz Cypressa');

    const comment = createComment({
      id: 9102,
      comment: 'Komentar dodan iz Cypressa',
      userId: String(currentUser.id),
      createdAt: '2026-06-06T12:05:00.000Z',
      updatedAt: '2026-06-06T12:05:00.000Z',
    });
    comments.unshift(comment);

    req.reply({
      statusCode: 201,
      body: comment,
    });
  }).as('addPhotoComment');

  cy.intercept('PUT', /\/comments\/update-comment\/9101(?:\?.*)?$/, (req) => {
    expect(req.body).to.deep.equal({
      comment: 'Komentar izmijenjen iz Cypressa',
      taggedUserIds: [],
    });

    const updatedComment = createComment({
      id: 9101,
      comment: 'Komentar izmijenjen iz Cypressa',
      userId: String(currentUser.id),
      updatedAt: '2026-06-06T12:10:00.000Z',
    });
    const index = comments.findIndex((comment) => comment.id === 9101);
    if (index >= 0) {
      comments[index] = updatedComment;
    }

    req.reply({
      statusCode: 200,
      body: updatedComment,
    });
  }).as('updatePhotoComment');

  cy.intercept('DELETE', /\/comments\/delete-comment\/9101(?:\?.*)?$/, (req) => {
    const index = comments.findIndex((comment) => comment.id === 9101);
    if (index >= 0) {
      comments.splice(index, 1);
    }

    req.reply({
      statusCode: 200,
      body: {
        id: 9101,
        uploadId: '801',
      },
    });
  }).as('deletePhotoComment');
};

describe('photo comment CRUD', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('creates a text comment on a photo', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupPhotoCommentsPage({
          currentUser,
          profilePhoto: profilePhotos.existing[0],
        });

        cy.visitAsAuthenticated('/photo/801');
        cy.getByTestId('photo-comment-form').should('be.visible');
        cy.getByTestId('photo-comments-empty').should('be.visible');

        cy.getByTestId('photo-comment-input').type('Komentar dodan iz Cypressa');
        cy.getByTestId('photo-comment-submit').click();

        cy.wait('@addPhotoComment');
        cy.contains('Komentar uspješno dodan.').should('be.visible');
        cy.getByTestId('photo-comment-card').should('contain', 'Komentar dodan iz Cypressa');
        cy.assertSocketEvent('send-comment', {
          comment: 'Komentar dodan iz Cypressa',
          uploadId: '801',
        });
      });
    });
  });

  it('edits an existing photo comment', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupPhotoCommentsPage({
          currentUser,
          profilePhoto: profilePhotos.existing[0],
          initialComments: [createComment({ userId: String(currentUser.id) })],
        });

        cy.visitAsAuthenticated('/photo/801');
        cy.getByTestId('photo-comment-card').should('contain', 'Originalni komentar na fotografiji');

        cy.getByTestId('photo-comment-edit-button').click();
        cy.getByTestId('photo-comment-edit-form').should('be.visible');
        cy.getByTestId('photo-comment-edit-input')
          .clear()
          .type('Komentar izmijenjen iz Cypressa');
        cy.getByTestId('photo-comment-edit-save').click();

        cy.wait('@updatePhotoComment');
        cy.contains('Komentar uspješno izmijenjen.').should('be.visible');
        cy.getByTestId('photo-comment-card').should('contain', 'Komentar izmijenjen iz Cypressa');
        cy.getByTestId('photo-comment-card').should(
          'not.contain',
          'Originalni komentar na fotografiji'
        );
        cy.assertSocketEvent('edit-comment', {
          data: {
            id: 9101,
            comment: 'Komentar izmijenjen iz Cypressa',
            uploadId: '801',
            taggedUsers: [],
          },
        });
      });
    });
  });

  it('deletes an existing photo comment', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupPhotoCommentsPage({
          currentUser,
          profilePhoto: profilePhotos.existing[0],
          initialComments: [createComment({ userId: String(currentUser.id) })],
        });

        cy.visitAsAuthenticated('/photo/801');
        cy.getByTestId('photo-comment-card').should('contain', 'Originalni komentar na fotografiji');

        cy.getByTestId('photo-comment-delete-button').click();
        cy.contains('Obrisati komentar?').should('be.visible');
        cy.contains('button', 'Potvrđujem').click();

        cy.wait('@deletePhotoComment');
        cy.contains('Komentar uspiješno obrisan.').should('be.visible');
        cy.getByTestId('photo-comment-card').should('not.exist');
        cy.getByTestId('photo-comments-empty').should('be.visible');
        cy.assertSocketEvent('delete-comment', {
          data: {
            id: 9101,
            uploadId: '801',
          },
        });
      });
    });
  });
});
