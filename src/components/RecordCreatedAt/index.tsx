const formatMinutes = (minutes: number) => {
  return String(minutes).padStart(2, '0');
};

const formatTime = (date: Date) => `${date.getHours()}:${formatMinutes(date.getMinutes())}`;

const isSameDate = (firstDate: Date, secondDate: Date) =>
  firstDate.getDate() === secondDate.getDate() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getFullYear() === secondDate.getFullYear();

const RecordCreatedAt = ({ createdAt, className }: { createdAt: string; className?: string }) => {
  const date = new Date(createdAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (!className) {
    className = '';
  }

  if (isSameDate(date, today)) {
    return <p className={`${className} text-xs text-gray-400`}>Danas {formatTime(date)}</p>;
  }

  if (isSameDate(date, yesterday)) {
    return <p className={`${className} text-xs text-gray-400`}>Jučer {formatTime(date)}</p>;
  }

  return (
    <p className={`${className} text-xs text-gray-400`}>
      {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()} {formatTime(date)}
    </p>
  );
};

export default RecordCreatedAt;
