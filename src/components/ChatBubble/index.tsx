const ChatBubble = () => {
  return (
    <div className="flex items-end gap-2 pl-11" role="status" aria-label="Druga osoba piše">
      <div className="rounded-2xl rounded-bl-sm border border-[#e8eeff] bg-white px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
