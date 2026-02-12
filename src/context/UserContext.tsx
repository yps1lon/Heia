import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';
import type {User} from '../shared/types';

interface UserContextValue {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({children}: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const clearUser = useCallback(() => setUser(null), []);

  return (
    <UserContext.Provider value={{user, setUser, clearUser}}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
}
