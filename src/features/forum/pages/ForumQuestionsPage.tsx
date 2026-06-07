import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Select, { type Theme } from 'react-select';
import AppLayout from '@app/components/AppLayout';
import Button from '@app/components/Button';
import Loader from '@app/components/Loader';
import QuestionCard from '../components/QuestionCard';
import { useForumSocketEvents, useQuestionDetails, useQuestions } from '../hooks/useForum';
import type { Category, GetQuestionsParams, Question } from '../types/forum.types';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

const QUESTION_LIMIT = 10;
const SEARCH_MAX_LENGTH = 120;
const FILTER_TEXT_MAX_LENGTH = 80;
const MIN_ANSWERS_MAX_VALUE = 999;
const timeFilterOptions = [
  { value: '', label: 'Sva pitanja' },
  { value: 'today', label: 'Danas' },
  { value: 'week', label: 'Zadnjih 7 dana' },
  { value: 'month', label: 'Zadnjih 30 dana' },
] as const;
const sortOptions = [
  { value: 'newest', label: 'Najnovija pitanja' },
  { value: 'oldest', label: 'Najstarija pitanja' },
  { value: 'author-asc', label: 'Korisnik A-Z' },
  { value: 'author-desc', label: 'Korisnik Z-A' },
  { value: 'answers-desc', label: 'Najviše odgovora' },
  { value: 'answers-asc', label: 'Najmanje odgovora' },
] as const;

type TimeFilter = (typeof timeFilterOptions)[number]['value'];
type SortOption = (typeof sortOptions)[number]['value'];

interface ForumSelectOption {
  value: string;
  label: string;
}

const forumSelectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '3rem',
    borderRadius: '1rem',
    borderColor: state.isFocused ? '#2D46B9' : '#dce4ff',
    boxShadow: state.isFocused ? '0 0 0 1px #2D46B9' : '0 1px 2px rgba(15, 23, 42, 0.05)',
    '&:hover': {
      borderColor: '#2D46B9',
    },
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: '0 0.875rem',
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: '1rem',
    overflow: 'hidden',
    border: '1px solid #dce4ff',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
    zIndex: 20,
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2D46B9' : state.isFocused ? '#f0f4ff' : 'white',
    color: state.isSelected ? 'white' : '#111827',
  }),
};

const forumSelectTheme = (theme: Theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#dce4ff',
    primary: '#2D46B9',
  },
});

interface FilterErrors {
  search?: string;
  title?: string;
  author?: string;
  minAnswers?: string;
  time?: string;
  sort?: string;
  category?: string;
}

