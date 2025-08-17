import Card from '@app/components/Card';
import PostLoginForm from './PostLoginForm';

const PostLoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gradient px-6">
      <Card>
        <h1 className="text-4xl font-bold mb-4">Duga</h1>
        <h2 className="text-2xl">Trebamo još nekoliko informacija</h2>

        <p className="mb-6"> Molimo te da ispuniš sljedeće informacije:</p>

        <PostLoginForm />
      </Card>
    </div>
  );
};

export default PostLoginPage;
