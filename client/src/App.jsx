import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from "./components/LoginForm";
import { RegistrationForm } from "./components/RegistrationForm";
import { LectionPage } from "./components/LectionPage";
import { LectionItem } from "./components/LectionItem";
import { TestList } from './components/TestList';
import { Layout } from "./components/Layout";
import { TestDetails } from "./components/TestDetails";
import { Context } from "./index";
import { observer } from "mobx-react-lite";
import { PrivateRoute } from "./components/PrivateRoute";
import { Statistics } from './components/Statistics';
import { StudentDetails } from './components/StudentDetails';

const App = observer(() => {
  const { store } = useContext(Context);

  useEffect(() => {
    store.checkAuthOnLoad();
  }, [store]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> {/* Перенаправление на логин */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/" element={<Layout />}>
          <Route
            path="/lectures"
            element={
              <PrivateRoute>
                <LectionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/lectures/:id"
            element={
              <PrivateRoute>
                <LectionItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <PrivateRoute>
                <TestList />
              </PrivateRoute>
            }
          />
          <Route
            path="/tests/:testId"
            element={
              <PrivateRoute>
                <TestDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <PrivateRoute>
                <Statistics />
              </PrivateRoute>
            }
          />
          <Route
            path="/student-answers/:studentId"
            element={
              <PrivateRoute>
                <StudentDetails />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
});

export default App;
