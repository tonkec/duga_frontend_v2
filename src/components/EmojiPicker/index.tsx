interface IEmojiPickerProps {
  emojis: string[];
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ emojis, onEmojiSelect }: IEmojiPickerProps) => {
  if (!emojis.length) {
    return null;
  }

  return (
    <div className="absolute bg-gray-100 border border-gray-200 shadow-lg rounded-lg ml-11 p-2 max-h-24 overflow-y-auto w-80 grid grid-cols-8 gap-1">
      {emojis.map((emoji, index) => {
        return (
          <span
            className="cursor-pointer text-lg p-1 hover:bg-gray-200 rounded-md block"
            key={index}
            onClick={() => onEmojiSelect(emoji)}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
};

export default EmojiPicker;
