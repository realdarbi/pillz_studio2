document.addEventListener('DOMContentLoaded', function () {
    // Инициализация элементов
    const elements = {
        priceDisplay: document.getElementById('calculatedPrice'),
        slider: document.getElementById('hoursSlider'),
        valueDisplay: document.getElementById('hoursValue'),
        hiddenInput: document.getElementById('id_hours'),
        unknownCheckbox: document.getElementById('id_unknown_hours'),
        unknownHint: document.getElementById('unknownHint')
    };

    const serviceContainer = document.getElementById('serviceContainer');
    if (!serviceContainer) return;

    // Инициализация цены


    // Функции обновления
    function updateSliderUI(value) {
        elements.valueDisplay.textContent = value;
        elements.hiddenInput.value = value;
    }
    const pricing = {
        basePrice: 600,
        additionalHour: 500
    };
    function calculatePrice() {
        const hours = Number(elements.hiddenInput.value) || 1;
        const unknown = elements.unknownCheckbox.checked;

        if (unknown) return pricing.basePrice; // если время неизвестно, берем базовую цену

        if (hours < 3) {
            // Для 1-2 часов - обычная цена
            return pricing.basePrice * hours;
        } else {
            // Для 3+ часов - специальная цена
            return pricing.additionalHour * hours;
        }
    }

    function updatePriceDisplay() {
        if (!elements.priceDisplay) return;
        const price = calculatePrice();
        elements.priceDisplay.textContent = price;
        serviceContainer.dataset.currentPrice = price;
    }

    // Обработчики событий
    elements.slider?.addEventListener('input', function () {
        updateSliderUI(this.value);
        updatePriceDisplay();
    });

    elements.unknownCheckbox?.addEventListener('change', function () {
        const checked = this.checked;
        elements.slider.disabled = checked;
        elements.valueDisplay.style.opacity = checked ? 0.5 : 1;
        elements.unknownHint.style.display = checked ? 'block' : 'none';
        updatePriceDisplay();
    });

    // Инициализация
    if (elements.slider) {
        updateSliderUI(elements.slider.value);
        updatePriceDisplay();
    }
});