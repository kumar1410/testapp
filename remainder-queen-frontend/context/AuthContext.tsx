import secureStore from '@/utils/secureStore';
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  phoneno?: string;
  phoneNo?: string;
  name?: string;
  role?: string;
  username?: string;
  type?: string | null;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  login: (token: string) => void;
  isAuthenticated: boolean;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await secureStore.getItemAsync("jwtToken");
        if (token) {
          const decoded: any = jwtDecode(token);
          console.log('Decoded token:', decoded);
          setUser({
            id: decoded.id,
            phoneno: decoded.phoneno || decoded.phoneNo,
            name: decoded.name,
            role: decoded.role,
            username: decoded.username,
            type: decoded.type
          });
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error loading user:", err);
        await secureStore.deleteItemAsync("jwtToken");
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    await secureStore.deleteItemAsync("jwtToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (token: string) => {
    await secureStore.setItemAsync("jwtToken", token);
    try {
      const decoded: any = jwtDecode(token);
      console.log('Login decoded token:', decoded);
      setUser({
        id: decoded.id,
        phoneno: decoded.phoneno || decoded.phoneNo,
        name: decoded.name,
        role: decoded.role,
        username: decoded.username,
        type: decoded.type
      });
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Login error:", err);
      await secureStore.deleteItemAsync("jwtToken");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
