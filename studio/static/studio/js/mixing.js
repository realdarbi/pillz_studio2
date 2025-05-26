document.addEventListener('DOMContentLoaded', function () {
    const zipInput = document.getElementById('id_zip_file');
    const refInput = document.getElementById('id_references');
    const zipError = document.getElementById('zip-error');
    const refError = document.getElementById('ref-error');
    const expressCheckbox = document.getElementById('id_express');
    const masteringCheckbox = document.getElementById('id_mastering');
    const priceDisplay = document.getElementById('calculatedPrice');
    const deadlineInput = document.getElementById('id_deadline');

    const EXPRESS_PRICE = 700;
    const MASTERING_PRICE = 500;

    function isValidExtension(file, allowedExtensions) {
        const fileName = file.name.toLowerCase();
        return allowedExtensions.some(ext => fileName.endsWith(ext));
    }

    zipInput.addEventListener('change', function () {
        zipError.style.display = 'none';

        if (this.files.length > 0) {
            const file = this.files[0];
            const allowed = ['.zip', '.rar'];

            if (!isValidExtension(file, allowed)) {
                zipError.textContent = 'Ошибка: допустимы только файлы ZIP и RAR';
                zipError.style.display = 'block';
                this.value = '';
            } else if (file.size > 100 * 1024 * 1024) {
                zipError.textContent = 'Ошибка: размер архива не должен превышать 100MB';
                zipError.style.display = 'block';
                this.value = '';
            }
        }
    });

    refInput.addEventListener('change', function () {
        refError.style.display = 'none';

        if (this.files.length > 0) {
            const allowed = ['.mp3', '.wav'];
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
                refError.textContent = `Недопустимые форматы: ${invalidFiles.join(', ')}. Только MP3/WAV`;
                refError.style.display = 'block';

                const dt = new DataTransfer();
                validFiles.forEach(file => dt.items.add(file));
                this.files = dt.files;
            }

            if (this.files.length > 5) {
                refError.textContent = 'Максимум 5 файлов';
                refError.style.display = 'block';

                const dt = new DataTransfer();
                Array.from(this.files).slice(0, 5).forEach(file => dt.items.add(file));
                this.files = dt.files;
            }
        }
    });

    document.querySelector('form').addEventListener('submit', function (e) {
        let isValid = true;

        if (zipInput.files.length === 0) {
            zipError.textContent = 'Пожалуйста, загрузите архив';
            zipError.style.display = 'block';
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
            document.querySelector('.file-error[style*="display: block"]')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });

    function updatePrice() {
        let finalPrice = BASE_PRICE;

        if (expressCheckbox.checked) {
            finalPrice = EXPRESS_PRICE;
        } else if (masteringCheckbox.checked) {
            finalPrice = BASE_PRICE + MASTERING_PRICE;
        }

        if (priceDisplay) {
            priceDisplay.textContent = finalPrice;
        }
    }

    if (expressCheckbox) expressCheckbox.addEventListener('change', updatePrice);
    if (masteringCheckbox) masteringCheckbox.addEventListener('change', updatePrice);

    updatePrice();

    deadlineInput?.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const now = new Date();
        const minDeadline = new Date(now.getTime() + 12 * 60 * 60 * 1000); // +12 часов

        if (selectedDate < minDeadline) {
            alert('Минимальный срок выполнения - 12 часов');
            this.value = '';
        }
    });
});
