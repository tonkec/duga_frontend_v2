import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '@app/components/AppLayout';
import QuestionForm from '../components/QuestionForm';
import { useCreateQuestion } from '../hooks/useForum';
import { getForumErrorMessage } from '../utils/forumErrors';

const CreateQuestionPage = () => {
  const navigate = useNavigate();
  const createQuestionMutation = useCreateQuestion();

  return (
    <AppLayout>
      <section className="mx-auto max-w-3xl">
        <Link to="/forum" className="mb-5 inline-flex text-sm font-semibold text-blue underline">
          Povratak na forum
        </Link>

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Forum</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950">Postavi pitanje</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Napiši jasno pitanje i dodaj dovoljno konteksta da ti zajednica može pomoći.
          </p>
        </div>

        {createQuestionMutation.isError && (
          <div className="mb-5 rounded-3xl border border-red/30 bg-red/10 px-6 py-5 text-sm font-medium text-gray-800">
            {getForumErrorMessage(
              createQuestionMutation.error,
              'Nije moguće objaviti pitanje. Provjeri podatke i pokušaj ponovno.'
            )}
          </div>
        )}

        <QuestionForm
          isSubmitting={createQuestionMutation.isPending}
          onSubmit={(payload) =>
            createQuestionMutation.mutate(payload, {
              onSuccess: (question) => navigate(`/forum/questions/${question.id}`),
            })
          }
        />
      </section>
    </AppLayout>
  );
};

export default CreateQuestionPage;
