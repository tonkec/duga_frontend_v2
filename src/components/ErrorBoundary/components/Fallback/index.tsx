const Fallback = () => {
  return (
    <div className="p-4 text-red-500 h-full flex items-center justify-center gradient">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-white">😔 Oh, ne! Nešto se potrgalo </h1>
        <p className="text-white text-md mt-2">Kontaktiraj nas putem maila 👇</p>
        <a
          href="mailto:admin@duga.app"
          className="inline-block bg-blue max-w-lg px-2 py-2 text-white mt-4 rounded"
        >
          admin@duga.app
        </a>
      </div>
    </div>
  );
};

export default Fallback;
