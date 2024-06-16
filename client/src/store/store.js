import { makeAutoObservable } from 'mobx';
import AuthService from '../services/AuthServise.js';
import { createContext, useContext } from "react";
import axios from "axios";

export default class Store {
    user = {};
    isAuth = false;
    isLoading = false;

    constructor() {
        makeAutoObservable(this);
        this.initAuthState();
        this.checkAuthOnLoad();
    }

    initAuthState() {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('initAuthState - accessToken:', accessToken); // Отладочное сообщение
        console.log('initAuthState - refreshToken:', refreshToken); // Отладочное сообщение
        if (accessToken && refreshToken) {
            this.isAuth = true;
        } else {
            this.isAuth = false;
        }
        console.log('initAuthState - isAuth:', this.isAuth); // Отладочное сообщение
    }

    setAuth(bool) {
        this.isAuth = bool;
        console.log('isAuth updated:', this.isAuth); // Отладочное сообщение
    }
    
    setUser(user) {
        this.user = user;
    }

    setLoading(bool) {
        this.isLoading = bool;
    }

    async checkAuthOnLoad() {
        this.setLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                const response = await axios.get('http://localhost:7000/api/refresh', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                this.setAuth(true);
            } else {
                this.setAuth(false);
            }
        } catch (error) {
            this.setAuth(false);
        } finally {
            this.setLoading(false);
        }
    }

    async checkAuth() {
        try {
            const response = await AuthService.checkAuth();
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            this.setAuth(true);
            this.setUser(response.user);
        } catch (error) {
            console.log("Ошибка при обновлении токена", error);
            this.setAuth(false);
            this.setUser({});
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw error;
        }
    }

    async registration(email, password, firstName, lastName, middleName, role, group) {
        this.setLoading(true);
        try {
            const response = await AuthService.registration(email, password, firstName, lastName, middleName, role, group);
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            this.setAuth(true);
            this.setUser(response.user);
        } catch (error) {
            console.log(error.response?.data?.message);
        } finally {
            this.setLoading(false);
        }
    }

    async login(email, password) {
        this.setLoading(true);
        try {
            const response = await AuthService.login(email, password);
            if (response && response.accessToken) {
                this.setAuth(true);
                this.setUser(response.user);
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                return response;
            } else {
                console.log('Login response is undefined or missing accessToken');
                return null;
            }
        } catch (error) {
            console.log('Login error:', error.response?.data?.message || error.message);
            return null;
        } finally {
            this.setLoading(false);
        }
    }

    async refreshToken() {
        try {
            const newAccessToken = await AuthService.refreshToken();
            this.setAuth(true);
            return newAccessToken;
        } catch (error) {
            this.setAuth(false);
            throw error;
        }
    }

    async logout() {
        try {
            await AuthService.logout();
            this.setAuth(false);
            this.setUser({});
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } catch (error) {
            console.log('Logout error:', error.response?.data?.message || error.message);
        }
    }
}

export const StoreContext = createContext(new Store());

export const useStore = () => useContext(StoreContext);
