document.addEventListener('DOMContentLoaded', function () {
    const serviceContainer = document.getElementById('serviceContainer');
    const basePrice = serviceContainer ? parseInt(serviceContainer.dataset.basePrice) : 0;

    const refInput = document.getElementById('id_references');
    const refError = document.getElementById('ref-error');
    const deadlineInput = document.getElementById('id_deadline');
    const urgentCheckbox = document.getElementById('id_urgent');
    const priceDisplay = document.getElementById('calculatedPrice');
    const form = document.querySelector('form');

    function updatePrice() {
        if (!priceDisplay) return;

        let price = basePrice;

        if (isNaN(price) || price <= 0) {
            console.error('Invalid base price:', basePrice);
            price = 0; 
        }

        if (urgentCheckbox && urgentCheckbox.checked) {
            price = Math.round(price * 1.3); 
        }

        if (deadlineInput && deadlineInput.value) {
            const deadline = new Date(deadlineInput.value);
            const now = new Date();
            const minDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); 

            if (deadline < minDeadline && urgentCheckbox && !urgentCheckbox.checked) {
                urgentCheckbox.checked = true;
                price = Math.round(price * 1.3);
            }
        }

        priceDisplay.textContent = price;
        if (serviceContainer) {
            serviceContainer.dataset.currentPrice = price;
        }
    }

    function isValidExtension(file, allowedExtensions) {
        const fileName = file.name.toLowerCase();
        return allowedExtensions.some(ext => fileName.endsWith(ext));
    }

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

    urgentCheckbox?.addEventListener('change', updatePrice);

    form?.addEventListener('submit', function (e) {
        if (deadlineInput && !deadlineInput.value) {
            alert('Пожалуйста, укажите срок выполнения');
            e.preventDefault();
        }
    });

    if (typeof flatpickr !== 'undefined' && deadlineInput) {
        flatpickr(deadlineInput, {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            minDate: "today",
            time_24hr: true,
            locale: "ru" 
        });
    }

    updatePrice();
});