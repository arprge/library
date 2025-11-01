// Загрузка и парсинг CSV файла
let booksDatabase = [];

// Парсер CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const books = [];
    
    // Пропускаем заголовок и пустые строки
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        
        // Извлекаем нужные поля
        const bookID = values[0];
        const title = values[1];
        const author = values[2]?.split('/')[0]; // Берем первого автора
        const year = values[10]?.split('/')[2]; // Извлекаем год из даты
        
        // Пропускаем некорректные записи
        if (!title || !author) continue;
        
        // Определяем жанр на основе названия/автора
        const genre = detectGenre(title, author);
        
        books.push({
            id: parseInt(bookID),
            title: cleanTitle(title),
            author: author.trim(),
            genre: genre,
            year: year ? parseInt(year) : 2000,
            icon: getIconForGenre(genre)
        });
    }
    
    return books;
}

// Очистка названия от серийных номеров
function cleanTitle(title) {
    return title
        .replace(/\([^)]*#[^)]*\)/g, '') // Удаляем (Series #1)
        .replace(/\s+/g, ' ')
        .trim();
}

// Определение жанра
function detectGenre(title, author) {
    const titleLower = title.toLowerCase();
    const authorLower = author.toLowerCase();
    
    if (titleLower.includes('harry potter') || titleLower.includes('wizard')) return 'Фантастика';
    if (titleLower.includes('lord of the rings') || titleLower.includes('hobbit')) return 'Фантастика';
    if (titleLower.includes('dune') || titleLower.includes('space')) return 'Фантастика';
    if (titleLower.includes('hitchhiker')) return 'Фантастика';
    if (authorLower.includes('tolstoy') || authorLower.includes('dostoyevsky')) return 'Классика';
    if (authorLower.includes('hemingway') || authorLower.includes('fitzgerald')) return 'Классика';
    if (titleLower.includes('mystery') || titleLower.includes('detective')) return 'Детектив';
    if (titleLower.includes('love') || titleLower.includes('heart')) return 'Роман';
    if (titleLower.includes('history') || titleLower.includes('war')) return 'История';
    if (titleLower.includes('adventure') || titleLower.includes('treasure')) return 'Приключения';
    if (authorLower.includes('bryson')) return 'Путешествия';
    if (titleLower.includes('philosophy') || titleLower.includes('thinking')) return 'Философия';
    
    return 'Роман'; // По умолчанию
}

// Иконка для жанра
function getIconForGenre(genre) {
    const icons = {
        'Фантастика': '🚀',
        'Классика': '📚',
        'Детектив': '🔍',
        'Роман': '💕',
        'История': '📜',
        'Приключения': '🗺️',
        'Путешествия': '✈️',
        'Философия': '💭',
        'Наука': '🔬',
        'Поэзия': '🌸',
        'Эссе': '✍️',
        'Мемуары': '📝'
    };
    return icons[genre] || '📖';
}

// Загрузка CSV при старте
async function loadBooksFromCSV() {
    try {
        const response = await fetch('../data/books.csv');
        const csvText = await response.text();
        booksDatabase = parseCSV(csvText);
        
        // Ограничиваем до 100 книг для производительности
        booksDatabase = booksDatabase.slice(0, 100);
        
        console.log(`Загружено ${booksDatabase.length} книг из CSV`);
        return booksDatabase;
    } catch (error) {
        console.error('Ошибка загрузки CSV:', error);
        // Возвращаем пустой массив если не удалось загрузить
        booksDatabase = [];
        return [];
    }
}
