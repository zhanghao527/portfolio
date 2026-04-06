import axios, { type AxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken } from "@/libs/auth";

const instance = axios.create({
  baseURL: "",
  timeout: 30000,
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器 — 解包 AxiosResponse，直接返回业务 data
instance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code === 40100) {
      clearAccessToken();
      if (
        !response.request.responseURL.includes("user/get/login") &&
        !window.location.pathname.includes("/user/login")
      ) {
        window.location.href = "/user/login";
      }
      throw new Error(data.message ?? "未登录");
    } else if (data.code !== 0) {
      throw new Error(data.message ?? "服务器错误");
    }
    return data;
  },
  (error) => Promise.reject(error),
);

const request = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return instance(url, config) as unknown as Promise<T>;
};

export default request;
