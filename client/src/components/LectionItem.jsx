import { observer } from "mobx-react-lite";
import { useContext, useState, useEffect } from "react";
import { lectureContext, testContext } from "../index";
import { useParams, Link } from 'react-router-dom';
import { Context } from "../index";
import '../styles/LectionItem.css';

const LectionItem = observer(() => {
    const { lectionStore } = useContext(lectureContext);
    const { testStore } = useContext(testContext);
    const { store } = useContext(Context);
    const { id: lectionId } = useParams();

    const [lection, setLection] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('');
    const [body, setBody] = useState('');
    const [testTitle, setTestTitle] = useState('');

    useEffect(() => {
        console.log("Current id:", lectionId);
        lectionStore.getLection(lectionId).then(() => {
            setLection(lectionStore.currentLection);
            testStore.getTestsByLection(lectionId); // Загружаем тесты для данной лекции
        });
    }, [lectionId, lectionStore, testStore]);

    useEffect(() => {
        if (lection) {
            setTheme(lection.theme);
            setTitle(lection.title);
            setBody(lection.body);
        }
    }, [lection]);

    const handleUpdate = () => {
        lectionStore.updateLection(lection._id, { theme, title, body });
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCreateTest = async (e) => {
        e.preventDefault();
        if (!testTitle.trim()) {
            alert("Название теста обязательно");
            return;
        }
        try {
            await testStore.createTest({ title: testTitle, lectionId });
            setTestTitle(''); // Очистка поля после создания теста
            testStore.getTestsByLection(lectionId); // Обновляем список тестов после создания нового
        } catch (error) {
            console.error("Ошибка при создании теста:", error);
        }
    };

    if (!lection) return <div>Loading lection...</div>;

    return (
        <div className="lection-item">
            <div className="lection-details">
                {store.user.role === 'teacher' && (
                    <div className="button-group">
                        <button onClick={handleEdit}>Изменить</button>
                        <button onClick={() => lectionStore.deleteLection(lection._id)}>Удалить</button>
                    </div>
                )}
                {isEditing ? (
                    <>
                        <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Тема лекции" />
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название лекции" />
                        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Содержимое"></textarea>
                        <button onClick={handleUpdate}>Подтвердить изменения</button>
                    </>
                ) : (
                    <>
                        <h2>Тема лекции: {theme}</h2>
                        <h2>Название лекции: {title}</h2>
                        <div className="lection-body">{body}</div>
                    </>
                )}
            </div>
            <div className="test-section">
                <h1>{lection.title}</h1>
                {store.user.role === 'teacher' && (
                    <div className="create-test-form">
                        <input
                            type="text"
                            value={testTitle}
                            onChange={(e) => setTestTitle(e.target.value)}
                            placeholder="Название теста"
                        />
                        <button onClick={handleCreateTest}>Создать тест</button>
                    </div>
                )}
                <h2>Тесты для лекции</h2>
                {testStore._tests.length > 0 ? (
                    <ul className="test-list">
                        {testStore._tests.map(test => (
                            <li key={test._id}>
                                <h3>{test.title || "Без названия"}</h3>
                                <Link to={`/tests/${test._id}`} onClick={() => console.log(`Navigating to test with ID: ${test._id}`)}>Подробнее</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div>Тесты не найдены.</div>
                )}
            </div>
        </div>
    );
});

export { LectionItem };
