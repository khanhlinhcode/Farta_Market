import axios from "axios";
import { SESSION_KEYS } from "utils/constant";
import { clearAdminSession } from "utils/adminAuth";
import { getApiBaseUrl } from "../config/api";

const baseURL = getApiBaseUrl();
const timeout =
  Number(import.meta.env.VITE_API_TIME_OUT || import.meta.env.REACT_APP_API_TIME_OUT) || 20000;

const axiosInstance = axios.create({
  baseURL,
  timeout,
});
axiosInstance.interceptors.request.use(
  function (config) {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    config.headers.Accept = "application/json";

    const token = localStorage.getItem(SESSION_KEYS.ADMIN_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  function (response) {
    if (response.data) {
      return response.data;
    }
    return response;
  },
  function (error) {
    if (error?.response?.status === 401) {
      clearAdminSession();
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;
