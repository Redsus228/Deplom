import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { testContext } from '../index';
import { Link } from 'react-router-dom';

export const TestList = observer(() => {
    const { testStore } = useContext(testContext);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        // Загрузка списка тестов
        async function getTestById() {
            try {
                const response = await testStore.getTestById();
                setTests(response.data);
            } catch (e) {
                console.log(e);
            }
        }
        getTestById();
    }, [testStore]);

    if (!tests.length) {
        return <div>Тесты не найдены.</div>;
    }

    return (
        <div>
            <h1>Список тестов</h1>
            <ul className="test-cards-list">
                {tests.map(test => (
                    <li key={test.id} className="test-card">
                        <h3 className="test-card-title">{test.title}</h3>
                        <Link to={`/tests/${test.id}`} className="test-card-link">Подробнее</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
});


