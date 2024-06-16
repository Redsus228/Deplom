import React, { useContext, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { testContext } from '../index';
import { Context } from '../index';
import '../styles/TestDetails.css';

const TestDetails = observer(() => {
    const { testStore } = useContext(testContext);
    const { store } = useContext(Context);
    const { testId } = useParams();

    const [test, setTest] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState(null);
    const [group, setGroup] = useState(''); // Added group state

    useEffect(() => {
        testStore.getTestById(testId).then(() => {
            setTest(testStore.currentTest);
        });
    }, [testId, testStore]);

    useEffect(() => {
        if (test) {
            setTitle(test.title);
            setAnswers(new Array(test.questions.length).fill(null));
        }
    }, [test]);

    const handleUpdate = () => {
        testStore.updateTest(test._id, { title });
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim() || options.some(option => !option.trim())) {
            alert("Все поля обязательны для заполнения");
            return;
        }
        try {
            const newQuestion = {
                question,
                options,
                correctIndex,
                points: 1 // По умолчанию 1 балл
            };
            await testStore.addQuestion(testId, newQuestion);
            setQuestion(''); // Очистка поля после добавления вопроса
            setOptions(['', '', '', '']); // Очистка вариантов ответа
            setCorrectIndex(0); // Сброс правильного ответа
            testStore.getTestById(testId); // Обновляем тест после добавления нового вопроса
        } catch (error) {
            console.error("Ошибка при добавлении вопроса:", error);
        }
    };

    const handleAnswerChange = (questionIndex, answerIndex) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        try {
            console.log('Отправка ответов:', answers); // Логирование данных перед отправкой
            const result = await testStore.saveStudentAnswers(testId, answers, group); // Passing group to saveStudentAnswers
            console.log('Ответы успешно сохранены:', result);
            const totalScore = test.questions.reduce((acc, question, index) => {
                if (question.correctIndex === answers[index]) {
                    return acc + 1; // По умолчанию 1 балл за правильный ответ
                }
                return acc;
            }, 0);
            setScore(totalScore);
        } catch (error) {
            console.error('Ошибка при сохранении ответов:', error);
        }
    };

    if (!test) return <div>Loading test...</div>;

    return (
        <div className="test-details">
            <div className="test-info">
                {isEditing ? (
                    <>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название теста" />
                        <button onClick={handleUpdate}>Подтвердить изменения</button>
                    </>
                ) : (
                    <>
                        <h1>{test.title}</h1>
                        {store.user.role === 'teacher' && (
                            <button onClick={handleEdit}>Изменить название</button>
                        )}
                    </>
                )}
                {store.user.role === 'teacher' && (
                    <form onSubmit={handleAddQuestion}>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Добавить вопрос"
                        />
                        <div>Варианты ответа:</div>
                        {options.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                value={option}
                                onChange={(e) => {
                                    const newOptions = [...options];
                                    newOptions[index] = e.target.value;
                                    setOptions(newOptions);
                                }}
                                placeholder={`Вариант ответа ${index + 1}`}
                            />
                        ))}
                        <div>Правильный ответ:</div>
                        <select
                            value={correctIndex}
                            onChange={(e) => setCorrectIndex(Number(e.target.value))}
                        >
                            {options.map((_, index) => (
                                <option key={index} value={index}>
                                    {index + 1}
                                </option>
                            ))}
                        </select>
                        <button type="submit">Добавить вопрос</button>
                    </form>
                )}
                {store.user.role === 'student' && (
                    <div>
                        {test.questions.length > 0 ? (
                            <ul className="questions-list">
                                {test.questions.map((q, index) => (
                                    <li key={index}>
                                        <div className="question-text">{q.question}</div>
                                        <ul>
                                            {q.options.map((option, i) => (
                                                <li key={i} className="question-item">
                                                    <input
                                                        type="radio"
                                                        checked={answers[index] === i}
                                                        onChange={() => handleAnswerChange(index, i)}
                                                        value={i}
                                                    />
                                                    <span>{option}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div>Вопросы не найдены.</div>
                        )}
                        <button onClick={handleSubmit}>Отправить ответы</button>
                        {score !== null && (
                            <div>Ваши баллы: {score} из {test.questions.length}</div>
                        )}
                    </div>
                )}
            </div>
            {store.user.role === 'teacher' && (
                <div className="questions-section">
                    <h2>Вопросы</h2>
                    {test.questions.length > 0 ? (
                        <ul className="questions-list">
                            {test.questions.map((q, index) => (
                                <li key={index}>
                                    <div className="question-text">{q.question}</div>
                                    <ul>
                                        {q.options.map((option, i) => (
                                            <li key={i} className="question-item">
                                                <span>{option}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>Вопросы не найдены.</div>
                    )}
                </div>
            )}
        </div>
    );
});

export { TestDetails };

