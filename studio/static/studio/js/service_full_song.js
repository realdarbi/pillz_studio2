document.addEventListener('DOMContentLoaded', function () {
    // Получаем базовую цену из контейнера
    const serviceContainer = document.getElementById('serviceContainer');
    const basePrice = serviceContainer ? parseInt(serviceContainer.dataset.basePrice) : 0;

    // Элементы формы
    const refInput = document.getElementById('id_references');
    const refError = document.getElementById('ref-error');
    const deadlineInput = document.getElementById('id_deadline');
    const urgentCheckbox = document.getElementById('id_urgent');
    const priceDisplay = document.getElementById('calculatedPrice');
    const form = document.querySelector('form');

    // Обновление цены
    function updatePrice() {
        if (!priceDisplay) return;

        let price = basePrice;

        // Проверяем валидность базовой цены
        if (isNaN(price) || price <= 0) {
            console.error('Invalid base price:', basePrice);
            price = 0; // Запасное значение
        }

        // Применяем наценки
        if (urgentCheckbox && urgentCheckbox.checked) {
            price = Math.round(price * 1.3); // +30% за срочность
        }

        // Автоматически применяем срочность при выборе близкого дедлайна
        if (deadlineInput && deadlineInput.value) {
            const deadline = new Date(deadlineInput.value);
            const now = new Date();
            const minDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 дня

            if (deadline < minDeadline && urgentCheckbox && !urgentCheckbox.checked) {
                urgentCheckbox.checked = true;
                price = Math.round(price * 1.3);
            }
        }

        // Обновляем отображение и сохраняем цену в data-атрибуте
        priceDisplay.textContent = price;
        if (serviceContainer) {
            serviceContainer.dataset.currentPrice = price;
        }
    }

    // Проверка расширения файла (без изменений)
    function isValidExtension(file, allowedExtensions) {
        const fileName = file.name.toLowerCase();
        return allowedExtensions.some(ext => fileName.endsWith(ext));
    }

    // Обработчик файлов (без изменений)
    refInput?.addEventListener('change', function () {
        refError.style.display = 'none';

        if (this.files.length > 0) {
            const allowed = ['.mp3', '.wav', '.txt', '.pdf'];
            let validFiles = [];
            let invalidFiles = [];

            Array.from(this.files).forEach(file => {
                if (isValidExtension(file, allowed)) {
                    validFiles.push(file);
                } else {
                    invalidFiles.push(file.name);
                }
            });

            if (invalidFiles.length > 0) {
                refError.textContent = `Недопустимые форматы: ${invalidFiles.join(', ')}. Разрешены MP3, WAV, TXT, PDF`;
                refError.style.display = 'block';

                const dt = new DataTransfer();
                validFiles.forEach(file => dt.items.add(file));
                this.files = dt.files;
            }

            if (this.files.length > 10) {
                refError.textContent = 'Максимум 10 файлов';
                refError.style.display = 'block';

                const dt = new DataTransfer();
                Array.from(this.files).slice(0, 10).forEach(file => dt.items.add(file));
                this.files = dt.files;
            }
        }
    });

    // Обработчик срока выполнения
    deadlineInput?.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const now = new Date();
        const minDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        if (selectedDate < minDeadline) {
            if (!confirm('Выбран срок менее 3 дней. Будет применена срочная наценка 30%. Продолжить?')) {
                this.value = '';
            } else if (urgentCheckbox) {
                urgentCheckbox.checked = true;
            }
        }
        updatePrice();
    });

    // Обработчик срочного заказа
    urgentCheckbox?.addEventListener('change', updatePrice);

    // Валидация формы
    form?.addEventListener('submit', function (e) {
        if (deadlineInput && !deadlineInput.value) {
            alert('Пожалуйста, укажите срок выполнения');
            e.preventDefault();
        }
    });

    // Инициализация flatpickr
    if (typeof flatpickr !== 'undefined' && deadlineInput) {
        flatpickr(deadlineInput, {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            minDate: "today",
            time_24hr: true,
            locale: "ru" // Добавляем русскую локализацию
        });
    }

    // Инициализация цены при загрузке
    updatePrice();
});