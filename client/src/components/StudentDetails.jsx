import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { testContext } from '../index';
import * as d3 from 'd3';

const StudentDetails = () => {
    const { studentId } = useParams();
    const { testStore } = useContext(testContext);
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const result = await testStore.getStudentAnswers(studentId);
                setStudentData(result);
                console.log(`Успешно получены данные для студента с ID: ${studentId}`, result);
            } catch (error) {
                console.error('Ошибка при получении данных студента:', error);
            }
        };

        fetchStudentData();
    }, [studentId, testStore]);

    useEffect(() => {
        if (studentData) {
            drawChart(studentData.answers, studentData.averageScore);
        }
    }, [studentData]);

    const drawChart = (data, averageScore) => {
        const svg = d3.select('#studentDetailsChart');
        svg.selectAll('*').remove(); // Очистка предыдущего графика

        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = +svg.attr('width') - margin.left - margin.right;
        const height = +svg.attr('height') - margin.top - margin.bottom;

        const x = d3.scaleBand()
            .domain(data.map(d => d.testTitle))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .nice()
            .range([height, 0]);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y).ticks(10, '%'));

        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.testTitle))
            .attr('y', d => y((d.score / d.totalQuestions) * 100))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y((d.score / d.totalQuestions) * 100))
            .attr('fill', d => d.passed ? 'steelblue' : 'red');

        g.selectAll('.label')
            .data(data)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.testTitle) + x.bandwidth() / 2)
            .attr('y', d => y((d.score / d.totalQuestions) * 100) - 5)
            .attr('dy', '.75em')
            .text(d => `${((d.score / d.totalQuestions) * 100).toFixed(0)}%`)
            .attr('text-anchor', 'middle');

        // Добавление средней линии
        g.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', y(averageScore))
            .attr('y2', y(averageScore))
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4');

        g.append('text')
            .attr('x', width - 10)
            .attr('y', y(averageScore) - 10)
            .attr('text-anchor', 'end')
            .attr('fill', 'red')
            .text(`Средний балл: ${averageScore}%`);
    };

    if (!studentData) {
        return <div>Загрузка...</div>;
    }

    return (
        <div>
            <h1>Детали студента</h1>
            <h2>{`${studentData.firstName} ${studentData.middleName} ${studentData.lastName}`}</h2>
            <svg width="800" height="500" id="studentDetailsChart"></svg>
            <table>
                <thead>
                    <tr>
                        <th>Тест</th>
                        <th>Дата</th>
                        <th>Пройден</th>
                        <th>Баллы</th>
                    </tr>
                </thead>
                <tbody>
                    {studentData.answers.map(answer => (
                        <tr key={answer.testId}>
                            <td>{answer.testTitle}</td>
                            <td>{answer.date}</td>
                            <td>{answer.passed ? 'Да' : 'Нет'}</td>
                            <td>{answer.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export { StudentDetails };


