// Управление локальным хранилищем (обновлено для API)
const Storage = {
    getReadBooks: function() {
        const books = localStorage.getItem('readBooks');
        return books ? JSON.parse(books) : [];
    },
    
    getPlanBooks: function() {
        const books = localStorage.getItem('planBooks');
        return books ? JSON.parse(books) : [];
    },
    
    addToReadBooks: function(book) {
        const readBooks = this.getReadBooks();
        const exists = readBooks.find(b => b.id === book.id);
        if (!exists) {
            readBooks.push(book);
            localStorage.setItem('readBooks', JSON.stringify(readBooks));
            
            // Удаляем из планов 
            this.removeFromPlanBooks(book.id);
            return true;
        }
        return false;
    },
    
    addToPlanBooks: function(book) {
        const planBooks = this.getPlanBooks();
        const exists = planBooks.find(b => b.id === book.id);
        if (!exists) {
            planBooks.push(book);
            localStorage.setItem('planBooks', JSON.stringify(planBooks));
            return true;
        }
        return false;
    },
    
    removeFromReadBooks: function(bookId) {
        let readBooks = this.getReadBooks();
        readBooks = readBooks.filter(b => b.id !== bookId);
        localStorage.setItem('readBooks', JSON.stringify(readBooks));
    },
    
    removeFromPlanBooks: function(bookId) {
        let planBooks = this.getPlanBooks();
        planBooks = planBooks.filter(b => b.id !== bookId);
        localStorage.setItem('planBooks', JSON.stringify(planBooks));
    },
    
    isInReadBooks: function(bookId) {
        return this.getReadBooks().some(b => b.id === bookId);
    },
    
    isInPlanBooks: function(bookId) {
        return this.getPlanBooks().some(b => b.id === bookId);
    }
};

// Создание карточки книггггиии
function createBookCard(book, showActions = true) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const bookIdString = JSON.stringify(book.id).replace(/"/g, '&quot;');
    const isRead = Storage.isInReadBooks(book.id);
    const isInPlan = Storage.isInPlanBooks(book.id);
    
    let actionsHTML = '';
    if (showActions) {
        actionsHTML = `
            <div class="book-actions">
                ${!isRead ? `<button class="btn btn-primary btn-small" onclick='addToRead(${bookIdString})'>
                    ${isInPlan ? 'Тапсырыс берілді ✓' : 'Тапсырыс беру'}
                </button>` : '<button class="btn btn-small" style="background: #4CAF50; color: white;" disabled>тапсырыс берілді ✓</button>'}
                ${!isRead && !isInPlan ? `<button class="btn btn-secondary btn-small" onclick='addToPlan(${bookIdString})'>Жоспарға</button>` : ''}
            </div>
        `;
    }
    
    // Используем реальную обложку или иконку
    let coverHTML;
    if (book.coverUrl) {
        coverHTML = `<img src="${book.coverUrl}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.parentElement.innerHTML='${book.icon || '📚'}';">`;
    } else {
        coverHTML = book.icon || '📚';
    }
    
    card.innerHTML = `
        <div class="book-cover">${coverHTML}</div>
        <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="book-genre">${book.genre} • ${book.year}</div>
            ${actionsHTML}
        </div>
    `;
    
    return card;
}

// Глобальный кэш книг для быстрого доступа
let booksCache = [];

// Добавление книги в прочитанные
function addToRead(bookId) {
    const book = booksCache.find(b => b.id === bookId);
    if (book && Storage.addToReadBooks(book)) {
        showNotification('Кітап тізімге қосылды');
        // Перезагрузка текущей страницы
        if (window.location.pathname.includes('search.html')) {
            performSearch();
        } else if (window.location.pathname.includes('my-books.html')) {
            loadMyBooks();
        }
    }
}

function addToPlan(bookId) {
    const book = booksCache.find(b => b.id === bookId);
    if (book && Storage.addToPlanBooks(book)) {
        showNotification('Кітап жоспарға қосылды');
        if (window.location.pathname.includes('search.html')) {
            performSearch();
        } else if (window.location.pathname.includes('my-books.html')) {
            loadMyBooks();
        }
    }
}

function removeFromList(bookId, listType) {
    if (listType === 'read') {
        Storage.removeFromReadBooks(bookId);
    } else if (listType === 'plan') {
        Storage.removeFromPlanBooks(bookId);
    }
    showNotification('Кітап тізімнен жойылды');
    if (window.location.pathname.includes('my-books.html')) {
        loadMyBooks();
    } else if (window.location.pathname.includes('search.html')) {
        performSearch();
    }
}

