import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import '../styles/Login.css';
import '../styles/Global.css';

const LoginForm = observer(() => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { store } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('LoginForm mounted, isAuth:', store.isAuth); // Отладочное сообщение
        if (store.isAuth) {
            navigate('/lectures');
        }
    }, [store.isAuth, navigate]);

    const handleLogin = async () => {
        try {
            const response = await store.login(email, password);
            console.log('Login response:', response); // Отладочное сообщение
            if (response && response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                console.log('Tokens saved to localStorage'); // Отладочное сообщение
                console.log('Saved accessToken:', localStorage.getItem('accessToken')); // Отладочное сообщение
                console.log('Saved refreshToken:', localStorage.getItem('refreshToken')); // Отладочное сообщение
                store.setAuth(true);
                store.setUser(response.user);
                navigate('/lectures'); // Перенаправление на домашнюю страницу
            } else {
                console.log('Login response is undefined or missing accessToken');
            }
        } catch (error) {
            console.log('Login error:', error.response?.data?.message || error.message);
        }
    };

    if (store.isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="login-container">
            <div className="login-form">
                <h2><span style={{ color: '#007bff' }}>Вход</span></h2>
                <p>вы не вошли в аккаунт</p>
                <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                <input type="password" name="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                <div>
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Запомнить меня на этом компьютере</label>
                </div>
                <div className="actions">
                    <Link to="/registration">
                        <button className="secondary">Регистрация</button>
                    </Link>
                    <button className="primary" type="submit" onClick={handleLogin}>Войти</button>
                </div>
                <p className="policy">
                    Авторизируясь, вы даёте согласие на обработку персональных данных в соответствии с Политикой обработки данных.
                </p>
            </div>
            <div className="footer show">
                
            </div>
        </div>
    );
});

export { LoginForm };

