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
