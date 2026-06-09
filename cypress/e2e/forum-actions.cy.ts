/// <reference types="cypress" />

export {};

type UserFixture = {
  id: number;
  publicId: string;
  username: string;
  name: string;
  onboarding_done?: boolean;
  isVerified?: boolean;
};

type ForumAnswerReply = {
  id: number;
  answerId: number;
  userId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  User: UserFixture;
  reactions?: Array<{ emoji: string; count: number; userIds?: number[] }>;
  userReactions?: string[];
};

type ForumAnswer = {
  id: number;
  questionId: number;
  userId: number;
  body: string;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  User: UserFixture;
  reactions?: Array<{ emoji: string; count: number; userIds?: number[] }>;
  userReactions?: string[];
  replies?: ForumAnswerReply[];
  securePhotoUrl?: string;
};

type ForumQuestion = {
  id: number;
  userId: number;
  title: string;
  body: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  User: UserFixture;
  Category?: { id: number; name: string; slug: string };
  Answers: ForumAnswer[];
  answerCount: number;
  voteScore: number;
  currentUserVote?: 1 | -1 | null;
  securePhotoUrl?: string;
};

const currentUser: UserFixture = {
  id: 1,
  publicId: 'user-current',
  username: 'cypress_user',
  name: 'Cypress User',
  onboarding_done: true,
  isVerified: true,
};

const alex: UserFixture = {
  id: 2,
  publicId: 'user-alex',
  username: 'alex_rain',
  name: 'Alex Rain',
  onboarding_done: true,
  isVerified: true,
};

const mira: UserFixture = {
  id: 3,
  publicId: 'user-mira',
  username: 'mira_sun',
  name: 'Mira Sun',
  onboarding_done: true,
  isVerified: true,
};

const imageFile = (fileName: string, mimeType = 'image/png') => ({
  contents: Cypress.Buffer.from('fake image contents'),
  fileName,
  mimeType,
});

const isDocumentNavigation = (req: { headers: Record<string, string | string[] | undefined> }) => {
  const acceptHeader = req.headers.accept;
  const accept = Array.isArray(acceptHeader) ? acceptHeader.join(',') : acceptHeader ?? '';
  return accept.includes('text/html');
};

const makeQuestion = ({
  owner = currentUser,
  id = 401,
  currentUserVote = null,
}: {
  owner?: UserFixture;
  id?: number;
  currentUserVote?: 1 | -1 | null;
} = {}): ForumQuestion => ({
  id,
  userId: owner.id,
  title: 'Cypress forum pitanje s akcijama',
  body: 'Ovo pitanje ima dovoljno sadržaja za testiranje uređivanja, slika i odgovora.',
  isResolved: false,
  createdAt: '2026-06-08T09:00:00.000Z',
  updatedAt: '2026-06-08T09:00:00.000Z',
  User: owner,
  Category: { id: 1, name: 'Odnosi', slug: 'odnosi' },
  securePhotoUrl: '/uploads/files/development/forum/questions/question-action.png',
  voteScore: 2,
  currentUserVote,
  answerCount: 2,
  Answers: [
    {
      id: 501,
      questionId: id,
      userId: alex.id,
      body: 'Odgovor druge osobe koji vlasnik pitanja može prihvatiti.',
      isAccepted: false,
      createdAt: '2026-06-08T09:10:00.000Z',
      updatedAt: '2026-06-08T09:10:00.000Z',
      User: alex,
      reactions: [{ emoji: '👍', count: 1, userIds: [alex.id] }],
      replies: [],
    },
    {
      id: 502,
      questionId: id,
      userId: currentUser.id,
      body: 'Moj odgovor koji mogu uređivati i brisati.',
      isAccepted: false,
      createdAt: '2026-06-08T09:20:00.000Z',
      updatedAt: '2026-06-08T09:20:00.000Z',
      User: currentUser,
      securePhotoUrl: '/uploads/files/development/forum/answers/answer-action.png',
      reactions: [{ emoji: '❤️', count: 1, userIds: [currentUser.id] }],
      userReactions: ['❤️'],
      replies: [
        {
          id: 701,
          answerId: 502,
          userId: currentUser.id,
          body: 'Moj odgovor na odgovor.',
          createdAt: '2026-06-08T09:25:00.000Z',
          updatedAt: '2026-06-08T09:25:00.000Z',
          User: currentUser,
          reactions: [{ emoji: '🎉', count: 1, userIds: [currentUser.id] }],
          userReactions: ['🎉'],
        },
      ],
    },
  ],
});

