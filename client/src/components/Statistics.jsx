import React, { useEffect, useState, useContext, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { testContext } from '../index';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import '../styles/Statistics.css';

const Statistics = observer(() => {
    const { testStore } = useContext(testContext);
    const [statistics, setStatistics] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [noDataMessage, setNoDataMessage] = useState('');

    useEffect(() => {
        const fetchStatistics = async () => {
            const response = await testStore.getStatistics();
            const data = response.data;
            if (Array.isArray(data)) {
                setStatistics(data);
            } else {
                setStatistics([]);
            }
        };
        fetchStatistics();
    }, [testStore]);

    const handleTestChange = (event) => {
        setSelectedTest(event.target.value);
        setNoDataMessage('');
    };

    const handleGroupChange = (event) => {
        setSelectedGroup(event.target.value);
        setNoDataMessage('');
    };

    const handleStudentSelect = async (studentId, e) => {
        e.preventDefault();
        try {
            const studentAnswers = await testStore.getStudentAnswers(selectedTest, studentId);
            console.log('Student answers:', studentAnswers);
            // Дополнительная логика, если необходимо
        } catch (error) {
            console.error('Ошибка при получении ответов студента:', error);
        }
    };

    const drawChart = useCallback(() => {
        d3.select("#chart").selectAll("*").remove();

        if (!selectedTest || !selectedGroup) {
            setNoDataMessage('Выберите тест и группу для отображения статистики.');
            return;
        }

        const testStatistics = statistics.filter(stat => stat.testTitle === selectedTest && stat.group === selectedGroup);
        if (testStatistics.length === 0) {
            setNoDataMessage(`Никто еще не сдал тесты в группе ${selectedGroup} по тесту ${selectedTest}.`);
            return;
        }

        const averageCompletion = d3.mean(testStatistics, d => (d.score / 10) * 100); // Рассчитываем процент выполнения

        const margin = { top: 20, right: 30, bottom: 80, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        const svg = d3.select("#chart")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(testStatistics.map(d => d.studentEmail))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, 100]) // Проценты всегда от 0 до 100
            .range([height, 0]);

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(0,10)") // Убираем наклон текста
            .style("text-anchor", "middle")
            .text(d => testStatistics.find(stat => stat.studentEmail === d).fullName);

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        svg.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(averageCompletion))
            .attr("y2", y(averageCompletion))
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        svg.append("text")
            .attr("x", width - 30)
            .attr("y", y(averageCompletion) - 20)
            .attr("text-anchor", "end")
            .attr("fill", "red")
            .text(`Процент выполнения: ${averageCompletion.toFixed(2)}%`);

        svg.selectAll(".bar")
            .data(testStatistics)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.studentEmail))
            .attr("y", d => y((d.score / 10) * 100))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y((d.score / 10) * 100))
            .attr("fill", "steelblue");
    }, [statistics, selectedTest, selectedGroup]);

    useEffect(() => {
        drawChart();
    }, [statistics, selectedTest, selectedGroup, drawChart]);

    // Получение уникальных значений тестов и групп
    const uniqueTests = Array.from(new Set(statistics.map(stat => stat.testTitle)));
    const uniqueGroups = Array.from(new Set(statistics.map(stat => stat.group)));

    return (
        <div className="statistics-container">
            <h1>Анализ успеваемости студентов</h1>
            <div className="select-container">
                <label htmlFor="test">Выберите тест:</label>
                <select id="test" value={selectedTest} onChange={handleTestChange}>
                    <option value="">Выберите тест</option>
                    {uniqueTests.map(testTitle => (
                        <option key={testTitle} value={testTitle}>{testTitle}</option>
                    ))}
                </select>
                <label htmlFor="group">Выберите группу:</label>
                <select id="group" value={selectedGroup} onChange={handleGroupChange}>
                    <option value="">Выберите группу</option>
                    {uniqueGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                    ))}
                </select>
            </div>
            <div className="chart-container">
                {noDataMessage ? (
                    <div className="no-data-message">{noDataMessage}</div>
                ) : (
                    <>
                        <svg id="chart" width="800" height="400"></svg>
                        {statistics.length > 0 && selectedTest && selectedGroup && (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Студент</th>
                                        <th>Группа</th>
                                        <th>Тест</th>
                                        <th>Дата</th>
                                        <th>Баллы</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statistics
                                        .filter(stat => stat.testTitle === selectedTest && stat.group === selectedGroup)
                                        .map(stat => (
                                            <tr key={stat.studentEmail}>
                                                <td>
                                                    <Link to={`/student-answers/${stat.studentId}`}>
                                                        {stat.fullName}
                                                    </Link>
                                                </td>
                                                <td>{stat.group}</td>
                                                <td>{stat.testTitle}</td>
                                                <td>{stat.date}</td>
                                                <td>{stat.score}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

export { Statistics };
