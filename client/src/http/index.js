import axios from "axios";
import AuthService from "../services/AuthServise";

export const API_URL = "http://localhost:7000/api";

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

$api.interceptors.response.use(
    (config) => {
        return config;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
        } else if (error.response?.status === 401 && !originalRequest._isRetry) {
            originalRequest._isRetry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await AuthService.refresh(refreshToken);
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                return $api.request(originalRequest);
            } catch (e) {
                console.log('Попытка обновления токена не удалась:', e);
            }
        }
        throw error;
    }
);

export default $api;
