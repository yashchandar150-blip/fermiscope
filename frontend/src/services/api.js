import axios from "axios";

export const TOKEN_KEY = "fermiscope_token";

// Because of the Vite proxy, "/api" is sent to http://localhost:5000/api
const api = axios.create({ baseURL: "/api" });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is invalid, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config ? error.config.url : "";
    const isAuthForm = url === "/auth/login" || url === "/auth/register";
    if (error.response && error.response.status === 401 && !isAuthForm) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("fermiscope:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
