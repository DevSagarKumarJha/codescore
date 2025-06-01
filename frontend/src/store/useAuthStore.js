// store/useAuthStore.ts
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigninUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.data.user });
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigninUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Error signing up");
    } finally {
      set({ isSigninUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Error logging in");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout successful");
    } catch (error) {
      toast.error("Error logging out");
    }
  },

  // ✅ Refresh token logic
  refreshAccessToken: async () => {
    try {
      const res = await axiosInstance.post("/auth/refresh");
      set({ authUser: res.data.user }); // or just update token if separate
    } catch (error) {
      set({ authUser: null });
    }
  },

  resendVerificationMail: async () => {
    try {
      const res = await axiosInstance.post("/auth/resend-verification-mail");
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Invalid or expired token");
    }
  },

  // ✅ Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const res = await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful");
    } catch (error) {
      toast.error("Reset failed");
    }
  },
}));
