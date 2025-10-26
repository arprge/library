// Управление локальным хранилищем
const Storage = {
    getReadBooks: function() {
        const books = localStorage.getItem('readBooks');
        return books ? JSON.parse(books) : [];
    },
    
    getPlanBooks: function() {
        const books = localStorage.getItem('planBooks');
        return books ? JSON.parse(books) : [];
    },
    
    addToReadBooks: function(bookId) {
        const readBooks = this.getReadBooks();
        if (!readBooks.includes(bookId)) {
            readBooks.push(bookId);
            localStorage.setItem('readBooks', JSON.stringify(readBooks));
            
            // Удаляем из планов если была там
            this.removeFromPlanBooks(bookId);
            return true;
        }
        return false;
    },
    
    addToPlanBooks: function(bookId) {
        const planBooks = this.getPlanBooks();
        if (!planBooks.includes(bookId)) {
            planBooks.push(bookId);
            localStorage.setItem('planBooks', JSON.stringify(planBooks));
            return true;
        }
        return false;
    },
    
    removeFromReadBooks: function(bookId) {
        let readBooks = this.getReadBooks();
        readBooks = readBooks.filter(id => id !== bookId);
        localStorage.setItem('readBooks', JSON.stringify(readBooks));
    },
    
    removeFromPlanBooks: function(bookId) {
        let planBooks = this.getPlanBooks();
        planBooks = planBooks.filter(id => id !== bookId);
        localStorage.setItem('planBooks', JSON.stringify(planBooks));
    },
    
    isInReadBooks: function(bookId) {
        return this.getReadBooks().includes(bookId);
    },
    
    isInPlanBooks: function(bookId) {
        return this.getPlanBooks().includes(bookId);
    }
};

// Создание карточки книги
function createBookCard(book, showActions = true) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const isRead = Storage.isInReadBooks(book.id);
    const isInPlan = Storage.isInPlanBooks(book.id);
    
    let actionsHTML = '';
    if (showActions) {
        actionsHTML = `
            <div class="book-actions">
                ${!isRead ? `<button class="btn btn-primary btn-small" onclick="addToRead(${book.id})">
                    ${isInPlan ? 'Прочитано ✓' : 'Прочитано'}
                </button>` : '<button class="btn btn-small" style="background: #4CAF50; color: white;" disabled>Прочитано ✓</button>'}
                ${!isRead && !isInPlan ? `<button class="btn btn-secondary btn-small" onclick="addToPlan(${book.id})">В планы</button>` : ''}
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="book-cover">${book.icon}</div>
        <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
            <div class="book-genre">${book.genre} • ${book.year}</div>
            ${actionsHTML}
        </div>
    `;
    
    return card;
}

// Добавление книги в прочитанные
function addToRead(bookId) {
    if (Storage.addToReadBooks(bookId)) {
        showNotification('Книга добавлена в прочитанные!');
        // Перезагрузка текущей страницы
        if (window.location.pathname.includes('search.html')) {
            performSearch();
        } else if (window.location.pathname.includes('my-books.html')) {
            loadMyBooks();
        }
    }
}

// Добавление книги в планы
function addToPlan(bookId) {
    if (Storage.addToPlanBooks(bookId)) {
        showNotification('Книга добавлена в список желаемого!');
        // Перезагрузка текущей страницы
        if (window.location.pathname.includes('search.html')) {
            performSearch();
        }
    }
}

