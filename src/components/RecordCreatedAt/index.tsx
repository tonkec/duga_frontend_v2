const formatMinutes = (minutes: number) => {
  if (minutes < 10) {
    return `0${minutes}`;
  }

  return minutes;
};

const RecordCreatedAt = ({ createdAt }: { createdAt: string }) => {
  const date = new Date(createdAt);
  const today = new Date();
  if (date.getDate() === today.getDate()) {
    return (
      <p className="text-xs text-gray-400">
        {date.getHours()}:{date.getMinutes()}
      </p>
    );
  }

  return (
    <p className="text-xs text-gray-400">
      {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}: {date.getHours()}:
      {formatMinutes(date.getMinutes())}
    </p>
  );
};

export default RecordCreatedAt;
