export const debounceScroll = (callback: () => void, wait: number) => {
  let timeout: number;
  return () => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      callback();
    }, wait);
  };
};
