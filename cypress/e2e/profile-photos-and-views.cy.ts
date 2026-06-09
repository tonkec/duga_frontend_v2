/// <reference types="cypress" />

export {};

type CurrentUser = {
  id: number;
  publicId: string;
  username: string;
  onboarding_done: boolean;
  isVerified: boolean;
};

const currentUser: CurrentUser = {
  id: 1,
  publicId: 'user-current',
  username: 'cypress_user',
  onboarding_done: true,
  isVerified: true,
};

const uploadPhotos = [
  {
    id: 810,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    description: 'Profilna fotografija',
    fileType: 'image/png',
    isProfilePhoto: true,
    name: 'profile-photo.png',
    photoType: 'profile',
    url: 'https://example.com/uploads/profile-photo.png',
    securePhotoUrl: 'https://example.com/uploads/profile-photo.png',
    userId: '1',
  },
  {
    id: 811,
    createdAt: '2026-06-02T10:00:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
    description: 'Fotografija iz chata',
    fileType: 'image/png',
    isProfilePhoto: false,
    name: 'chat-photo.png',
    photoType: 'chat',
    chatId: 301,
    messageId: 6101,
    url: 'https://example.com/uploads/chat-photo.png',
    securePhotoUrl: 'https://example.com/uploads/chat-photo.png',
    userId: '1',
  },
  {
    id: 812,
    createdAt: '2026-06-03T10:00:00.000Z',
    updatedAt: '2026-06-03T10:00:00.000Z',
    description: 'Fotografija iz komentara',
    fileType: 'image/png',
    isProfilePhoto: false,
    name: 'comment-photo.png',
    photoType: 'comment',
    commentId: 91,
    url: 'https://example.com/uploads/comment-photo.png',
    securePhotoUrl: 'https://example.com/uploads/comment-photo.png',
    userId: '1',
  },
];

const forumQuestion = {
  id: 901,
  userId: 1,
  title: 'Forum pitanje s fotografijom',
  body: 'Pitanje koje sadrži fotografiju.',
  isResolved: false,
  createdAt: '2026-06-04T10:00:00.000Z',
  updatedAt: '2026-06-04T10:00:00.000Z',
  imageUrl: 'development/forum/questions/forum-question-photo.png',
  User: currentUser,
  Answers: [
    {
      id: 902,
      questionId: 901,
      userId: 1,
      body: 'Odgovor s fotografijom.',
      isAccepted: false,
      createdAt: '2026-06-04T10:05:00.000Z',
      updatedAt: '2026-06-04T10:05:00.000Z',
      imageUrl: 'development/forum/answers/forum-answer-photo.png',
      User: currentUser,
      reactions: [],
      replies: [],
    },
  ],
  answerCount: 1,
  voteScore: 0,
};

const profileViews = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  viewerId: index + 20,
  viewedUserId: 1,
  createdAt: `2026-06-0${(index % 5) + 1}T10:00:00.000Z`,
  updatedAt: `2026-06-0${(index % 5) + 1}T10:00:00.000Z`,
  viewer: {
    id: index + 20,
    publicId: `viewer-${index + 1}`,
    username: `viewer_${index + 1}`,
    firstName: `Viewer${index + 1}`,
    lastName: 'Cypress',
  },
}));

const setupProfilePage = ({
  photos = uploadPhotos,
  forumQuestions = [forumQuestion],
  views = profileViews,
  userPhotosStatusCode = 200,
}: {
  photos?: unknown[];
  forumQuestions?: unknown[];
  views?: unknown[];
  userPhotosStatusCode?: number;
} = {}) => {
  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({
    uploads: photos,
    forumQuestions,
    users: [currentUser],
  });

  cy.intercept('GET', /\/uploads\/user\/1(?:\?.*)?$/, {
    statusCode: 200,
    body: { images: photos },
  }).as('getProfilePhotos');

  cy.intercept('GET', /\/uploads\/user-photos\/?(?:\?.*)?$/, {
    statusCode: userPhotosStatusCode,
    body: userPhotosStatusCode >= 400 ? { message: 'failed' } : photos,
  }).as('getAllUserPhotos');

  cy.intercept('GET', /\/forum\/questions\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: forumQuestions,
      total: forumQuestions.length,
      page: 1,
      limit: 100,
      totalPages: 1,
    },
  }).as('getForumQuestions');

  cy.intercept('GET', /\/forum\/questions\/901\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { data: forumQuestion },
  }).as('getForumQuestionDetails');

  cy.intercept('DELETE', /\/uploads\/delete-photo\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { ok: true },
  }).as('deletePhoto');

  cy.intercept('GET', /\/users\/profile-views(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: views,
      pagination: {
        page: 1,
        limit: 10,
        total: views.length,
        totalPages: 1,
      },
    },
  }).as('getProfileViews');

  cy.intercept('GET', /\/uploads\/files\/development\/forum\/.*\.png(?:\?.*)?$/, {
    statusCode: 200,
    headers: { 'content-type': 'image/png' },
    body: Cypress.Buffer.from('fake png contents'),
  });
};

describe('profile photos and profile views branches', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('shows upload and forum photos, opens forum links, and confirms upload deletion', () => {
    setupProfilePage();

    cy.visitAsAuthenticated('/profile?tab=all-photos');
    cy.contains('Sve fotografije').should('be.visible');
    cy.contains('Trenutno imaš 3 od maksimalno 5 profilnih fotografija.').should('be.visible');
    cy.contains('Profilna fotografija').should('be.visible');
    cy.contains('Trenutna profilna').should('be.visible');
    cy.contains('Chat fotografija').should('be.visible');
    cy.contains('Fotografija iz komentara').should('be.visible');
    cy.contains('Slika iz pitanja').should('be.visible');
    cy.contains('Slika iz odgovora').should('be.visible');

    cy.contains('button', 'Obriši').first().click();
    cy.contains('Jesi li siguran_na da želiš obrisati fotografiju?').should('be.visible');
    cy.contains('button', 'Natrag').click();
    cy.contains('button', 'Obriši').first().click();
    cy.contains('button', 'Potvrđujem').click();
    cy.wait('@deletePhoto').its('request.body').should('deep.equal', {
      url: 'https://example.com/uploads/profile-photo.png',
    });

    cy.contains('a', 'Otvori pitanje').first().click();
    cy.location('pathname').should('eq', '/forum/questions/901');
  });

  it('paginates profile views and shows the empty state', () => {
    setupProfilePage();

    cy.visitAsAuthenticated('/profile?tab=profile-views');
    cy.contains('Tko je pogledao profil').should('be.visible');
    cy.contains('@viewer_1').should('be.visible');
    cy.contains('@viewer_6').should('not.exist');
    cy.contains('1 / 2').should('be.visible');
    cy.get('[aria-label="Sljedeća stranica pregleda"]').click();
    cy.contains('@viewer_6').should('be.visible');
    cy.contains('2 / 2').should('be.visible');
    cy.get('[aria-label="Prethodna stranica pregleda"]').click();
    cy.contains('@viewer_1').should('be.visible');
  });

  it('shows empty profile views when nobody has viewed the profile yet', () => {
    setupProfilePage({ views: [] });

    cy.visitAsAuthenticated('/profile?tab=profile-views');
    cy.contains('Još nema pregleda profila').should('be.visible');
  });
});
