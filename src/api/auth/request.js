import axios, { getCsrfCookieAPI } from "api/axios";

export const getMeAPI = async () => {
  return await axios({
    url: "/me",
    method: "GET",
  });
};

export const loginUserAPI = async (data) => {
  await getCsrfCookieAPI();

  return await axios({
    url: "/login",
    method: "POST",
    data,
  });
};

export const registerUserAPI = async (data) => {
  await getCsrfCookieAPI();

  return await axios({
    url: "/register",
    method: "POST",
    data,
  });
};

export const forgotPasswordAPI = async (data) => {
  await getCsrfCookieAPI();

  return await axios({
    url: "/forgot-password",
    method: "POST",
    data,
  });
};

export const resetPasswordAPI = async (data) => {
  await getCsrfCookieAPI();

  return await axios({
    url: "/reset-password",
    method: "POST",
    data,
  });
};

export const logoutUserAPI = async () => {
  await getCsrfCookieAPI();

  return await axios({
    url: "/logout",
    method: "POST",
  });
};

export const getEmailVerificationStatusAPI = async () => axios({
  url: "/email/verification-status",
  method: "GET",
});

export const resendEmailVerificationAPI = async () => axios({
  url: "/email/verification-notification",
  method: "POST",
});
