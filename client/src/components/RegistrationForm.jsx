import React, { useState, useContext } from "react";
import { Context } from "../index";
import { observer } from "mobx-react-lite";
import { useNavigate, Link } from "react-router-dom";
import '../styles/RegistrationForm.css';

const RegistrationForm = observer(() => {
    const { store } = useContext(Context);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [group, setGroup] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const navigate = useNavigate();

    const handleRegistration = async (e) => {
        e.preventDefault();
        if (!email || !password || !firstName || !lastName) {
            console.log('Все поля, кроме отчества, должны быть заполнены');
            return;
        }
        try {
            await store.registration(email, password, firstName, lastName, middleName, role, group);
            navigate("/login"); // Перенаправление на логин после регистрации
        } catch (error) {
            console.log('Registration error:', error);
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-form">
                <h2><span style={{ color: '#007bff' }}>Регистрация</span></h2>
                <form onSubmit={handleRegistration}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Адрес эл. почты"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Придумайте пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                    <input
                        type="text"
                        placeholder="Имя"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Фамилия"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Отчество"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>
                    {role === 'student' && (
                        <input
                            type="text"
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            placeholder="Группа"
                        />
                    )}
                    <button type="submit">Далее</button>
                </form>
                <p className="policy">
                    При регистрации вы соглашаетесь на обработку персональных данных в соответствии с Политикой обработки данных.
                </p>
                <p className="login-link">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
});

export { RegistrationForm };
