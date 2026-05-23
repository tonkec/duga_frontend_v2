import PostLoginForm from './PostLoginForm';

const PostLoginPage = () => {
  return (
    <div className="gradient flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 md:px-8">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/30 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-pink">Dobrodošao_la</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-blue-dark">Duga</h1>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-gray-900">
            Još par detalja prije ulaska
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Odaberi korisničko ime, potvrdi da imaš 18+ godina i prihvati pravila zajednice.
          </p>
        </div>
        <PostLoginForm />
      </div>
    </div>
  );
};

export default PostLoginPage;
