export const removeSpacesAndDashes = (str: string): string => {
  return str.replace(/[\s-]/g, '');
};
