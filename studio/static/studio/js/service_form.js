document.addEventListener('DOMContentLoaded', function () {
    flatpickr(".datetime-input", {
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
        ]
    });

    const style = document.createElement('style');
    style.textContent = `
        select.param-control option {
            background: var(--darkest) !important;
            color: var(--purple) !important;
        }
        select.param-control:focus option:checked {
            background: var(--purple) !important;
            color: black !important;
        }
        select.param-control option:hover {
            background: var(--purple) !important;
            color: black !important;
        }
    `;
    document.head.appendChild(style);

    const form = document.getElementById('serviceForm');
    const clearBtn = document.getElementById('clearFormBtn');
    const serviceContainer = document.getElementById('serviceContainer');
    const serviceId = serviceContainer.dataset.serviceId; 
    const userId = serviceContainer.dataset.userId; 
    const COOKIE_KEY = `service_form_data_${serviceId}_user_${userId}`; 

    const savedData = Cookies.get(COOKIE_KEY);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            for (const [name, value] of Object.entries(data)) {
                const field = form.elements[name];
                if (field) {
                    if (field.type === 'checkbox' || field.type === 'radio') {
                        field.checked = value === 'true' || value === true;
                    } else if (field.type === 'select-multiple') {
                        Array.from(field.options).forEach(option => {
                            option.selected = value.includes(option.value);
                        });
                    } else {
                        field.value = value;
                    }
                }
            }
            console.log('Данные формы восстановлены из кук');
        } catch (e) {
            console.error('Ошибка чтения кук:', e);
        }
    }

    function saveFormData() {
        const formData = new FormData(form);
        const data = {};

        Array.from(form.elements).forEach(element => {
            if (element.name && element.type !== 'submit' && element.type !== 'button') {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    data[element.name] = element.checked;
                } else if (element.type === 'select-multiple') {
                    data[element.name] = Array.from(element.selectedOptions).map(opt => opt.value);
                } else {
                    data[element.name] = element.value;
                }
            }
        });

        Cookies.set(COOKIE_KEY, JSON.stringify(data), { expires: 1 });
    }

    form.addEventListener('input', saveFormData);
    form.addEventListener('change', saveFormData);

    form.addEventListener('submit', function () {
        console.log('Removing cookie:', COOKIE_KEY);
        Cookies.remove(COOKIE_KEY);
    });

    clearBtn.addEventListener('click', function () {
        if (confirm('Вы уверены, что хотите очистить форму?')) {
            form.reset();
            Cookies.remove(COOKIE_KEY);
            document.querySelectorAll('.param-control').forEach(el => {
                if (el.type !== 'checkbox' && el.type !== 'radio') {
                    el.value = '';
                }
            });
        }
    });

    document.querySelectorAll('input[type="file"]').forEach(fileInput => {
        fileInput.addEventListener('change', function () {
            const data = JSON.parse(Cookies.get(COOKIE_KEY) || '{}');
            data[this.name] = Array.from(this.files).map(f => f.name);
            Cookies.set(COOKIE_KEY, JSON.stringify(data), { expires: 1 });
        });
    });

    function initBasePrice() {
        const serviceContainer = document.getElementById('serviceContainer');
        if (!serviceContainer) return;

        const basePrice = parseFloat("{{ service.min_price }}");
        if (!isNaN(basePrice)) {
            serviceContainer.dataset.basePrice = basePrice;
        } else {
            console.error('Invalid base price:', "{{ service.min_price }}");
            serviceContainer.dataset.basePrice = '0';
        }
    }

    initBasePrice();
    form.addEventListener('change', calculatePrice);
    form.addEventListener('input', calculatePrice);
});
console.log('Service ID:', serviceId);
console.log('Cookie key:', COOKIE_KEY);
console.log('Saved data:', savedData);