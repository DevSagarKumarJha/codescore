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
    console.log(error);
    const originalRequest = error.config;
    const status = error?.response?.status;
    const { refreshAccessToken, logout } = useAuthStore.getState();

    console.log("error conf ", originalRequest);
    console.log(
      "error status ",
      status,
      originalRequest.url,
    );
    // Only retry if:
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
      // && authUser // user is logged in, so a refreshToken likely exists
    ) {
      console.log("working");
      originalRequest._retry = true;

      try {
        await refreshAccessToken(); // should send cookie and receive new cookie
        return axiosInstance(originalRequest); // retry original request
      } catch (error) {
        console.log(error);
        await logout(); // cleanup if refresh fails
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
