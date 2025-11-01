// Open Library API Integration
// Документация: https://openlibrary.org/dev/docs/api/search

const API_BASE = 'https://openlibrary.org';

// Функция для получения URL обложки книги
function getCoverUrl(coverId, size = 'M') {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

// Поиск книг через Open Library API
async function searchBooks(query, limit = 30) {
    try {
        const url = `${API_BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data.docs.map((book, index) => ({
            id: book.key || index,
            title: book.title || 'Без названия',
            author: book.author_name ? book.author_name.join(', ') : 'Автор неизвестен',
            genre: book.subject ? book.subject[0] : 'Разное',
            year: book.first_publish_year || 'N/A',
            isbn: book.isbn ? book.isbn[0] : null,
            coverUrl: book.cover_i ? getCoverUrl(book.cover_i) : null,
            icon: book.cover_i ? null : '📚'
        }));
    } catch (error) {
        console.error('Ошибка поиска книг:', error);
        return [];
    }
}

// Поиск книг по автору
async function searchByAuthor(author, limit = 30) {
    try {
        const url = `${API_BASE}/search.json?author=${encodeURIComponent(author)}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data.docs.map((book, index) => ({
            id: book.key || index,
            title: book.title || 'Без названия',
            author: book.author_name ? book.author_name.join(', ') : author,
            genre: book.subject ? book.subject[0] : 'Разное',
            year: book.first_publish_year || 'N/A',
            isbn: book.isbn ? book.isbn[0] : null,
            coverUrl: book.cover_i ? getCoverUrl(book.cover_i) : null,
            icon: book.cover_i ? null : '📚'
        }));
    } catch (error) {
        console.error('Ошибка поиска по автору:', error);
        return [];
    }
}

// Поиск книг по названию
async function searchByTitle(title, limit = 30) {
    try {
        const url = `${API_BASE}/search.json?title=${encodeURIComponent(title)}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data.docs.map((book, index) => ({
            id: book.key || index,
            title: book.title || 'Без названия',
            author: book.author_name ? book.author_name.join(', ') : 'Автор неизвестен',
            genre: book.subject ? book.subject[0] : 'Разное',
            year: book.first_publish_year || 'N/A',
            isbn: book.isbn ? book.isbn[0] : null,
            coverUrl: book.cover_i ? getCoverUrl(book.cover_i) : null,
            icon: book.cover_i ? null : '📚'
        }));
    } catch (error) {
        console.error('Ошибка поиска по названию:', error);
        return [];
    }
}

// Получить популярные книги (используем trending или какую-то базовую выборку)
async function getPopularBooks() {
    // Запрашиваем популярные темы или авторов
    return await searchBooks('bestseller', 6);
}

// Для совместимости со старым кодом
let booksDatabase = [];
