document.addEventListener('DOMContentLoaded', function () {
    // Установка минимальной даты для выбора
    const dateInput = document.getElementById('id_date');
    if (dateInput) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    // Обработка отправки формы
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            // Можно добавить дополнительную валидацию перед отправкой
            console.log('Форма бронирования отправлена');
        });
    }
});