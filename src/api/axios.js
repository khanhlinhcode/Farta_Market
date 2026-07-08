import axios from "axios";
import { getApiBaseUrl, getApiRootUrl } from "../config/api";

const baseURL = getApiBaseUrl();
const timeout =
  Number(import.meta.env.VITE_API_TIME_OUT || import.meta.env.REACT_APP_API_TIME_OUT) || 20000;

axios.defaults.withCredentials = true;

let csrfCookieRequest = null;

const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

export const getCsrfCookieAPI = async () => {
  if (!csrfCookieRequest) {
    csrfCookieRequest = axios
      .get(`${getApiRootUrl()}/sanctum/csrf-cookie`, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      })
      .finally(() => {
        csrfCookieRequest = null;
      });
  }

  return csrfCookieRequest;
};

const axiosInstance = axios.create({
  baseURL,
  timeout,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});
axiosInstance.interceptors.request.use(
  async function (config) {
    if (unsafeMethods.has(String(config.method || "get").toLowerCase())) {
      await getCsrfCookieAPI();
    }

    config.headers = config.headers || {};

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    config.headers.Accept = "application/json";

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
    return Promise.reject(error);
  }
);

export default axiosInstance;
