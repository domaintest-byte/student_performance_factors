// Основные переменные
let dataset = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;
let currentChart = null;

// DOM элементы
const csvFileInput = document.getElementById('csvFile');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');
const filterColumn = document.getElementById('filterColumn');
const filterValue = document.getElementById('filterValue');
const sortColumn = document.getElementById('sortColumn');
const applyFiltersBtn = document.getElementById('applyFilters');
const exportCsvBtn = document.getElementById('exportCsv');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const statisticsDiv = document.getElementById('statistics');
const chartCanvas = document.getElementById('dataChart');
const chartTypeSelect = document.getElementById('chartType');
const refreshStatsBtn = document.getElementById('refreshStats');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Установка текущей даты
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString();
    
    // Обработчики событий
    csvFileInput.addEventListener('change', handleFileUpload);
    applyFiltersBtn.addEventListener('click', applyFilters);
    exportCsvBtn.addEventListener('click', exportToCsv);
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    chartTypeSelect.addEventListener('change', updateChart);
    refreshStatsBtn.addEventListener('click', showStatistics);
    
    // Загрузка демо-данных
    loadSampleData();
});

// Загрузка демо-данных
function loadSampleData() {
    // Генерация демо-данных
    const sampleData = [];
    const genders = ['Male', 'Female'];
    const levels = ['Low', 'Medium', 'High'];
    const schoolTypes = ['Public', 'Private'];
    const peerInfluence = ['Positive', 'Neutral', 'Negative'];
    const educationLevels = ['High School', 'College', 'Postgraduate'];
    const distances = ['Near', 'Moderate', 'Far'];
    
    for (let i = 1; i <= 100; i++) {
        sampleData.push({
            Hours_Studied: Math.floor(Math.random() * 20) + 5,
            Attendance: Math.floor(Math.random() * 30) + 70,
            Parental_Involvement: levels[Math.floor(Math.random() * 3)],
            Access_to_Resources: levels[Math.floor(Math.random() * 3)],
            Extracurricular_Activities: Math.random() > 0.5 ? 'Yes' : 'No',
            Sleep_Hours: Math.floor(Math.random() * 4) + 6,
            Previous_Scores: Math.floor(Math.random() * 40) + 60,
            Motivation_Level: levels[Math.floor(Math.random() * 3)],
            Internet_Access: Math.random() > 0.2 ? 'Yes' : 'No',
            Tutoring_Sessions: Math.floor(Math.random() * 10),
            Family_Income: levels[Math.floor(Math.random() * 3)],
            Teacher_Quality: levels[Math.floor(Math.random() * 3)],
            School_Type: schoolTypes[Math.floor(Math.random() * 2)],
            Peer_Influence: peerInfluence[Math.floor(Math.random() * 3)],
            Physical_Activity: Math.floor(Math.random() * 10),
            Learning_Disabilities: Math.random() > 0.8 ? 'Yes' : 'No',
            Parental_Education_Level: educationLevels[Math.floor(Math.random() * 3)],
            Distance_from_Home: distances[Math.floor(Math.random() * 3)],
            Gender: genders[Math.floor(Math.random() * 2)],
            Exam_Score: Math.floor(Math.random() * 40) + 60
        });
    }
    
    dataset = sampleData;
    filteredData = [...dataset];
    initializeApp();
}

// Обработка загрузки файла
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            if (results.data.length > 0) {
                dataset = results.data;
                filteredData = [...dataset];
                initializeApp();
            }
        },
        error: (error) => {
            console.error('Ошибка парсинга CSV:', error);
            alert('Ошибка при чтении CSV файла');
        }
    });
}

// Инициализация приложения после загрузки данных
function initializeApp() {
    // Заполняем выпадающие списки колонками
    populateColumnSelects();
    
    // Отображаем данные
    renderTable();
    
    // Показываем статистику
    showStatistics();
    
    // Строим график
    updateChart();
    
    // Включаем кнопки
    prevPageBtn.disabled = false;
    nextPageBtn.disabled = false;
}

// Заполнение выпадающих списков колонками
function populateColumnSelects() {
    if (dataset.length === 0) return;
    
    const columns = Object.keys(dataset[0]);
    
    // Очищаем списки
    filterColumn.innerHTML = '<option value="">-- Выберите колонку --</option>';
    sortColumn.innerHTML = '<option value="">-- Выберите колонку --</option>';
    
    // Заполняем списки
    columns.forEach(col => {
        filterColumn.innerHTML += `<option value="${col}">${col}</option>`;
        sortColumn.innerHTML += `<option value="${col}">${col}</option>`;
    });
}

// Применение фильтров
function applyFilters() {
    let result = [...dataset];
    
    // Фильтрация
    if (filterColumn.value && filterValue.value) {
        const column = filterColumn.value;
        const value = filterValue.value.toLowerCase();
        
        result = result.filter(item => {
            const itemValue = String(item[column]).toLowerCase();
            return itemValue.includes(value);
        });
    }
    
    // Сортировка
    if (sortColumn.value) {
        const column = sortColumn.value;
        
        result.sort((a, b) => {
            if (typeof a[column] === 'string') {
                return a[column].localeCompare(b[column]);
            }
            return a[column] - b[column];
        });
    }
    
    filteredData = result;
    currentPage = 1;
    renderTable();
    updateChart();
    showStatistics();
}

