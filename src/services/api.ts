import axios, {
  type AxiosInstance,
  AxiosError,
  type AxiosResponse,
} from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para tratamento de erros
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      switch (status) {
        case 401:
          // Token expirado ou inválido
          localStorage.removeItem("token");
          window.location.href = "/login";
          toast.error("Sessão expirada. Faça login novamente.");
          break;
        case 403:
          toast.error("Você não tem permissão para esta ação.");
          break;
        case 404:
          toast.error("Recurso não encontrado.");
          break;
        case 422:
          // Erros de validação
          if (data.errors) {
            Object.values(data.errors).forEach((err: any) => {
              toast.error(err);
            });
          } else {
            toast.error(data.message || "Erro de validação");
          }
          break;
        case 500:
          toast.error("Erro no servidor. Tente novamente mais tarde.");
          break;
        default:
          toast.error(data.message || "Ocorreu um erro inesperado");
      }
    } else if (error.request) {
      toast.error("Sem conexão com o servidor");
    } else {
      toast.error("Erro ao processar requisição");
    }

    return Promise.reject(error);
  }
);

export default api;
