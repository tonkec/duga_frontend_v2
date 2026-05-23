import { createContext, useContext } from 'react';

export type AppSessionStatus = 'loading' | 'active' | 'revoked' | 'error';

export const AppSessionContext = createContext<AppSessionStatus>('loading');

export const useAppSessionStatus = () => useContext(AppSessionContext);
