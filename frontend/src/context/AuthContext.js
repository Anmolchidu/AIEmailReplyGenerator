// Auth removed — no login required.
// This context now just holds Gmail credentials in memory for the session.
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [gmailAddress, setGmailAddress] = useState('');
  const [gmailAppPassword, setGmailAppPassword] = useState('');

  return (
    <AuthContext.Provider value={{ gmailAddress, setGmailAddress, gmailAppPassword, setGmailAppPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
