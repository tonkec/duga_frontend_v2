export const areValidImageTypes = (files: FileList): boolean => {
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'];
  return Array.from(files).every((file) => allowedTypes.includes(file.type));
};
