import { createContext, useContext, ReactNode } from 'react';

interface MneeContextValue {
  providersReady: boolean;
}

const MneeContext = createContext<MneeContextValue | undefined>(undefined);

export function MneeContextProvider({ children }: { children: ReactNode }) {
  return (
    <MneeContext.Provider value={{ providersReady: true }}>
      {children}
    </MneeContext.Provider>
  );
}

export function useMneeContext() {
  return useContext(MneeContext);
}
