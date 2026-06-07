/// <reference types="cypress" />

export {};

type ProfilePhoto = {
  id: number;
  name: string;
  description: string;
  isProfilePhoto: boolean;
  securePhotoUrl: string;
  url: string;
  userId: string;
  [key: string]: unknown;
};

const getRequestBodyText = (body: unknown) => {
  if (body instanceof FormData) {
    return String(body.get('text') ?? '');
  }

  return typeof body === 'string' ? body : JSON.stringify(body);
};

const setupProfilePhotoMocks = ({
  currentUser,
  initialPhotos,
  uploadedPhoto,
}: {
  currentUser: Record<string, unknown> & { id: number; username: string; onboarding_done: boolean };
  initialPhotos: ProfilePhoto[];
  uploadedPhoto: ProfilePhoto;
}) => {
  let photos = [...initialPhotos];

  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ forumQuestions: [] });

  cy.intercept('GET', /\/uploads\/user\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: { images: photos },
  }).as('getProfilePhotos');

  cy.intercept('GET', /\/uploads\/user-photos\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: photos,
  }).as('getAllUserPhotos');

  cy.intercept('POST', /\/uploads\/photos\/?(?:\?.*)?$/, (req) => {
    const text = getRequestBodyText(req.body);

    if (text.includes('candidate-profile.png')) {
      photos = photos.map((photo) => ({
        ...photo,
        isProfilePhoto: photo.name === 'candidate-profile.png',
      }));
    } else {
      photos = [...photos, uploadedPhoto];
    }

    req.reply({
      statusCode: 200,
      body: { images: photos },
    });
  }).as('saveProfilePhotos');

  cy.intercept('DELETE', /\/uploads\/delete-photo\/?(?:\?.*)?$/, (req) => {
    const deletedUrl = req.body?.url;
    photos = photos.filter((photo) => !photo.securePhotoUrl.includes(String(deletedUrl)));
    req.reply({
      statusCode: 200,
      body: { ok: true },
    });
  }).as('deleteProfilePhoto');
};

const openPhotoEditor = () => {
  cy.visitAsAuthenticated('/edit?tab=1');
  cy.getByTestId('profile-photo-upload-form').should('be.visible');
};

describe('profile photo CRUD', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('uploads a new profile photo', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupProfilePhotoMocks({
          currentUser,
          initialPhotos: profilePhotos.existing,
          uploadedPhoto: profilePhotos.uploaded,
        });

        openPhotoEditor();

        cy.getByTestId('profile-photo-file-input').selectFile(
          {
            contents: Cypress.Buffer.from('fake png contents'),
            fileName: 'cypress-profile.png',
            mimeType: 'image/png',
          },
          { force: true }
        );
        cy.contains('cypress-profile.png').should('be.visible');
        cy.getByTestId('profile-photo-upload-submit').click();

        cy.wait('@saveProfilePhotos').then((interception) => {
          expect(Boolean(interception.request.body)).to.equal(true);
        });
      });
    });
  });

  it('sets an existing photo as the profile photo', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupProfilePhotoMocks({
          currentUser,
          initialPhotos: profilePhotos.existing,
          uploadedPhoto: profilePhotos.uploaded,
        });

        openPhotoEditor();

        cy.getByTestId('profile-photo-edit-card').eq(1).within(() => {
          cy.getByTestId('profile-photo-checkbox').check({ force: true });
        });
        cy.getByTestId('profile-photo-save-changes').click();

        cy.wait('@saveProfilePhotos').then((interception) => {
          const text = getRequestBodyText(interception.request.body);
          expect(text).to.include('"imageId":"candidateprofile.png"');
          expect(text).to.include('"isProfilePhoto":true');
        });
      });
    });
  });

  it('deletes an existing profile photo', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('profile-photos').then((profilePhotos) => {
        setupProfilePhotoMocks({
          currentUser,
          initialPhotos: profilePhotos.existing,
          uploadedPhoto: profilePhotos.uploaded,
        });

        openPhotoEditor();

        cy.getByTestId('profile-photo-edit-card').eq(1).within(() => {
          cy.getByTestId('profile-photo-delete-button').click();
        });
        cy.contains('button', 'Potvrđujem').click();

        cy.wait('@deleteProfilePhoto').then((interception) => {
          expect(interception.request.body).to.deep.equal({
            url: 'https://example.com/uploads/candidate-profile.png',
          });
        });
      });
    });
  });
});