// Уведомления
function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Добавляем анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// === ФУНКЦИИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ ===
/*async function displayPopularBooks() {
    const grid = document.getElementById('popularBooksGrid');
    if (!grid) return;
    
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Загрузка книг...</div>';
    
    try {
        const popularBooks = await getPopularBooks();
        booksCache = [...popularBooks]; // Обновляем кэш
        grid.innerHTML = '';
        popularBooks.forEach(book => {
            grid.appendChild(createBookCard(book));
        });
    } catch (error) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: red;">Ошибка загрузки книг</div>';
    }
} */

// === ФУНКЦИИ ДЛЯ СТРАНИЦЫ ПОИСКА ===
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const genreFilter = document.getElementById('genreFilter');
    
    // Не показываем результаты при загрузке
    document.getElementById('booksGrid').innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: white;">Іздеуді бастау үшін кітаптың атын немесе авторды енгізіңіз.</div>';
    
    // Поиск по клику
    searchBtn.addEventListener('click', performSearch);
    
    // Поиск по Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
}

async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    const grid = document.getElementById('booksGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    // Показываем загрузку
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Кітаптарды іздеу...</div>';
    noResults.style.display = 'none';
    resultsCount.textContent = '';
    
    try {
        let books;
        if (!query) {
            displaySearchResults([]); // Показываем пустые результаты, если запрос пустой
            return;
        }
        books = await searchBooks(query, 30);
        
        displaySearchResults(books);
    } catch (error) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: red;">Іздеу қатесі</div>';
    }
}

function displaySearchResults(books) {
    const grid = document.getElementById('booksGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    booksCache = [...books]; // Обновляем кэш
    
    if (books.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.textContent = '';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    resultsCount.textContent = `Кітаптар: ${books.length}`;
    
    grid.innerHTML = '';
    books.forEach(book => {
        grid.appendChild(createBookCard(book));
    });
}

// === ФУНКЦИИ ДЛЯ СТРАНИЦЫ "МОИ КНИГИ" ===
function initMyBooks() {
    // Инициализация вкладок
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активный класс у всех
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Добавляем активный класс к выбранной вкладке
            btn.classList.add('active');
            const tabId = btn.dataset.tab + 'Tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    loadMyBooks();
}

function loadMyBooks() {
    const readBooks = Storage.getReadBooks();
    const planBooks = Storage.getPlanBooks();
    
    // Обновляем статистику
    document.getElementById('readCount').textContent = readBooks.length;
    document.getElementById('planCount').textContent = planBooks.length;
    
    // Загружаем прочитанные книги
    const readBooksContainer = document.getElementById('readBooks');
    const emptyRead = document.getElementById('emptyRead');
    
    if (readBooks.length === 0) {
        readBooksContainer.style.display = 'none';
        emptyRead.style.display = 'block';
    } else {
        readBooksContainer.style.display = 'grid';
        emptyRead.style.display = 'none';
        readBooksContainer.innerHTML = '';
        
        readBooks.forEach(book => {
            const card = createBookCard(book, false);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-secondary btn-small';
            removeBtn.textContent = 'Жою';
            removeBtn.onclick = () => removeFromList(book.id, 'read');
            
            const bookInfo = card.querySelector('.book-info');
            const actions = document.createElement('div');
            actions.className = 'book-actions';
            actions.appendChild(removeBtn);
            bookInfo.appendChild(actions);
            
            readBooksContainer.appendChild(card);
        });
    }
    
    // Загружаем книги в планах
    const planBooksContainer = document.getElementById('planBooks');
    const emptyPlan = document.getElementById('emptyPlan');
    
    if (planBooks.length === 0) {
        planBooksContainer.style.display = 'none';
        emptyPlan.style.display = 'block';
    } else {
        planBooksContainer.style.display = 'grid';
        emptyPlan.style.display = 'none';
        planBooksContainer.innerHTML = '';
        
        planBooks.forEach(book => {
            const card = createBookCard(book, false);
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'book-actions';
            
            const readBtn = document.createElement('button');
            readBtn.className = 'btn btn-primary btn-small';
            readBtn.textContent = 'Тапсырыс беру';
            readBtn.onclick = () => {
                booksCache = [book]; // Временно добавляем в кэш
                addToRead(book.id);
            };
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-secondary btn-small';
            removeBtn.textContent = 'Жою';
            removeBtn.onclick = () => removeFromList(book.id, 'plan');
            
            actionsDiv.appendChild(readBtn);
            actionsDiv.appendChild(removeBtn);
            
            const bookInfo = card.querySelector('.book-info');
            bookInfo.appendChild(actionsDiv);
            
            planBooksContainer.appendChild(card);
        });
    }
}
