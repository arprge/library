// Открыть модальное окно
function openModal(modalId) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbarWidth + 'px';
    document.body.style.overflow = 'hidden';
    document.getElementById(modalId).style.display = "block";
}

// Закрыть модальное окно
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
}

// Закрыть модальное окно при клике вне его
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0px';
        }
    }
}

// Закрыть модальное окно при нажатии ESC
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        const modals = document.getElementsByClassName('modal');
        for (let modal of modals) {
            if (modal.style.display === "block") {
                modal.style.display = "none";
                document.body.style.overflow = 'auto';
                document.body.style.paddingRight = '0px';
            }
        }
    }
});

// Scroll to top button
const scrollButton = document.getElementById('scrollToTop');

if (scrollButton) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });

    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Dark theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.getElementById('themeToggle');
    if (icon) {
        icon.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    }
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    const icon = document.getElementById('themeToggle');
    if (icon) {
        icon.textContent = '☀️';
    }
}

// Attach theme toggle to button
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
