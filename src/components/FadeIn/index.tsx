import { useWindowSize } from '@uidotdev/usehooks';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2, once: true });

  const { width } = useWindowSize();
  const isMobile = width !== undefined && width !== null && width < 768;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 50 }}
      animate={isMobile ? { opacity: 1, y: 0 } : isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

export default FadeInSection;
