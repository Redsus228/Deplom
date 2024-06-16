import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';

const PrivateRoute = observer(({ children }) => {
    const { store } = useContext(Context);
    const location = useLocation();

    console.log('PrivateRoute, isAuth:', store.isAuth); // Отладочное сообщение

    if (store.isLoading) {
        return <div>Loading...</div>; // Показываем индикатор загрузки
    }

    if (!store.isAuth) {
        console.log("User is not authorized, redirecting...");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
});

export { PrivateRoute };

