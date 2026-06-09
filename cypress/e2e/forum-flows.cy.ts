/// <reference types="cypress" />

export {};

type ForumFixture = {
  question: Record<string, unknown> & { Answers?: unknown[] };
  createdQuestion: Record<string, unknown>;
  createdAnswer: Record<string, unknown>;
  emptyResponse: Record<string, unknown>;
};

type BackendUserFixture = {
  id: number;
  username: string;
  onboarding_done: boolean;
  publicId?: string;
  email?: string;
  age?: string | number;
  isVerified?: boolean;
  status?: string;
  [key: string]: unknown;
};

const forumListUrl = /\/forum\/questions\/?(?:\?.*)?$/;
const forumQuestionUrl = (id: number) => new RegExp(`/forum/questions/${id}/?(?:\\?.*)?$`);
const forumAnswersUrl = (questionId: number) =>
  new RegExp(`/forum/questions/${questionId}/answers/?(?:\\?.*)?$`);
const isDocumentNavigation = (req: { headers: Record<string, string | string[] | undefined> }) => {
  const acceptHeader = req.headers.accept;
  const accept = Array.isArray(acceptHeader) ? acceptHeader.join(',') : acceptHeader ?? '';
  return accept.includes('text/html');
};

const setupForumMocks = ({
  forum,
  currentUser,
  isEmpty = false,
  questions,
}: {
  forum: ForumFixture;
  currentUser: BackendUserFixture;
  isEmpty?: boolean;
  questions?: Array<Record<string, unknown> & { id: number; Answers?: unknown[] }>;
}) => {
  let createdAnswer: unknown | null = null;
  const forumQuestions = questions ?? [forum.question as Record<string, unknown> & { id: number }];
  const getQuestion = () => ({
    ...forum.question,
    Answers: createdAnswer
      ? [...(forum.question.Answers ?? []), createdAnswer]
      : (forum.question.Answers ?? []),
    answerCount: createdAnswer ? (forum.question.Answers ?? []).length + 1 : 1,
  });

  cy.mockAuthenticatedSession({ currentUser });
  cy.mockDefaultApi();

  cy.intercept('GET', forumListUrl, {
    statusCode: 200,
    body: isEmpty
      ? forum.emptyResponse
      : {
          data: forumQuestions,
          total: forumQuestions.length,
          page: 1,
          limit: 10,
          totalPages: Math.max(1, Math.ceil(forumQuestions.length / 10)),
        },
  }).as('getForumQuestions');

  cy.intercept('GET', /\/forum\/questions\/\d+\/?(?:\?.*)?$/, (req) => {
    if (isDocumentNavigation(req)) {
      req.continue();
      return;
    }

    const id = Number(req.url.match(/\/forum\/questions\/(\d+)/)?.[1]);
    const question = forumQuestions.find((item) => Number(item.id) === id);

    req.reply({
      statusCode: question ? 200 : 404,
      body: question ? { data: question } : { message: 'Not found' },
    });
  }).as('getAnyForumQuestion');

  cy.intercept('GET', forumQuestionUrl(101), (req) => {
    if (isDocumentNavigation(req)) {
      req.continue();
      return;
    }

    req.reply({
      statusCode: 200,
      body: { data: getQuestion() },
    });
  }).as('getForumQuestion');

  cy.intercept('GET', forumQuestionUrl(102), (req) => {
    if (isDocumentNavigation(req)) {
      req.continue();
      return;
    }

    req.reply({
      statusCode: 200,
      body: { data: forum.createdQuestion },
    });
  }).as('getCreatedForumQuestion');

  cy.intercept('POST', forumListUrl, (req) => {
    req.reply({
      statusCode: 201,
      body: { data: forum.createdQuestion },
    });
  }).as('createForumQuestion');

  cy.intercept('POST', forumAnswersUrl(101), (req) => {
    createdAnswer = forum.createdAnswer;
    req.reply({
      statusCode: 201,
      body: { data: forum.createdAnswer },
    });
  }).as('createForumAnswer');
};

