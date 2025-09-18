import secureStore from '@/utils/secureStore';
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  phoneNo: string;
  id?: number;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  login: (token: string) => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      //   const token = await SecureStore.getItemAsync("token");
      const token = await secureStore.getItemAsync("jwtToken");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          setUser({
            phoneNo: decoded.phoneNo,
            id: decoded.id,
            name: decoded.name,
          });
        } catch (err) {
          console.log("Invalid token", err);
        }
      }
    };
    loadUser();
  }, []);

  const login = (token: string) => {
    secureStore.setItemAsync("jwtToken", token);
    try {
      const decoded: any = jwtDecode(token);
      setUser({
        phoneNo: decoded.phoneNo,
        id: decoded.id,
        name: decoded.name,
      });
    } catch (err) {
      console.log("Invalid token", err);
    }
  };

  const logout = async () => {
    await secureStore.deleteItemAsync("jwtToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
