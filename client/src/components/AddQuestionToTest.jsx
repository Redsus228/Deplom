import { observer } from 'mobx-react-lite';
import { useParams } from 'react-router-dom';
import { useContext, useState } from 'react';
import { testContext } from '../index'; // Убедитесь, что контекст правильно импортирован

export const AddQuestionToTest = observer(() => {
    const { testId } = useParams();
    const {testStore} = useContext(testContext);
    const [question, setQuestion] = useState({
        text: "",
        options: ["", "", ""],
        correctOptionIndex: 0
    });

    const handleInputChange = (e, index) => {
        if (typeof index === 'number') {
            const newOptions = [...question.options];
            newOptions[index] = e.target.value;
            setQuestion({ ...question, options: newOptions });
        } else {
            setQuestion({ ...question, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await testStore.addQuestion(testId, question);
        setQuestion({ text: "", options: ["", "", ""], correctOptionIndex: 0 });
    };

    return (
        <div>
            <h1>Добавление вопроса в тест</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="text"
                    value={question.text}
                    onChange={handleInputChange}
                    placeholder="Текст вопроса"
                />
                {question.options.map((option, index) => (
                    <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder={`Вариант ответа ${index + 1}`}
                    />
                ))}
                <button type="submit">Добавить вопрос</button>
            </form>
        </div>
    );
});


