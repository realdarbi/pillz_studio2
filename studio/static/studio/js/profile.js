document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.btn-filter');
    const bookingCards = document.querySelectorAll('.booking-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));

            this.classList.add('active');

            const filter = this.dataset.filter;

            bookingCards.forEach(card => {
                const cardStatus = card.dataset.status;

                if (filter === 'all' || cardStatus === filter) {
                    card.removeAttribute('hidden');
                } else {
                    card.setAttribute('hidden', 'true');
                }
            });
        });
    });

    document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', async function () {
            const bookingId = this.dataset.bookingId;

            if (confirm('Вы уверены, что хотите отменить эту запись?')) {
                try {
                    const response = await fetch(`/cancel_order/${bookingId}/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'),
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();

                    if (response.ok && data.status === 'success') {
                        showNotification(data.message, 'success');
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    } else {
                        showNotification(data.message || 'Ошибка при отмене записи', 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('Произошла ошибка при отправке запроса', 'error');
                }
            }
        });
    });

    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (!e.target.closest('.service-status') && !e.target.closest('.btn-cancel')) {
                this.classList.toggle('expanded');
            }
        });
    });

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `cancel-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});