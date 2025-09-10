import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

type AccordionItem = {
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else if (openIndex !== null) {
      setOpenIndex(null);
      setPendingIndex(index);
    } else {
      setOpenIndex(index);
    }
  };

  const handleExitComplete = () => {
    if (pendingIndex !== null) {
      setOpenIndex(pendingIndex);
      setPendingIndex(null);
    }
  };

  return (
    <div className="w-full mx-auto divide-y divide-gray-200">
      {items.map((item, index) => (
        <div key={index} className="py-4">
          <button
            onClick={() => handleToggle(index)}
            className="flex w-full items-center justify-between text-left font-medium text-gray-800 hover:text-blue"
          >
            {item.question}
            <FaChevronDown
              className={`h-5 w-5 transition-transform ${
                openIndex === index ? 'rotate-180 text-blue' : ''
              }`}
            />
          </button>

          <AnimatePresence onExitComplete={handleExitComplete}>
            {openIndex === index && (
              <motion.div
                key="content"
                initial={{ maxHeight: 0, opacity: 0 }}
                animate={{ maxHeight: 500, opacity: 1 }}
                exit={{ maxHeight: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-gray-600">{item.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