describe('forum questions and answers', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('shows the forum question list and opens a question with answers', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('forum').then((forum) => {
        setupForumMocks({ forum, currentUser });

        cy.visitAsAuthenticated('/forum');

        cy.getByTestId('forum-questions-page').should('be.visible');
        cy.contains('h1', 'Pitanja zajednice').should('be.visible');
        cy.getByTestId('forum-question-card').should('contain', forum.question.title);
        cy.getByTestId('forum-search-input').type('razgovor');
        cy.contains('button', 'Primijeni filtere').click();
        cy.location('search').should('include', 'search=razgovor');

        cy.getByTestId('forum-question-card').click();
        cy.location('pathname').should('eq', '/forum/questions/101');
        cy.getByTestId('forum-question-details-page').should('be.visible');
        cy.contains(forum.question.title).should('be.visible');
        cy.contains('Kreni s nečim konkretnim').should('be.visible');
      });
    });
  });

  it('shows an empty forum state', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('forum').then((forum) => {
        setupForumMocks({ forum, currentUser, isEmpty: true });

        cy.visitAsAuthenticated('/forum');

        cy.getByTestId('forum-empty-state').should('contain', 'Još nema pitanja');
        cy.contains('Postavi pitanje').should('be.visible');
      });
    });
  });

  it('covers forum list filter, sorting, category, pagination, and active empty states', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('forum').then((forum) => {
        const today = new Date().toISOString();
        const week = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
        const old = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
        const questions = [
          {
            ...forum.question,
            id: 301,
            userId: currentUser.id,
            title: 'Današnje riješeno popularno pitanje',
            body: 'Dugačak tekst '.repeat(20),
            createdAt: today,
            voteScore: 1,
            answerCount: 6,
            User: currentUser,
            Answers: [
              {
                id: 801,
                questionId: 301,
                userId: 2,
                body: 'Prihvaćen odgovor.',
                isAccepted: true,
                createdAt: today,
                User: { id: 2, username: 'alex_rain', name: 'Alex Rain' },
              },
            ],
          },
          {
            ...forum.question,
            id: 302,
            title: 'Tjedno pitanje o filtrima',
            body: 'Pitanje s odgovorima za lokalno filtriranje.',
            createdAt: week,
            voteScore: 3,
            answerCount: undefined,
            User: { id: 3, publicId: 'mira-public', username: 'mira_sun', name: 'Mira Sun' },
            Category: { id: 2, name: 'Prijateljstvo', slug: 'prijateljstvo' },
            Answers: [{ id: 802 }, { id: 803 }],
          },
          {
            ...forum.question,
            id: 303,
            title: 'Starije pitanje bez kategorije',
            body: 'Starije pitanje koje ne smije proći mjesečni filter.',
            createdAt: old,
            voteScore: -1,
            answerCount: 0,
            Category: undefined,
            User: { id: 4, username: 'zora' },
            Answers: [],
          },
        ];

        setupForumMocks({ forum, currentUser, questions });

        cy.visitAsAuthenticated('/forum?page=2');
        cy.getByTestId('forum-questions-page').should('be.visible');
        cy.contains('Stranica 2 / 1').should('be.visible');
        cy.contains('button', 'Prethodna').click();
        cy.location('search').should('include', 'page=1');

        ['oldest', 'author-asc', 'author-desc', 'answers-desc', 'answers-asc'].forEach((sort) => {
          cy.visitAsAuthenticated(`/forum?sort=${sort}`);
          cy.getByTestId('forum-question-card').should('have.length', 3);
        });

        ['today', 'week', 'month'].forEach((time) => {
          cy.visitAsAuthenticated(`/forum?time=${time}`);
          cy.getByTestId('forum-question-card').should('exist');
        });

        cy.visitAsAuthenticated('/forum?categoryId=2');
        cy.contains('Tjedno pitanje o filtrima').should('be.visible');

        cy.visitAsAuthenticated('/forum?title=nema-rezultata&author=nobody&minAnswers=9');
        cy.getByTestId('forum-empty-state').should('contain', 'Nema pitanja za ove kriterije');
        cy.contains('button', 'Očisti filtere').click();
        cy.location('search').should('not.include', 'title=');

        cy.visitAsAuthenticated('/forum?categoryId=0');
        cy.contains('button', 'Primijeni filtere').click();
        cy.contains('Odaberi ispravnu kategoriju.').should('be.visible');

        cy.contains('button', 'Prikaži napredne filtere').click();
        cy.get('input[placeholder="Min. broj odgovora"]').clear().type('1000');
        cy.contains('button', 'Primijeni filtere').click();
        cy.contains('Minimalan broj odgovora može biti najviše 999.').should('be.visible');

        cy.get('input[placeholder="Min. broj odgovora"]').clear().type('-1');
        cy.contains('button', 'Primijeni filtere').click();
        cy.contains('Minimalan broj odgovora mora biti cijeli broj 0 ili veći.').should('be.visible');
      });
    });
  });

  it('creates a new forum question', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('forum').then((forum) => {
        setupForumMocks({ forum, currentUser });

        cy.visitAsAuthenticated('/forum/ask');

        cy.getByTestId('forum-question-form').should('be.visible');
        cy.getByTestId('forum-question-title').type(forum.createdQuestion.title);
        cy.getByTestId('forum-question-body').type(forum.createdQuestion.body);
        cy.contains('button', 'Objavi pitanje').click();

        cy.wait('@createForumQuestion');
        cy.location('pathname').should('eq', '/forum/questions/102');
        cy.contains(forum.createdQuestion.title).should('be.visible');
      });
    });
  });

  it('posts an answer to an existing question', () => {
    cy.fixture('current-user').then((currentUser) => {
      cy.fixture('forum').then((forum) => {
        setupForumMocks({ forum, currentUser });

        cy.visitAsAuthenticated('/forum/questions/101');

        cy.getByTestId('forum-question-details-page').should('be.visible');
        cy.getByTestId('forum-answer-form').should('be.visible');
        cy.getByTestId('forum-answer-body').type(forum.createdAnswer.body);
        cy.getByTestId('forum-answer-submit').click();

        cy.wait('@createForumAnswer');
        cy.contains(forum.createdAnswer.body).should('be.visible');
      });
    });
  });
});
