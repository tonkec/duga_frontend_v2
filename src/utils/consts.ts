export const S3_BUCKET_URL = 'https://duga-user-photo.s3.eu-north-1.amazonaws.com';
export const S3_ENVIRONMENT = import.meta.env.VITE_S3_ENVIRONMENT;
export const S3_URL = `${S3_BUCKET_URL}/${S3_ENVIRONMENT}`;
