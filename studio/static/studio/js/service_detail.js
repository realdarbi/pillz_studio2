document.addEventListener('DOMContentLoaded', function () {
    const dateInput = document.getElementById('id_date');
    if (dateInput) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            console.log('Форма бронирования отправлена');
        });
    }
});