// Удаление книги из списка
function removeFromList(bookId, listType) {
    if (listType === 'read') {
        Storage.removeFromReadBooks(bookId);
        showNotification('Книга удалена из прочитанных');
    } else {
        Storage.removeFromPlanBooks(bookId);
        showNotification('Книга удалена из планов');
    }
    loadMyBooks();
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
function displayPopularBooks() {
    const grid = document.getElementById('popularBooksGrid');
    if (!grid) return;
    
    // Показываем первые 6 книг как популярные
    const popularBooks = booksDatabase.slice(0, 6);
    
    grid.innerHTML = '';
    popularBooks.forEach(book => {
        grid.appendChild(createBookCard(book));
    });
}

// === ФУНКЦИИ ДЛЯ СТРАНИЦЫ ПОИСКА ===
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const genreFilter = document.getElementById('genreFilter');
    
    // Показываем все книги при загрузке
    displayAllBooks();
    
    // Поиск по клику
    searchBtn.addEventListener('click', performSearch);
    
    // Поиск по Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Фильтр по жанру
    genreFilter.addEventListener('change', performSearch);
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const query = searchInput.value.toLowerCase().trim();
    const selectedGenre = genreFilter.value;
    
    let filteredBooks = booksDatabase;
    
    // Фильтр по жанру
    if (selectedGenre) {
        filteredBooks = filteredBooks.filter(book => book.genre === selectedGenre);
    }
    
    // Поиск по тексту
    if (query) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.genre.toLowerCase().includes(query)
        );
    }
    
    displaySearchResults(filteredBooks);
}

function displayAllBooks() {
    displaySearchResults(booksDatabase);
}

function displaySearchResults(books) {
    const grid = document.getElementById('booksGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    if (books.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.textContent = '';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    resultsCount.textContent = `Найдено книг: ${books.length}`;
    
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
    const readBookIds = Storage.getReadBooks();
    const planBookIds = Storage.getPlanBooks();
    
    // Обновляем статистику
    document.getElementById('readCount').textContent = readBookIds.length;
    document.getElementById('planCount').textContent = planBookIds.length;
    
    // Загружаем прочитанные книги
    const readBooksContainer = document.getElementById('readBooks');
    const emptyRead = document.getElementById('emptyRead');
    
    if (readBookIds.length === 0) {
        readBooksContainer.style.display = 'none';
        emptyRead.style.display = 'block';
    } else {
        readBooksContainer.style.display = 'grid';
        emptyRead.style.display = 'none';
        readBooksContainer.innerHTML = '';
        
        readBookIds.forEach(bookId => {
            const book = booksDatabase.find(b => b.id === bookId);
            if (book) {
                const card = createBookCard(book, false);
                const removeBtn = document.createElement('button');
                removeBtn.className = 'btn btn-secondary btn-small';
                removeBtn.textContent = 'Удалить';
                removeBtn.onclick = () => removeFromList(bookId, 'read');
                
                const bookInfo = card.querySelector('.book-info');
                const actions = document.createElement('div');
                actions.className = 'book-actions';
                actions.appendChild(removeBtn);
                bookInfo.appendChild(actions);
                
                readBooksContainer.appendChild(card);
            }
        });
    }
    
    // Загружаем книги в планах
    const planBooksContainer = document.getElementById('planBooks');
    const emptyPlan = document.getElementById('emptyPlan');
    
    if (planBookIds.length === 0) {
        planBooksContainer.style.display = 'none';
        emptyPlan.style.display = 'block';
    } else {
        planBooksContainer.style.display = 'grid';
        emptyPlan.style.display = 'none';
        planBooksContainer.innerHTML = '';
        
        planBookIds.forEach(bookId => {
            const book = booksDatabase.find(b => b.id === bookId);
            if (book) {
                const card = createBookCard(book, false);
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'book-actions';
                
                const readBtn = document.createElement('button');
                readBtn.className = 'btn btn-primary btn-small';
                readBtn.textContent = 'Прочитано';
                readBtn.onclick = () => addToRead(bookId);
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'btn btn-secondary btn-small';
                removeBtn.textContent = 'Удалить';
                removeBtn.onclick = () => removeFromList(bookId, 'plan');
                
                actionsDiv.appendChild(readBtn);
                actionsDiv.appendChild(removeBtn);
                
                const bookInfo = card.querySelector('.book-info');
                bookInfo.appendChild(actionsDiv);
                
                planBooksContainer.appendChild(card);
            }
        });
    }
}