const setupForumActions = (initialQuestion: ForumQuestion) => {
  let question = structuredClone(initialQuestion);

  const replyQuestion = () => ({
    statusCode: 200,
    body: { data: question },
  });

  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi({ users: [currentUser, alex, mira], forumQuestions: [question] });

  cy.intercept('GET', /\/forum\/questions\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { data: [question], total: 1, page: 1, limit: 10, totalPages: 1 },
  }).as('getForumQuestions');

  cy.intercept('GET', new RegExp(`/forum/questions/${question.id}/?(?:\\?.*)?$`), (req) => {
    if (isDocumentNavigation(req)) {
      req.continue();
      return;
    }

    req.reply(replyQuestion());
  }).as('getForumQuestion');

  cy.intercept('POST', /\/forum\/questions\/?(?:\?.*)?$/, {
    statusCode: 201,
    body: { data: { ...question, id: 499, title: 'Validno Cypress pitanje' } },
  }).as('createQuestion');

  cy.intercept('PATCH', new RegExp(`/forum/questions/${question.id}/?(?:\\?.*)?$`), (req) => {
    question = {
      ...question,
      title: 'Uređeno Cypress forum pitanje',
      body: 'Uređeni opis pitanja s dovoljno teksta.',
      securePhotoUrl: undefined,
    };
    req.reply(replyQuestion());
  }).as('updateQuestion');

  cy.intercept('DELETE', new RegExp(`/forum/questions/${question.id}/image/?(?:\\?.*)?$`), {
    statusCode: 200,
    body: { ok: true },
  }).as('deleteQuestionImage');

  cy.intercept('DELETE', new RegExp(`/forum/questions/${question.id}/?(?:\\?.*)?$`), {
    statusCode: 200,
    body: { ok: true },
  }).as('deleteQuestion');

  cy.intercept(
    'PATCH',
    new RegExp(`/forum/questions/${question.id}/answers/501/accept/?(?:\\?.*)?$`),
    (req) => {
      question = {
        ...question,
        isResolved: true,
        Answers: question.Answers.map((answer) => ({
          ...answer,
          isAccepted: answer.id === 501,
        })),
      };
      req.reply(replyQuestion());
    }
  ).as('acceptAnswer');

  cy.intercept('POST', new RegExp(`/forum/questions/${question.id}/votes/?(?:\\?.*)?$`), (req) => {
    const value = Number(req.body?.value) as 1 | -1;
    question = {
      ...question,
      currentUserVote: value,
      voteScore: question.voteScore + value,
    };
    req.reply(replyQuestion());
  }).as('voteQuestion');

  cy.intercept('DELETE', new RegExp(`/forum/questions/${question.id}/votes/?(?:\\?.*)?$`), (req) => {
    question = {
      ...question,
      currentUserVote: null,
      voteScore: Math.max(0, question.voteScore - 1),
    };
    req.reply({ statusCode: 200, body: { ok: true } });
  }).as('clearQuestionVote');

  cy.intercept('POST', /\/forum\/answers\/501\/reactions\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        ...question.Answers[0],
        reactions: [
          ...(question.Answers[0].reactions ?? []),
          { emoji: '🎉', count: 1, userIds: [currentUser.id] },
        ],
        userReactions: ['🎉'],
      },
    },
  }).as('addAnswerReaction');

  cy.intercept('POST', new RegExp(`/forum/questions/${question.id}/answers/?(?:\\?.*)?$`), {
    statusCode: 201,
    body: {
      data: {
        id: 503,
        questionId: question.id,
        userId: currentUser.id,
        body: 'Valjani odgovor iz forme https://media0.giphy.com/media/forum-original/giphy.gif',
        isAccepted: false,
        createdAt: '2026-06-08T09:40:00.000Z',
        updatedAt: '2026-06-08T09:40:00.000Z',
        User: currentUser,
        reactions: [],
        replies: [],
      },
    },
  }).as('createAnswerFromForm');

  cy.intercept('DELETE', /\/forum\/answers\/502\/reactions\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { data: { ...question.Answers[1], reactions: [], userReactions: [] } },
  }).as('deleteAnswerReaction');

  cy.intercept('PATCH', /\/forum\/answers\/502\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        ...question.Answers[1],
        body: 'Uređeni odgovor iz Cypress testa.',
      },
    },
  }).as('updateAnswer');

  cy.intercept('DELETE', /\/forum\/answers\/502\/image\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { ok: true },
  }).as('deleteAnswerImage');

  cy.intercept('DELETE', /\/forum\/answers\/502\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { ok: true },
  }).as('deleteAnswer');

  cy.intercept('POST', /\/forum\/answers\/501\/replies\/?(?:\?.*)?$/, {
    statusCode: 201,
    body: {
      data: {
        id: 702,
        answerId: 501,
        userId: currentUser.id,
        body: 'Novi odgovor na odgovor iz Cypress testa.',
        createdAt: '2026-06-08T09:30:00.000Z',
        updatedAt: '2026-06-08T09:30:00.000Z',
        User: currentUser,
        reactions: [],
      },
    },
  }).as('createReply');

  cy.intercept('PATCH', /\/forum\/answer-replies\/701\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        ...question.Answers[1].replies?.[0],
        body: 'Uređeni odgovor na odgovor.',
      },
    },
  }).as('updateReply');

  cy.intercept('DELETE', /\/forum\/answer-replies\/701\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: { ok: true },
  }).as('deleteReply');

  cy.intercept('POST', /\/forum\/answer-replies\/701\/reactions\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        ...question.Answers[1].replies?.[0],
        reactions: [{ emoji: '🙏', count: 1, userIds: [currentUser.id] }],
        userReactions: ['🙏'],
      },
    },
  }).as('addReplyReaction');

  cy.intercept('DELETE', /\/forum\/answer-replies\/701\/reactions\/?(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        ...question.Answers[1].replies?.[0],
        reactions: [],
        userReactions: [],
      },
    },
  }).as('deleteReplyReaction');

  cy.intercept('GET', /\/uploads\/files\/.*(?:question-action|answer-action)\.png(?:\?.*)?$/, {
    statusCode: 200,
    headers: { 'content-type': 'image/png' },
    body: Cypress.Buffer.from('fake png contents'),
  });

  cy.intercept('GET', 'https://api.giphy.com/v1/gifs/**', {
    statusCode: 200,
    body: {
      data: [
        {
          id: 'forum-gif',
          title: 'Forum GIF',
          images: {
            fixed_height: { url: 'https://media0.giphy.com/media/forum-preview/giphy.gif' },
            original: { url: 'https://media0.giphy.com/media/forum-original/giphy.gif' },
          },
        },
      ],
    },
  }).as('getForumGifs');
};

