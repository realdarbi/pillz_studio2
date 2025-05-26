document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#id_datetime", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        time_24hr: true,
        locale: "ru",
        minuteIncrement: 30,
        disable: [
            function (date) {
                return (date.getDay() === 0);
            }
        ],
        defaultDate: document.getElementById('id_datetime').dataset.defaultDate || null
    });

    const pricing = {
        basePrice: 600,
        additionalHour: 500
    };

    const elements = {
        priceDisplay: document.getElementById('calculatedPrice'),
        slider: document.getElementById('hoursSlider'),
        valueDisplay: document.getElementById('hoursValue'),
        hiddenInput: document.getElementById('id_hours'),
        unknownCheckbox: document.getElementById('id_unknown_hours'),
        unknownHint: document.getElementById('unknownHint')
    };

    function updateSliderUI(value) {
        elements.valueDisplay.textContent = value;
        elements.hiddenInput.value = value;
    }
    const serviceContainer = document.getElementById('serviceContainer');
    const pricing = {
        basePrice: Number(serviceContainer?.dataset.basePrice) || 600,
        additionalHour: function () {
            // Доп. час стоит 50% от базовой цены
            return Math.round(this.basePrice * 0.5);
        }
    };
    function calculatePrice() {
        const hours = Number(elements.hiddenInput.value) || 1;
        const unknown = elements.unknownCheckbox.checked;

        if (unknown) return pricing.basePrice;
        if (hours === 1) return pricing.basePrice;
        return pricing.basePrice + pricing.additionalHour() * (hours - 1);
    }

    function updatePriceDisplay() {
        if (!elements.priceDisplay) return;

        const price = calculatePrice();
        elements.priceDisplay.textContent = isNaN(price) ? pricing.basePrice : price;

        // Обновляем data-атрибут для других скриптов
        if (serviceContainer) {
            serviceContainer.dataset.currentPrice = price;
        }
    }

    elements.slider.addEventListener('input', function () {
        updateSliderUI(this.value);
        updatePriceDisplay();
    });

    elements.unknownCheckbox.addEventListener('change', function () {
        const checked = this.checked;
        elements.slider.disabled = checked;
        elements.valueDisplay.style.opacity = checked ? 0.5 : 1;
        if (elements.unknownHint) {
            elements.unknownHint.style.display = checked ? 'block' : 'none';
        }
        updatePriceDisplay();
    });

    updateSliderUI(elements.slider.value);
    updatePriceDisplay();
});
