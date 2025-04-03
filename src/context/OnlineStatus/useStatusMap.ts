import { createContext, useContext } from 'react';
import { StatusMap } from '.';

export const StatusContext = createContext<{
  statusMap: StatusMap;
}>({ statusMap: new Map() });

export const useStatusMap = () => useContext(StatusContext);
