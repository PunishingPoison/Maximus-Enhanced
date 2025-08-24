
import { useEffect } from 'react';

export const useAutoResizeTextarea = (
  ref: React.RefObject<HTMLTextAreaElement>,
  value: string
) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      const scrollHeight = ref.current.scrollHeight;
      ref.current.style.height = `${scrollHeight}px`;
    }
  }, [ref, value]);
};
