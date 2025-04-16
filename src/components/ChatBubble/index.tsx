const ChatBubble = () => {
  return (
    <div className="flex items-end gap-2 mb-2 relative">
      <div className="relative bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm max-w-max">
        <div className="absolute -bottom-1 left-0 w-4 h-4 bg-gray-200 rounded-full transform -translate-x-1/2"></div>
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
