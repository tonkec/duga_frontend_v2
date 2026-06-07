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
}: {
  forum: ForumFixture;
  currentUser: BackendUserFixture;
  isEmpty?: boolean;
}) => {
  let createdAnswer: unknown | null = null;
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
          data: [forum.question],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
  }).as('getForumQuestions');

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
