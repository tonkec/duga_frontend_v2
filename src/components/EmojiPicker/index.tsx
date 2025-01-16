interface IEmojiPickerProps {
  emojis: string[];
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ emojis, onEmojiSelect }: IEmojiPickerProps) => {
  if (!emojis.length) {
    return null;
  }

  return (
    <div className="bg-black px-4 py-2 rounded-lg mt-2 flex flex-wrap gap-2">
      {emojis.map((emoji, index) => {
        return (
          <span className="cursor-pointer" key={index} onClick={() => onEmojiSelect(emoji)}>
            {emoji}
          </span>
        );
      })}
    </div>
  );
};

export default EmojiPicker;
