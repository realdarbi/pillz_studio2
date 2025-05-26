document.addEventListener('DOMContentLoaded', function () {
    const refInput = document.getElementById('id_references');
    const refError = document.getElementById('ref-error');
    const deadlineInput = document.getElementById('id_deadline');

    function isValidExtension(file, allowedExtensions) {
        const fileName = file.name.toLowerCase();
        return allowedExtensions.some(ext => fileName.endsWith(ext));
    }

    refInput.addEventListener('change', function () {
        refError.style.display = 'none';

        if (this.files.length > 0) {
            const allowed = ['.txt', '.pdf', '.mp3', '.wav'];
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
                refError.textContent = `Недопустимые форматы: ${invalidFiles.join(', ')}. Разрешены TXT, PDF, MP3, WAV`;
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

    deadlineInput.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const now = new Date();
        const minDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 часа

        if (selectedDate < minDeadline) {
            alert('Минимальный срок выполнения - 24 часа');
            this.value = '';
        }
    });

    document.querySelector('form').addEventListener('submit', function (e) {
        let isValid = true;

        if (!deadlineInput.value) {
            alert('Пожалуйста, укажите срок выполнения');
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
});
