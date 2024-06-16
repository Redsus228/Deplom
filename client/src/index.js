import React, { createContext } from 'react';
import { useStore } from './store/store';
import ReactDOM from 'react-dom/client';
import App from './App';
import Store from './store/store';
import lectionStore from './store/lectionStore';
import testStore from './store/testStore';
const store = new Store();

export const Context = createContext({ store });
export const lectureContext = createContext({ lectionStore });
export const testContext = createContext({ testStore, setStudentId: (newStudentId) => { testContext.studentId = newStudentId; } });

window.addEventListener('storage', (event) => {
  if (event.key === 'accessToken' || event.key === 'refreshToken') {
    const store = useStore();
    store.checkAuthOnLoad();
    console.log('Tokens changed in localStorage');
    console.log('accessToken:', localStorage.getItem('accessToken'));
    console.log('refreshToken:', localStorage.getItem('refreshToken'));
  }
});

// Добавление глобального обработчика ошибок
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global error caught:', message); // Логирование ошибки
    console.error('Error details:', {source, lineno, colno, error}); // Дополнительные детали ошибки

    // Проверяем, не связана ли ошибка с перезагрузкой страницы
    if (message.includes("reload") || message.includes("navigation")) {
        console.warn('Ignored reload attempt due to error handling.');
        return false; // Отменяем стандартную обработку ошибки
    }

    return true; // Предотвращение дальнейшего распространения стандартного обрабтчика ошибок
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Context.Provider value={{ store }}>
        <lectureContext.Provider value={{ lectionStore }}>
            <testContext.Provider value={{ testStore }}>
                <App />
            </testContext.Provider>
        </lectureContext.Provider>
    </Context.Provider>
);
