const formatMinutes = (minutes: number) => {
  return String(minutes).padStart(2, '0');
};

const RecordCreatedAt = ({ createdAt, className }: { createdAt: string; className?: string }) => {
  const date = new Date(createdAt);
  const today = new Date();

  if (date.getDate() === today.getDate()) {
    return (
      <p className={`${className} text-xs text-gray-400`}>
        {date.getHours()}:{formatMinutes(date.getMinutes())}
      </p>
    );
  }

  return (
    <p className={`${className} text-xs text-gray-400`}>
      {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()} {date.getHours()}:
      {formatMinutes(date.getMinutes())}
    </p>
  );
};

export default RecordCreatedAt;
