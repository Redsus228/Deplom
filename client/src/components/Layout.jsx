import React, { useContext } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import '../styles/Layout.css';
import logo from '../images/logo_white.png'; // Убедитесь, что путь к изображению правильный

const Layout = observer(() => {
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';
    const isRegistrationPage = location.pathname === '/registration';

    const handleLogout = async () => {
        try {
            await store.logout();
            navigate('/login');
        } catch (error) {
            console.log('Logout error:', error);
        }
    };

    return (
        <>
            {!isLoginPage && !isRegistrationPage && (
                <>
                    <header className="layout-header">
                        <nav className="layout-nav">
                            <ul className="layout-nav-list">
                                <li className="layout-nav-item"><Link to="/lectures">Учебные материалы</Link></li>
                                {store.user.role !== 'student' && (
                                    <li className="layout-nav-item"><Link to="/statistics">Аналитика</Link></li>
                                )}
                            </ul>
                        </nav>
                    </header>
                    <div className="layout-user-info">
                        {store.isAuth ? (
                            <>
                                <p>Вы вошли в аккаунт: {store.user.email}</p>
                                <p>Роль: {store.user.role}</p>
                                <button onClick={handleLogout}>Выйти</button>
                            </>
                        ) : (
                            <p>вы не вошли в аккаунт</p>
                        )}
                    </div>
                </>
            )}
            <main>
                <Outlet />
            </main>
            {!isLoginPage && !isRegistrationPage && (
                <footer className="layout-footer">
                    <div className="container">
                        <div className="footer-content">
                            <img src={logo} alt="Logo" className="footer-logo" />
                            <p className="footer-text">ТРПО</p>
                        </div>
                        <p className="footer-text">&copy; 2024 My Website</p>
                    </div>
                </footer>
            )}
        </>
    );
});

export { Layout };
