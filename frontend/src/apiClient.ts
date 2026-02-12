// src/apiClient.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL // <-- points to deployed backend
});

export default api;
