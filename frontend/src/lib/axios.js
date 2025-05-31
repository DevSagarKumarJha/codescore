// lib/axios.ts
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8000/api/v1"
      : "/api/v1",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const { authUser, refreshAccessToken, logout } = useAuthStore.getState();

    // Only retry if:
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      authUser // user is logged in, so a refreshToken likely exists
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken(); // should send cookie and receive new cookie
        return axiosInstance(originalRequest); // retry original request
      } catch (refreshError) {
        logout(); // cleanup if refresh fails
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export { axiosInstance };
