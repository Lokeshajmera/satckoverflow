import { useState } from "react";
import { createContext } from "react";
import axiosInstance from "./axiosinstance";
import { toast } from "react-toastify";
import { useContext } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);

  const Signup = async ({ name, email, password, phoneNumber }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/signup", {
        name,
        email,
        password,
        phoneNumber,
      });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser(data);
      toast.success("Signup Successful");
    } catch (error) {
      const msg = error.response?.data.message || "Signup failed";
      seterror(msg);
      toast.error(msg);
      throw error;
    } finally {
      setloading(false);
    }
  };
  const Login = async ({ email, password }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/login", {
        email,
        password,
      });
      if (res.data.otpRequired) {
        return { otpRequired: true, message: res.data.message };
      }
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser(data);
      toast.success("Login Successful");
      return { success: true };
    } catch (error) {
      const msg = error.response?.data.message || "Login failed";
      seterror(msg);
      toast.error(msg);
      throw error;
    } finally {
      setloading(false);
    }
  };

  const verifyLoginOTP = async ({ email, otp }) => {
    setloading(true);
    try {
      const res = await axiosInstance.post("/user/verify-login-otp", {
        email,
        otp,
      });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser(data);
      toast.success("Verification Successful");
      return { success: true };
    } catch (error) {
      const msg = error.response?.data.message || "Verification failed";
      toast.error(msg);
      throw error;
    } finally {
      setloading(false);
    }
  };

  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };

  const refreshUser = async () => {
    if (!user?._id) return;
    try {
      const res = await axiosInstance.get(`/user/profile/${user._id}`);
      const updatedData = { ...res.data.data, token: user.token };
      localStorage.setItem("user", JSON.stringify(updatedData));
      setUser(updatedData);
    } catch (err) {
      console.error("Failed to refresh user stats:", err);
    }
  };

  const updateLanguage = (newLang) => {
    if (user) {
      const updatedUser = { ...user, preferredLanguage: newLang };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, Signup, Login, verifyLoginOTP, Logout, refreshUser, updateLanguage, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
