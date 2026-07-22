document.addEventListener('DOMContentLoaded', function () {
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

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function showPreloader() {
        const preloader = document.createElement('div');
        preloader.className = 'preloader';
        preloader.innerHTML = '<div class="spinner"></div><p>Загрузка...</p>';
        document.body.appendChild(preloader);
        return preloader;
    }

    function hidePreloader(preloader) {
        if (preloader) {
            preloader.remove();
        }
    }

    const filterButtons = document.querySelectorAll('.btn-filter');
    const bookingCards = document.querySelectorAll('.booking-card');

    function filterCards(filter) {
        bookingCards.forEach(card => {
            const cardStatus = card.dataset.status;
            if (filter === 'all' || cardStatus === filter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterCards(this.dataset.filter);
        });
    });

    filterCards('all');

    document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', function () {
            const bookingId = this.dataset.bookingId;
            if (confirm('Вы уверены, что хотите отменить эту запись?')) {
                const preloader = showPreloader();

                const deferred = $.Deferred();

                $.ajax({
                    url: `/cancel_order/${bookingId}/`,
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    success: function (data) {
                        deferred.resolve(data);
                    },
                    error: function (xhr, status, error) {
                        deferred.reject(error);
                    }
                });

                deferred
                    .done(function (data) {
                        if (data.status === 'success') {
                            showNotification(data.message, 'success');
                            setTimeout(() => location.reload(), 1500);
                        } else {
                            showNotification(data.message || 'Ошибка при отмене записи', 'error');
                        }
                    })
                    .fail(function (error) {
                        console.error('Error:', error);
                        showNotification('Произошла ошибка при отправке запроса', 'error');
                    })
                    .always(function () {
                        hidePreloader(preloader);
                    });
            }
        });
    });

    const deleteBtn = document.getElementById('delete-account-btn');
    const modal = document.getElementById('delete-confirm-modal');
    const confirmBtn = document.getElementById('confirm-delete');
    const cancelBtn = document.getElementById('cancel-delete');

    if (deleteBtn && modal && confirmBtn && cancelBtn) {
        deleteBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        confirmBtn.addEventListener('click', () => {
            const preloader = showPreloader();

            const deleteRequest = $.ajax({
                url: '/delete_account/',
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const delay = $.Deferred();
            setTimeout(() => delay.resolve(), 1000);

            $.when(deleteRequest, delay)
                .then(function (response) {
                    const [data] = response;
                    showNotification('Аккаунт успешно удален', 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                }, function (xhr, status, error) {
                    showNotification(xhr.responseJSON?.message || 'Ошибка при удалении аккаунта', 'error');
                    modal.style.display = 'none';
                })
                .always(function () {
                    hidePreloader(preloader);
                });
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    const fileInput = document.getElementById('avatar-upload');
    const fileName = document.querySelector('.file-name');

    if (fileInput && fileName) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                fileName.textContent = this.files[0].name;

                const deferred = $.Deferred();
                deferred.resolve(this.files[0]);

                deferred
                    .then(function (file) {
                        console.log('Файл выбран:', file.name);
                        return file.size;
                    })
                    .then(function (size) {
                        console.log('Размер файла:', size, 'байт');
                        if (size > 5 * 1024 * 1024) {
                            showNotification('Файл слишком большой (макс. 5MB)', 'error');
                        }
                    });
            } else {
                fileName.textContent = 'Файл не выбран';
            }
        });
    }

    const historySlider = document.querySelector('.history-slider');
    let sliderTimeout;

    if (historySlider) {
        document.addEventListener('click', function (e) {
            if (!historySlider.contains(e.target)) {
                historySlider.style.right = '-25%';
            }
        });

        const sliderTitle = historySlider.querySelector('h2');
        if (sliderTitle) {
            sliderTitle.addEventListener('click', function () {
                if (historySlider.style.right === '0px') {
                    historySlider.style.right = '-25%';
                } else {
                    historySlider.style.right = '0';
                }
            });
        }

        historySlider.addEventListener('mouseenter', function () {
            clearTimeout(sliderTimeout);
            this.style.right = '0';
        });

        historySlider.addEventListener('mouseleave', function () {
            sliderTimeout = setTimeout(() => {
                this.style.right = '-25%';
            }, 500);
        });
    }

    const changeUsernameBtn = document.getElementById('change-username-btn');
    const changeUsernameModal = document.getElementById('change-username-modal');
    const cancelChangeUsername = document.getElementById('cancel-change-username');
    const changeUsernameForm = document.getElementById('change-username-form');

    if (changeUsernameBtn && changeUsernameModal) {
        changeUsernameBtn.addEventListener('click', () => {
            changeUsernameModal.style.display = 'flex';
        });

        cancelChangeUsername.addEventListener('click', () => {
            changeUsernameModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === changeUsernameModal) {
                changeUsernameModal.style.display = 'none';
            }
        });
    }

    if (changeUsernameForm) {
        changeUsernameForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const preloader = showPreloader();

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification(data.message, 'success');
                        document.querySelector('.profile-info h1').textContent = data.new_username;
                        changeUsernameModal.style.display = 'none';
                    } else {
                        if (data.errors) {
                            for (const field in data.errors) {
                                const errorElement = document.getElementById(`${field}-error`);
                                if (errorElement) {
                                    errorElement.textContent = data.errors[field][0].message;
                                }
                            }
                        } else {
                            showNotification(data.message || 'Ошибка при изменении логина', 'error');
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Произошла ошибка при отправке запроса', 'error');
                })
                .finally(() => {
                    hidePreloader(preloader);
                });
        });
    }

    const formInputs = document.querySelectorAll('#change-username-form input');
    formInputs.forEach(input => {
        input.addEventListener('focus', function () {
            const errorElement = document.getElementById(`${this.name}-error`);
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    });
});