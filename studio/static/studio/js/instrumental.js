document.addEventListener('DOMContentLoaded', function () {
    const refInput = document.getElementById('id_references');
    const refError = document.getElementById('ref-error');

    function isValidExtension(file, allowedExtensions) {
        const fileName = file.name.toLowerCase();
        return allowedExtensions.some(ext => fileName.endsWith(ext));
    }

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

        if (refInput.files.length > 0) {
            const allowed = ['.mp3', '.wav'];
            const invalidFiles = Array.from(refInput.files).filter(
                file => !isValidExtension(file, allowed)
            );

            if (invalidFiles.length > 0) {
                refError.textContent = 'Недопустимые форматы файлов';
                refError.style.display = 'block';
                isValid = false;
            }
        }

        if (!isValid) {
            e.preventDefault();
            document.querySelector('.file-error[style*="display: block"]')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });
});
