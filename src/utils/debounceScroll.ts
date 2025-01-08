export const debounceScroll = (callback: () => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback();
    }, wait);
  };
};
