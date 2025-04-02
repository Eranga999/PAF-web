// src/hooks/use-auth.js
import { useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const logoutMutation = {
    mutate: logout,
  };

  return { user, login, logoutMutation };
}