// Отображение данных в таблице
function renderTable() {
    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="20">Нет данных для отображения</td></tr>';
        return;
    }
    
    // Рассчитываем пагинацию
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const pageData = filteredData.slice(startIndex, startIndex + rowsPerPage);
    
    // Обновляем информацию о странице
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // Создаем заголовки таблицы
    const headers = Object.keys(filteredData[0]);
    let headerRow = '<tr>';
    headers.forEach(header => {
        headerRow += `<th>${header}</th>`;
    });
    headerRow += '</tr>';
    tableHeader.innerHTML = headerRow;
    
    // Заполняем тело таблицы
    let tableContent = '';
    pageData.forEach((row, index) => {
        let rowContent = '<tr>';
        headers.forEach(header => {
            rowContent += `<td>${row[header]}</td>`;
        });
        rowContent += '</tr>';
        tableContent += rowContent;
    });
    
    tableBody.innerHTML = tableContent;
}

// Смена страницы
function changePage(direction) {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    currentPage += direction;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    renderTable();
}

// Показ статистики
function showStatistics() {
    if (filteredData.length === 0) {
        statisticsDiv.innerHTML = '<p>Нет данных для статистики</p>';
        return;
    }
    
    // Рассчитываем базовую статистику
    const examScores = filteredData.map(item => item.Exam_Score);
    const minScore = Math.min(...examScores);
    const maxScore = Math.max(...examScores);
    const avgScore = (examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(2);
    
    // Статистика по категориальным данным
    const genderStats = calculateCategoryStats('Gender');
    const schoolStats = calculateCategoryStats('School_Type');
    
    let statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>${filteredData.length}</h3>
                <p>студентов</p>
            </div>
            <div class="stat-card">
                <h3>${minScore}</h3>
                <p>мин. оценка</p>
            </div>
            <div class="stat-card">
                <h3>${maxScore}</h3>
                <p>макс. оценка</p>
            </div>
            <div class="stat-card">
                <h3>${avgScore}</h3>
                <p>средняя оценка</p>
            </div>
        </div>
        
        <h3>Распределение по полу</h3>
        <div class="stats-grid">`;
    
    genderStats.forEach(stat => {
        statsHTML += `
            <div class="stat-card">
                <h3>${stat.count} (${stat.percentage}%)</h3>
                <p>${stat.category}</p>
            </div>`;
    });
    
    statsHTML += `</div>
        <h3>Тип школы</h3>
        <div class="stats-grid">`;
    
    schoolStats.forEach(stat => {
        statsHTML += `
            <div class="stat-card">
                <h3>${stat.count} (${stat.percentage}%)</h3>
                <p>${stat.category}</p>
            </div>`;
    });
    
    statsHTML += '</div>';
    
    statisticsDiv.innerHTML = statsHTML;
}

// Расчет статистики для категориальных данных
function calculateCategoryStats(columnName) {
    const counts = {};
    
    // Подсчет значений
    filteredData.forEach(item => {
        const value = item[columnName];
        counts[value] = (counts[value] || 0) + 1;
    });
    
    // Преобразование в массив
    const total = filteredData.length;
    return Object.keys(counts).map(key => ({
        category: key,
        count: counts[key],
        percentage: ((counts[key] / total) * 100).toFixed(1)
    }));
}

// Обновление графика
function updateChart() {
    if (filteredData.length === 0) return;
    
    const ctx = chartCanvas.getContext('2d');
    const chartType = chartTypeSelect.value;
    
    // Уничтожаем предыдущий график
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Подготавливаем данные для графика
    let chartData;
    
    if (chartType === 'bar') {
        // Столбчатая диаграмма: Средний балл по типу школы
        const schoolTypes = [...new Set(filteredData.map(item => item.School_Type))];
        const data = schoolTypes.map(type => {
            const students = filteredData.filter(item => item.School_Type === type);
            const avgScore = students.reduce((sum, item) => sum + item.Exam_Score, 0) / students.length;
            return avgScore.toFixed(1);
        });
        
        chartData = {
            type: 'bar',
            data: {
                labels: schoolTypes,
                datasets: [{
                    label: 'Средний балл по типу школы',
                    data: data,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderWidth: 1
                }]
            }
        };
    }
    else if (chartType === 'scatter') {
        // Точечная диаграмма: Часы учебы vs Оценка
        chartData = {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Часы учебы vs Оценка',
                    data: filteredData.map(item => ({
                        x: item.Hours_Studied,
                        y: item.Exam_Score
                    })),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Часы учебы в неделю'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Оценка за экзамен'
                        }
                    }
                }
            }
        };
    }
    else if (chartType === 'pie') {
        // Круговая диаграмма: Распределение по уровню мотивации
        const motivationLevels = [...new Set(filteredData.map(item => item.Motivation_Level))];
        const data = motivationLevels.map(level => 
            filteredData.filter(item => item.Motivation_Level === level).length
        );
        
        chartData = {
            type: 'pie',
            data: {
                labels: motivationLevels,
                datasets: [{
                    label: 'Распределение по уровню мотивации',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)'
                    ],
                }]
            }
        };
    }
    else if (chartType === 'line') {
        // Линейный график: Средняя оценка по предыдущим баллам
        const scoreGroups = {};
        filteredData.forEach(item => {
            const group = Math.floor(item.Previous_Scores / 10) * 10;
            if (!scoreGroups[group]) {
                scoreGroups[group] = { sum: 0, count: 0 };
            }
            scoreGroups[group].sum += item.Exam_Score;
            scoreGroups[group].count++;
        });
        
        const labels = Object.keys(scoreGroups).sort((a, b) => a - b);
        const data = labels.map(group => 
            (scoreGroups[group].sum / scoreGroups[group].count).toFixed(1)
        );
        
        chartData = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Средняя оценка по предыдущим баллам',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Средняя оценка'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Предыдущие баллы (группы)'
                        }
                    }
                }
            }
        };
    }
    
    // Создаем новый график
    if (chartData) {
        currentChart = new Chart(ctx, chartData);
    }
}

// Экспорт в CSV
function exportToCsv() {
    if (filteredData.length === 0) {
        alert('Нет данных для экспорта');
        return;
    }
    
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_performance.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}