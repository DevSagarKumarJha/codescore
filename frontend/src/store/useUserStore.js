import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useUserStore = create((set) => ({
  user: null,
  users: [],
  pagination: {},
  loading: false,

  fetchUser: async (username) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/users/${username}`);

      set({user: res.data.data.user})
    } catch (error) {
      toast.error("Unable to fetch user details");
    } finally {
      set({ loading: false });
    }
  },

  fetchUsers: async (page = 1, limit = 10, search = "") => {
    try {
      set({ loading: true });
      const res = await axiosInstance.get(
        `/user/all?page=${page}&limit=${limit}&search=${search}`
      );

      set({
        users: res.data.data.users,
        pagination: res.data.data.pagination,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching users", err);
      set({ loading: false });
    }
  },
}));