describe('forum branch-heavy actions', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('validates question form fields, image selection, and GIF selection', () => {
    setupForumActions(makeQuestion());

    cy.visitAsAuthenticated('/forum/ask');
    cy.getByTestId('forum-question-form').should('be.visible');
    cy.contains('button', 'Objavi pitanje').click();
    cy.contains('Naslov je obavezan.').should('be.visible');
    cy.contains('Opis je obavezan.').should('be.visible');

    cy.getByTestId('forum-question-title').type('Krat');
    cy.getByTestId('forum-question-body').type('kratko');
    cy.contains('button', 'Objavi pitanje').click();
    cy.contains('Naslov mora imati barem 5 znakova.').should('be.visible');
    cy.contains('Opis mora imati barem 10 znakova.').should('be.visible');

    cy.get('#question-image').selectFile(imageFile('forum.txt', 'text/plain'), { force: true });
    cy.contains('Podržani formati').should('be.visible');
    cy.get('#question-image').selectFile(imageFile('forum-question.png'), { force: true });
    cy.contains('forum-question.png').should('be.visible');

    cy.contains('button', 'GIF').click();
    cy.wait('@getForumGifs');
    cy.get('img[alt="Forum GIF"]').parent('button').click();
    cy.get('img[alt="Odabrani GIF"]').should('be.visible');

    cy.getByTestId('forum-question-title').clear().type('Validno Cypress pitanje');
    cy.getByTestId('forum-question-body')
      .clear()
      .type('Validan opis pitanja s dovoljno teksta za slanje.');
    cy.contains('button', 'Objavi pitanje').click();
    cy.wait('@createQuestion');
  });

  it('edits and deletes an owned question with image removal', () => {
    setupForumActions(makeQuestion({ owner: currentUser }));

    cy.visitAsAuthenticated('/forum/questions/401');
    cy.getByTestId('forum-question-details-page').should('be.visible');
    cy.contains('button', 'Akcije').first().click();
    cy.contains('button', 'Uredi pitanje').click();
    cy.getByTestId('forum-question-title').clear().type('Uređeno Cypress forum pitanje');
    cy.getByTestId('forum-question-body').clear().type('Uređeni opis pitanja s dovoljno teksta.');
    cy.contains('button', 'Makni postojeću').click();
    cy.wait('@deleteQuestionImage');
    cy.contains('Postojeća slika se uklanja.').should('be.visible');
    cy.contains('button', 'Spremi pitanje').click();
    cy.wait('@updateQuestion');
    cy.contains('Uređeno Cypress forum pitanje').should('be.visible');

    cy.contains('button', 'Akcije').first().click();
    cy.contains('button', 'Obriši pitanje').click();
    cy.contains('Obrisati pitanje?').should('be.visible');
    cy.contains('button', 'Natrag').click();
  });

  it('validates answer form and submits an answer with image and GIF content', () => {
    setupForumActions(makeQuestion({ owner: alex }));

    cy.visitAsAuthenticated('/forum/questions/401');
    cy.getByTestId('forum-question-details-page').should('be.visible');
    cy.getByTestId('forum-answer-form').within(() => {
      cy.getByTestId('forum-answer-submit').click();
    });
    cy.contains('Odgovor je obavezan.').should('be.visible');

    cy.getByTestId('forum-answer-body').type('a');
    cy.getByTestId('forum-answer-submit').click();
    cy.contains('Odgovor mora imati barem 2 znaka.').should('be.visible');

    cy.get('#answer-image').selectFile(imageFile('answer.txt', 'text/plain'), { force: true });
    cy.contains('Možeš dodati samo slike').should('be.visible');
    cy.get('#answer-image').selectFile(imageFile('answer-form.png'), { force: true });
    cy.get('img[alt="Pregled slike odgovora 1"]').should('be.visible');
    cy.getByTestId('forum-answer-form').within(() => {
      cy.contains('button', 'Makni').click();
    });
    cy.get('img[alt="Pregled slike odgovora 1"]').should('not.exist');
    cy.get('#answer-image').selectFile(imageFile('answer-form.png'), { force: true });

    cy.getByTestId('forum-answer-body').clear().type('Valjani odgovor iz forme');
    cy.getByTestId('forum-answer-form').within(() => {
      cy.contains('button', 'GIF').click();
    });
    cy.wait('@getForumGifs');
    cy.get('img[alt="Forum GIF"]').parent('button').click();
    cy.get('img[alt="Odabrani GIF"]').should('be.visible');
    cy.getByTestId('forum-answer-submit').click();
    cy.wait('@createAnswerFromForm');
    cy.contains('Valjani odgovor iz forme').should('be.visible');
  });

  it('accepts answers, edits own answer and reply, and toggles reactions', () => {
    setupForumActions(makeQuestion({ owner: currentUser }));

    cy.visitAsAuthenticated('/forum/questions/401');
    cy.getByTestId('forum-question-details-page').should('be.visible');

    cy.contains('[data-testid="forum-answer-card"]', 'Odgovor druge osobe').within(() => {
      cy.contains('button', 'Akcije').click();
      cy.contains('button', 'Prihvati odgovor').click();
    });
    cy.wait('@acceptAnswer');
    cy.contains('Prihvaćen odgovor').should('be.visible');

    cy.contains('[data-testid="forum-answer-card"]', 'Odgovor druge osobe').within(() => {
      cy.contains('button', 'Akcije').click();
      cy.get('[aria-label="Dodaj reakciju 🎉"]').click();
      cy.contains('button', 'Odgovori').click();
      cy.get('textarea[placeholder="Napiši odgovor na ovaj odgovor..."]').type(
        'Novi odgovor na odgovor iz Cypress testa.'
      );
      cy.contains('button', 'Odgovori').click();
    });
    cy.wait('@addAnswerReaction');
    cy.wait('@createReply');

    cy.contains('[data-testid="forum-answer-card"]', 'Moj odgovor koji mogu uređivati').within(() => {
      cy.contains('button', 'Akcije').click();
      cy.get('[aria-label="Makni reakciju ❤️"]').click();
      cy.contains('button', 'Akcije').click();
      cy.contains('button', 'Uredi').click();
      cy.get('textarea').first().clear().type('Uređeni odgovor iz Cypress testa.');
      cy.contains('button', 'Odustani').click();
    });
    cy.wait('@deleteAnswerReaction');

    cy.contains('[data-testid="forum-answer-card"]', 'Moj odgovor koji mogu uređivati').within(() => {
      cy.contains('Sakrij odgovore (1)').click();
      cy.contains('Prikaži odgovore (1)').should('be.visible');
      cy.contains('Prikaži odgovore (1)').click();
      cy.contains('button', 'Reakcije').click();
      cy.get('[aria-label="Makni reakciju 🎉"]').click();
      cy.get('[aria-label="Dodaj reakciju 🙏"]').click();
      cy.contains('button', 'Uredi').click();
      cy.get('textarea').last().clear().type('Uređeni odgovor na odgovor.');
      cy.contains('button', 'Spremi').click();
    });
    cy.wait('@deleteReplyReaction');
    cy.wait('@addReplyReaction');
    cy.wait('@updateReply');

    cy.contains('[data-testid="forum-answer-card"]', 'Moj odgovor koji mogu uređivati').within(() => {
      cy.contains('button', 'Obriši').click();
    });
    cy.contains('Obrisati odgovor na odgovor?').should('be.visible');
    cy.contains('button', 'Potvrđujem').click();
    cy.wait('@deleteReply');
  });

  it('votes and clears votes on a question owned by another user', () => {
    setupForumActions(makeQuestion({ owner: alex, currentUserVote: null }));

    cy.visitAsAuthenticated('/forum/questions/401');
    cy.getByTestId('forum-question-details-page').should('be.visible');
    cy.get('[aria-label="Glasaj za"]').click();
    cy.wait('@voteQuestion');
    cy.get('[aria-label="Glasaj za"]').should('have.class', 'bg-blue');
    cy.get('[aria-label="Glasaj za"]').click();
    cy.wait('@clearQuestionVote');
  });
});
