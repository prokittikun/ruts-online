import { env } from "@/env";
import { auth } from "@/server/auth";
import axios from "axios";

export const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_MYKU_API_URL;
};

export const getBrowserlessBaseUrl = () => {
  return process.env.BROWSERLESS_URL;
};

export const axiosAPI = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "app-key": env.MYKU_APP_KEY,
  },
});

export const axiosBrowserLess = axios.create({
  baseURL: getBrowserlessBaseUrl(),
});

export const axiosAPIWithAuth = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "app-key": env.MYKU_APP_KEY,
  },
});

axiosAPIWithAuth.interceptors.request.use(async (request) => {
  const session = await auth();
  if (session) {
    request.headers["x-access-token"] = session?.user.access_token;
  }
  return request;
});