const getCategoriesFromQuestions = (questions: Question[]): Category[] => {
  const categories = new Map<number, Category>();

  questions.forEach((question) => {
    if (question.Category) {
      categories.set(question.Category.id, question.Category);
    }
  });

  return Array.from(categories.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const getQuestionAnswerCount = (question: Question) =>
  Math.max(question.answerCount ?? 0, question.Answers?.length ?? 0);

const getQuestionAuthorName = (question: Question) =>
  [question.User?.name, question.User?.username].filter(Boolean).join(' ');

const getTimeFilterStartDate = (timeFilter: string) => {
  const now = new Date();

  if (timeFilter === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (timeFilter === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (timeFilter === 'month') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return undefined;
};

const isValidTimeFilter = (value: string): value is TimeFilter =>
  timeFilterOptions.some((option) => option.value === value);

const isValidSortOption = (value: string): value is SortOption =>
  sortOptions.some((option) => option.value === value);

const sortQuestions = (questions: Question[], sort: SortOption) => {
  return [...questions].sort((firstQuestion, secondQuestion) => {
    if (sort === 'oldest') {
      return (
        new Date(firstQuestion.createdAt).getTime() - new Date(secondQuestion.createdAt).getTime()
      );
    }

    if (sort === 'author-asc' || sort === 'author-desc') {
      const direction = sort === 'author-asc' ? 1 : -1;
      return (
        getQuestionAuthorName(firstQuestion).localeCompare(getQuestionAuthorName(secondQuestion)) *
        direction
      );
    }

    if (sort === 'answers-desc' || sort === 'answers-asc') {
      const direction = sort === 'answers-desc' ? -1 : 1;
      return (
        (getQuestionAnswerCount(firstQuestion) - getQuestionAnswerCount(secondQuestion)) * direction
      );
    }

    return (
      new Date(secondQuestion.createdAt).getTime() - new Date(firstQuestion.createdAt).getTime()
    );
  });
};

const validateFilters = (
  searchValue: string,
  titleValue: string,
  authorValue: string,
  minAnswersValue: string,
  timeValue: string,
  sortValue: string,
  categoryValue?: string | null
): FilterErrors => {
  const errors: FilterErrors = {};
  const trimmedMinAnswers = minAnswersValue.trim();
  const minAnswers = Number(trimmedMinAnswers);

  if (searchValue.trim().length > SEARCH_MAX_LENGTH) {
    errors.search = `Pretraga može imati najviše ${SEARCH_MAX_LENGTH} znakova.`;
  }

  if (titleValue.trim().length > FILTER_TEXT_MAX_LENGTH) {
    errors.title = `Naslov može imati najviše ${FILTER_TEXT_MAX_LENGTH} znakova.`;
  }

  if (authorValue.trim().length > FILTER_TEXT_MAX_LENGTH) {
    errors.author = `Korisnik može imati najviše ${FILTER_TEXT_MAX_LENGTH} znakova.`;
  }

  if (trimmedMinAnswers) {
    if (!Number.isInteger(minAnswers) || minAnswers < 0) {
      errors.minAnswers = 'Minimalan broj odgovora mora biti cijeli broj 0 ili veći.';
    } else if (minAnswers > MIN_ANSWERS_MAX_VALUE) {
      errors.minAnswers = `Minimalan broj odgovora može biti najviše ${MIN_ANSWERS_MAX_VALUE}.`;
    }
  }

  if (!isValidTimeFilter(timeValue)) {
    errors.time = 'Odaberi ispravan vremenski filter.';
  }

  if (!isValidSortOption(sortValue)) {
    errors.sort = 'Odaberi ispravno sortiranje.';
  }

  if (categoryValue) {
    const categoryId = Number(categoryValue);
    if (!Number.isInteger(categoryId) || categoryId < 1) {
      errors.category = 'Odaberi ispravnu kategoriju.';
    }
  }

  return errors;
};

const ForumQuestionsPage = () => {
  useForumSocketEvents();

  const { user: currentUser } = useGetCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('search') ?? '';
  const titleFilter = searchParams.get('title') ?? '';
  const authorFilter = searchParams.get('author') ?? '';
  const minAnswersFilter = searchParams.get('minAnswers') ?? '';
  const timeFilterParam = searchParams.get('time') ?? '';
  const timeFilter: TimeFilter = isValidTimeFilter(timeFilterParam) ? timeFilterParam : '';
  const sortParam = searchParams.get('sort') ?? '';
  const sortFilter: SortOption = isValidSortOption(sortParam) ? sortParam : 'newest';
  const categoryIdParam = searchParams.get('categoryId');
  const parsedCategoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const categoryId =
    parsedCategoryId && Number.isInteger(parsedCategoryId) && parsedCategoryId > 0
      ? parsedCategoryId
      : undefined;
  const [searchInput, setSearchInput] = useState(search);
  const [titleInput, setTitleInput] = useState(titleFilter);
  const [authorInput, setAuthorInput] = useState(authorFilter);
  const [minAnswersInput, setMinAnswersInput] = useState(minAnswersFilter);
  const [timeInput, setTimeInput] = useState<TimeFilter>(timeFilter);
  const [sortInput, setSortInput] = useState<SortOption>(sortFilter);
  const [filterErrors, setFilterErrors] = useState<FilterErrors>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    Boolean(
      titleFilter || authorFilter || minAnswersFilter || timeFilter || sortFilter !== 'newest'
    )
  );
  const hasAdvancedFilters = Boolean(
    titleFilter || authorFilter || minAnswersFilter || timeFilter || sortFilter !== 'newest'
  );
  const hasActiveFilters = Boolean(search || categoryIdParam || hasAdvancedFilters);
  const shouldShowApplyFiltersButton = Boolean(
    hasActiveFilters || showAdvancedFilters || searchInput.trim()
  );

  const questionParams = useMemo<GetQuestionsParams>(
    () => ({
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: QUESTION_LIMIT,
      search: search || undefined,
      categoryId,
    }),
    [categoryId, page, search]
  );

  const categoryParams = useMemo<GetQuestionsParams>(() => ({ page: 1, limit: 100 }), []);
  const questionsQuery = useQuestions(questionParams);
  const categoriesQuery = useQuestions(categoryParams);
  const questions = questionsQuery.data?.data ?? [];
  const questionDetailQueries = useQuestionDetails(questions);
  const detailedQuestions = questionDetailQueries
    .map((query) => query.data)
    .filter((question): question is Question => Boolean(question));
  const questionsWithDetails = questions.map(
    (question) =>
      detailedQuestions.find((detailedQuestion) => detailedQuestion.id === question.id) ?? question
  );
  const categories = getCategoriesFromQuestions(categoriesQuery.data?.data ?? []);
  const categoryOptions: ForumSelectOption[] = [
    { value: '', label: 'Sve kategorije' },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
  ];
  const timeSelectOptions: ForumSelectOption[] = [...timeFilterOptions];
  const sortSelectOptions: ForumSelectOption[] = [...sortOptions];
  const currentUserId = currentUser?.data?.id;
  const filteredQuestions = sortQuestions(
    questionsWithDetails.filter((question) => {
      const normalizedTitleFilter = titleFilter.trim().toLowerCase();
      const normalizedAuthorFilter = authorFilter.trim().toLowerCase();
      const minAnswers = minAnswersFilter ? Number(minAnswersFilter) : undefined;
      const timeFilterStartDate = getTimeFilterStartDate(timeFilter);
      const matchesTitle =
        !normalizedTitleFilter || question.title.toLowerCase().includes(normalizedTitleFilter);
      const matchesAuthor =
        !normalizedAuthorFilter ||
        getQuestionAuthorName(question).toLowerCase().includes(normalizedAuthorFilter);
      const matchesAnswerCount =
        minAnswers === undefined ||
        !Number.isFinite(minAnswers) ||
        getQuestionAnswerCount(question) >= minAnswers;
      const matchesTime =
        !timeFilterStartDate ||
        new Date(question.createdAt).getTime() >= timeFilterStartDate.getTime();

      return matchesTitle && matchesAuthor && matchesAnswerCount && matchesTime;
    }),
    sortFilter
  );
  const totalPages = Math.max(
    1,
    questionsQuery.data?.totalPages ??
      Math.ceil((questionsQuery.data?.total ?? questions.length) / QUESTION_LIMIT)
  );

  const updateParams = (nextParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(nextParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateFilters(
      searchInput,
      titleInput,
      authorInput,
      minAnswersInput,
      timeInput,
      sortInput,
      categoryIdParam
    );
    setFilterErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    updateParams({
      search: searchInput.trim() || undefined,
      title: titleInput.trim() || undefined,
      author: authorInput.trim() || undefined,
      minAnswers: minAnswersInput.trim() || undefined,
      time: timeInput || undefined,
      sort: sortInput === 'newest' ? undefined : sortInput,
      page: '1',
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setTitleInput('');
    setAuthorInput('');
    setMinAnswersInput('');
    setTimeInput('');
    setSortInput('newest');
    setFilterErrors({});
    updateParams({
      search: undefined,
      title: undefined,
      author: undefined,
      minAnswers: undefined,
      time: undefined,
      sort: undefined,
      categoryId: undefined,
      page: '1',
    });
  };

  const handleCategoryChange = (nextCategoryId: string) => {
    setFilterErrors((currentErrors) => ({ ...currentErrors, category: undefined }));
    updateParams({ categoryId: nextCategoryId || undefined, page: '1' });
  };

  const goToPage = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  return (
    <AppLayout>
      <section className="mx-auto max-w-5xl" data-testid="forum-questions-page">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Forum</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Pitanja zajednice</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Postavi pitanje, podijeli iskustvo i pronađi odgovore drugih korisnika.
            </p>
          </div>

          <Link
            to="/forum/ask"
            className="inline-flex w-fit items-center justify-center rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue/20 transition-colors hover:bg-blue-dark"
          >
            Postavi pitanje
          </Link>
        </div>

        {questions.length > 0 && (
          <div className="mb-6 rounded-3xl border border-[#dce4ff] bg-white p-4 shadow-sm">
            <form onSubmit={handleSearch} className="grid gap-3" noValidate>
              <input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setFilterErrors((currentErrors) => ({ ...currentErrors, search: undefined }));
                }}
                maxLength={SEARCH_MAX_LENGTH}
                className="w-full rounded-2xl border border-[#dce4ff] px-4 py-3 text-sm outline-none transition-colors focus:border-blue"
                placeholder="Pretraži pitanja..."
                data-testid="forum-search-input"
              />
              {filterErrors.search && (
                <p className="text-sm font-medium text-red">{filterErrors.search}</p>
              )}

              <div className="flex justify-start">
                <button
                  type="button"
                  className="text-sm font-semibold text-blue underline"
                  onClick={() => setShowAdvancedFilters((isOpen) => !isOpen)}
                >
                  {showAdvancedFilters ? 'Sakrij napredne filtere' : 'Prikaži napredne filtere'}
                  {hasAdvancedFilters ? ' (aktivni)' : ''}
                </button>
              </div>

              {showAdvancedFilters && (
                <div className="grid gap-3 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-3 md:grid-cols-2 lg:grid-cols-5">
                  <input
                    value={titleInput}
                    onChange={(event) => {
                      setTitleInput(event.target.value);
                      setFilterErrors((currentErrors) => ({ ...currentErrors, title: undefined }));
                    }}
                    maxLength={FILTER_TEXT_MAX_LENGTH}
                    className="w-full rounded-2xl border border-[#dce4ff] px-4 py-3 text-sm outline-none transition-colors focus:border-blue"
                    placeholder="Filtriraj po naslovu"
                  />
                  <input
                    value={authorInput}
                    onChange={(event) => {
                      setAuthorInput(event.target.value);
                      setFilterErrors((currentErrors) => ({ ...currentErrors, author: undefined }));
                    }}
                    maxLength={FILTER_TEXT_MAX_LENGTH}
                    className="w-full rounded-2xl border border-[#dce4ff] px-4 py-3 text-sm outline-none transition-colors focus:border-blue"
                    placeholder="Filtriraj po korisniku"
                  />
                  <input
                    value={minAnswersInput}
                    onChange={(event) => {
                      setMinAnswersInput(event.target.value);
                      setFilterErrors((currentErrors) => ({
                        ...currentErrors,
                        minAnswers: undefined,
                      }));
                    }}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max={MIN_ANSWERS_MAX_VALUE}
                    className="w-full rounded-2xl border border-[#dce4ff] px-4 py-3 text-sm outline-none transition-colors focus:border-blue"
                    placeholder="Min. broj odgovora"
                  />
                  <Select
                    options={timeSelectOptions}
                    value={timeSelectOptions.find((option) => option.value === timeInput) ?? null}
                    onChange={(option) => {
                      setTimeInput(
                        ((option as ForumSelectOption | null)?.value ?? '') as TimeFilter
                      );
                      setFilterErrors((currentErrors) => ({ ...currentErrors, time: undefined }));
                    }}
                    styles={forumSelectStyles}
                    theme={forumSelectTheme}
                    classNamePrefix="react-select"
                    placeholder="Vrijeme"
                    aria-label="Filtriraj po vremenu"
                  />
                  <Select
                    options={sortSelectOptions}
                    value={sortSelectOptions.find((option) => option.value === sortInput) ?? null}
                    onChange={(option) => {
                      setSortInput(
                        ((option as ForumSelectOption | null)?.value ?? 'newest') as SortOption
                      );
                      setFilterErrors((currentErrors) => ({ ...currentErrors, sort: undefined }));
                    }}
                    styles={forumSelectStyles}
                    theme={forumSelectTheme}
                    classNamePrefix="react-select"
                    placeholder="Sortiraj"
                    aria-label="Sortiraj pitanja"
                  />
                  {(filterErrors.title ||
                    filterErrors.author ||
                    filterErrors.minAnswers ||
                    filterErrors.time ||
                    filterErrors.sort) && (
                    <div className="md:col-span-2 lg:col-span-5">
                      {filterErrors.title && (
                        <p className="text-sm font-medium text-red">{filterErrors.title}</p>
                      )}
                      {filterErrors.author && (
                        <p className="text-sm font-medium text-red">{filterErrors.author}</p>
                      )}
                      {filterErrors.minAnswers && (
                        <p className="text-sm font-medium text-red">{filterErrors.minAnswers}</p>
                      )}
                      {filterErrors.time && (
                        <p className="text-sm font-medium text-red">{filterErrors.time}</p>
                      )}
                      {filterErrors.sort && (
                        <p className="text-sm font-medium text-red">{filterErrors.sort}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {hasActiveFilters && (
                  <Button
                    type="secondary"
                    htmlType="button"
                    className="rounded-full border border-[#dce4ff] px-6 py-3 font-semibold"
                    onClick={clearFilters}
                  >
                    Očisti filtere
                  </Button>
                )}
                {shouldShowApplyFiltersButton && (
                  <Button
                    type="blue"
                    htmlType="submit"
                    className="rounded-full px-6 py-3 font-semibold"
                  >
                    Primijeni filtere
                  </Button>
                )}
              </div>
            </form>

            {categories.length > 0 && (
              <div className="mt-4">
                <div className="md:max-w-xs">
                  <Select
                    options={categoryOptions}
                    value={
                      categoryOptions.find((option) => option.value === (categoryIdParam ?? '')) ??
                      categoryOptions[0]
                    }
                    onChange={(option) =>
                      handleCategoryChange((option as ForumSelectOption | null)?.value ?? '')
                    }
                    styles={forumSelectStyles}
                    theme={forumSelectTheme}
                    classNamePrefix="react-select"
                    placeholder="Kategorija"
                    aria-label="Kategorija"
                  />
                </div>
                {filterErrors.category && (
                  <p className="mt-2 text-sm font-medium text-red">{filterErrors.category}</p>
                )}
              </div>
            )}
          </div>
        )}

        {questionsQuery.isPending && (
          <div className="rounded-3xl border border-[#dce4ff] bg-white py-12">
            <Loader variant="inline" label="Učitavanje pitanja..." />
          </div>
        )}

        {questionsQuery.isError && (
          <div className="rounded-3xl border border-red/30 bg-red/10 px-6 py-5 text-sm font-medium text-gray-800">
            Nije moguće učitati forum pitanja. Pokušaj ponovno malo kasnije.
          </div>
        )}

        {!questionsQuery.isPending && !questionsQuery.isError && filteredQuestions.length === 0 && (
          <div
            className={`rounded-3xl border px-6 py-14 text-center shadow-sm ${
              hasActiveFilters
                ? 'border-blue/20 bg-white'
                : 'border-[#dce4ff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#eef3ff]'
            }`}
            data-testid="forum-empty-state"
          >
            <span className="mx-auto mb-4 inline-flex rounded-full bg-blue/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-dark">
              {hasActiveFilters ? 'Nema rezultata' : 'Forum'}
            </span>
            <h2 className="text-2xl font-bold text-gray-950">
              {hasActiveFilters ? 'Nema pitanja za ove kriterije' : 'Još nema pitanja'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
              {hasActiveFilters
                ? 'Pokušaj proširiti pretragu ili očisti filtere da ponovno vidiš sva pitanja.'
                : 'Budi prvi_a koji_a će otvoriti temu na forumu.'}
            </p>
            {hasActiveFilters ? (
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue/20 transition-colors hover:bg-blue-dark"
                >
                  Očisti filtere
                </button>
                <Link
                  to="/forum/ask"
                  className="inline-flex items-center justify-center rounded-full border border-[#dce4ff] bg-white px-6 py-3 text-sm font-semibold text-blue-dark transition-colors hover:border-blue hover:text-blue"
                >
                  Postavi pitanje
                </Link>
              </div>
            ) : (
              <Link
                to="/forum/ask"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue/20 transition-colors hover:bg-blue-dark"
              >
                Postavi pitanje
              </Link>
            )}
          </div>
        )}

        {filteredQuestions.length > 0 && (
          <>
            <div className="grid gap-4">
              {filteredQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} currentUserId={currentUserId} />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                type="secondary"
                className="pagination-text-button rounded-full border border-[#dce4ff] px-5 py-2"
                disabled={questionParams.page === 1}
                onClick={() => goToPage((questionParams.page ?? 1) - 1)}
              >
                Prethodna
              </Button>
              <span className="text-sm font-semibold text-gray-600">
                Stranica {questionParams.page} / {totalPages}
              </span>
              <Button
                type="secondary"
                className="pagination-text-button rounded-full border border-[#dce4ff] px-5 py-2"
                disabled={(questionParams.page ?? 1) >= totalPages}
                onClick={() => goToPage((questionParams.page ?? 1) + 1)}
              >
                Sljedeća
              </Button>
            </div>
          </>
        )}
      </section>
    </AppLayout>
  );
};

export default ForumQuestionsPage;
