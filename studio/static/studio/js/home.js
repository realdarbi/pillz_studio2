document.addEventListener('DOMContentLoaded', function () {
    // Применяем случайные цвета к карточкам услуг
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        const hue = 270 + Math.floor(Math.random() * 30) - 15;
        card.style.borderLeftColor = `hsl(${hue}, 80%, 60%)`;

        // Добавляем обработчик наведения для эффекта
        card.addEventListener('mouseenter', function () {
            this.style.boxShadow = `0 10px 25px hsla(${hue}, 80%, 60%, 0.3)`;
        });

        card.addEventListener('mouseleave', function () {
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        });
    });
});