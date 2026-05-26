import { getEnv } from '@app/configs/env';

export const getAuth0Audience = () => getEnv('VITE_AUTH0_AUDIENCE');
