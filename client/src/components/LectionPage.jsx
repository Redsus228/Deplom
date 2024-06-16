import { useEffect, useContext, useState } from "react";
import { lectureContext } from "../index";
import { observer } from "mobx-react-lite";
import { Link } from 'react-router-dom';
import { Context } from "../index";
import '../styles/LectionPage.css';

const LectionPage = observer(() => {
    const { lectionStore } = useContext(lectureContext);
    const { store } = useContext(Context);
    const [lections, setLections] = useState([]);
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('');
    const [body, setBody] = useState('');

    const createLection = async () => {
        const newLection = {
            title,
            theme,
            body,
            userId: store.user.id
        };
        try {
            await lectionStore.createLection(newLection);
            console.log('Lection created successfully');
            // Обновляем список лекций после создания новой
            const response = await lectionStore.getAllLections();
            setLections(response);
        } catch (error) {
            console.error('Error creating lection:', error);
        }
    };

    useEffect(() => {
        // Загрузка списка лекций
        console.log('store.user.role:', store.user.role); // Логирование роли пользователя
        async function getAllLections() {
            try {
                const response = await lectionStore.getAllLections();
                console.log("Ответ от сервера:", response);
                if (response) {
                    console.log("Данные лекций:", response);
                    setLections(response); // Используем данные непосредственно из response
                } else {
                    console.log("Ошибка: Некорректный ответ от сервера");
                }
            } catch (e) {
                console.log("Ошибка при загрузке лекций:", e);
            }
        }
        getAllLections();
    }, [lectionStore]);

    const handleTextareaChange = (e) => {
        setBody(e.target.value);
        e.target.style.height = 'auto'; // Сбрасываем высоту
        e.target.style.height = `${e.target.scrollHeight}px`; // Устанавливаем новую высоту
    };

    return (
        <div className="lection-page">
            <div className="lection-list">
                <h1>Лекции</h1>
                {lections.length ? (
                    <ul className="lecture-cards-list">
                        {lections.map(lection => (
                            <li key={lection._id} className="lecture-card">
                                <div className="lection-item">
                                    <div className="lection-title">{lection.title}</div>
                                </div>
                                <div className="lection-theme">{lection.theme}</div>
                                <Link to={`/lectures/${lection._id}`} className="lecture-card-link">Читать</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div>Лекции не найдены.</div>
                )}
            </div>
            {store.user.role === 'teacher' && (
                <div className="create-lection-form">
                    <h2>Создать лекцию</h2>
                    <input
                        type="text"
                        placeholder="Название лекции"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Тема лекции"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                    />
                    <textarea
                        placeholder="Содержание лекции"
                        value={body}
                        onChange={handleTextareaChange}
                    />
                    <button onClick={createLection}>Добавить лекцию</button>
                </div>
            )}
        </div>
    );
});

export { LectionPage };
