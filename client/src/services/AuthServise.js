import axios from 'axios';
import { API_URL } from '../http';

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL,
});

export default class AuthService {
    static async login(email, password) {
        try {
            const response = await $api.post("/login", { email, password });
            console.log('AuthService login response:', response); // Отладочное сообщение
            if (response.data) {
                console.log('AuthService login response data:', response.data); // Отладочное сообщение
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                console.log('Tokens saved to localStorage'); // Отладочное сообщение
                console.log('Saved accessToken:', localStorage.getItem('accessToken')); // Отладочное сообщение
                console.log('Saved refreshToken:', localStorage.getItem('refreshToken')); // Отладочное сообщение
                return response.data;
            } else {
                console.log('Login response data is undefined');
                return null; // Возвращаем null, если данных нет
            }
        } catch (error) {
            console.log('AuthService login error:', error.response?.data?.message || error.message);
            throw error;
        }
    }

    static async registration(email, password, firstName, lastName, middleName, role, group) {
        try {
            const response = await $api.post("/registration", { email, password, firstName, lastName, middleName, role, group });
            console.log('AuthService registration response:', response); 
            console.log('AuthService registration response data:', response.data); 
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            return response.data;
        } catch (error) {
            console.log('AuthService registration error:', error.response?.data?.message || error.message);
            throw error;
        }
    }

    static async logout() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('Refresh token is missing');
            }
            const response = await $api.post('/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${refreshToken}`
                }
            });
            console.log('AuthService logout response:', response);
            return response.data;
        } catch (error) {
            console.log('AuthService logout error:', error.response?.data?.message || error.message);
            throw error;
        }
    }

    static async checkAuth() {
        try {
            const response = await $api.post('/refresh');
            console.log('AuthService checkAuth response:', response); // Отладочное сообщение
            localStorage.setItem('accessToken', response.data.accessToken);
            return response.data;
        } catch (error) {
            console.log('AuthService checkAuth error:', error.response?.data?.message || error.message);
            throw error;
        }
    }

    static async refresh() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await $api.post("/refresh", { refreshToken });
            localStorage.setItem('accessToken', response.data.accessToken);
            return response.data;
        } catch (error) {
            console.log('AuthService refresh error:', error.response?.data?.message || error.message);
            throw error;
        }
    }

    static handleUnauthorized() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Принудительное перенаправление на страницу логина
    }
}
