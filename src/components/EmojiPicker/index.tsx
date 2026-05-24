interface IEmojiPickerProps {
  emojis: string[];
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ emojis, onEmojiSelect }: IEmojiPickerProps) => {
  if (!emojis.length) {
    return null;
  }

  return (
    <div className="absolute z-50 mt-2 grid max-h-44 w-72 grid-cols-8 gap-1 overflow-y-auto rounded-2xl border border-[#dce4ff] bg-white/95 p-2 shadow-xl shadow-blue-dark/10 backdrop-blur sm:w-80">
      {emojis.map((emoji, index) => {
        return (
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl transition-colors hover:bg-[#f0f4ff] focus:bg-[#f0f4ff] focus:outline-none focus:ring-2 focus:ring-blue/30"
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            aria-label={`Odaberi emoji ${emoji}`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
};

export default EmojiPicker;
