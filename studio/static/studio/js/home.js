// ===== ПЕРЕМЕННЫЕ =====
let slideInterval = null;
let mapsInitialized = false;

// ===== CHAOS DROPS — ИНТЕРАКТИВНЫЙ ЛОГОТИП =====
(function initChaosLogo() {
    const wrapper = document.getElementById('logoWrapper');
    const container = document.getElementById('logoContainer');
    const counter = document.getElementById('logoCounter');
    const logoImg = document.getElementById('mainLogo');

    if (!wrapper || !container || !logoImg) return;

    let count = 1;
    let holdTimer = null;
    let isHolding = false;
    let isAnimating = false;

    // Создаём элемент для вспышки
    const flash = document.createElement('div');
    flash.className = 'flash-overlay';
    wrapper.appendChild(flash);

    function updateLogos(newCount, isMerge = false) {
        if (isAnimating) return;
        isAnimating = true;

        container.innerHTML = '';
        container.className = 'logo-container';

        for (let i = 0; i < newCount; i++) {
            const img = document.createElement('img');
            img.src = logoImg.src;
            img.alt = 'Pillz Studio';
            img.className = 'main-logo';
            // Случайная задержка для плавности
            const delay = Math.random() * 0.2;
            img.style.animationDelay = delay + 's';
            // Случайный поворот
            const rotation = (Math.random() - 0.5) * 20;
            img.style.transform = `rotate(${rotation}deg)`;
            container.appendChild(img);
        }

        if (isMerge) {
            container.classList.add('merging');
            // ВСПЫШКА ПРИ СЛИЯНИИ
            flash.classList.remove('active');
            // Триггерим перерисовку
            void flash.offsetWidth;
            flash.classList.add('active');
            setTimeout(() => {
                flash.classList.remove('active');
            }, 700);
            setTimeout(() => {
                container.classList.remove('merging');
            }, 800);
        }

        count = newCount;

        // Обновляем счётчик с плавной анимацией
        counter.textContent = count;
        counter.classList.add('show', 'animate');
        setTimeout(() => {
            counter.classList.remove('animate');
        }, 600);

        isAnimating = false;
    }

    function nextStep() {
        if (isAnimating) return;

        let newCount;
        let isMerge = false;

        if (count === 1) newCount = 2;
        else if (count === 2) newCount = 4;
        else if (count === 4) newCount = 8;
        else if (count === 8) {
            newCount = 1;
            isMerge = true;
        }

        updateLogos(newCount, isMerge);
    }

    function startHold(e) {
        e.preventDefault();
        if (isAnimating) return;

        isHolding = true;
        wrapper.classList.add('holding');

        holdTimer = setTimeout(() => {
            if (isHolding && !isAnimating) {
                nextStep();
                if (navigator.vibrate) navigator.vibrate(20);
            }
        }, 1200);
    }

    function endHold(e) {
        isHolding = false;
        wrapper.classList.remove('holding');

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    }

    // Mouse
    wrapper.addEventListener('mousedown', startHold);
    document.addEventListener('mouseup', endHold);
    document.addEventListener('mouseleave', endHold);

    // Touch
    wrapper.addEventListener('touchstart', startHold, { passive: false });
    document.addEventListener('touchend', endHold, { passive: true });
    document.addEventListener('touchcancel', endHold, { passive: true });

    // Сброс при переключении студий
    const origGoHome = window.goHome;
    window.goHome = function() {
        if (typeof origGoHome === 'function') origGoHome();
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        isHolding = false;
        wrapper.classList.remove('holding');
        if (count !== 1) {
            updateLogos(1);
        }
    };

    updateLogos(1);
    console.log('🎲 Chaos Drops логотип активирован! (плавинг версия)');
})();
// ===== ПЕРЕКЛЮЧЕНИЕ СТУДИЙ =====
function switchStudio(name, direction) {
    const mainPage = document.getElementById('main-page');
    const pillzPage = document.getElementById('studio-pillz');
    const spacePage = document.getElementById('studio-space');

    mainPage.style.display = 'none';

    pillzPage.classList.remove('active', 'slide-left');
    spacePage.classList.remove('active', 'slide-left');

    if (name === 'pillz') {
        pillzPage.classList.add('active');
        if (direction === 'left') pillzPage.classList.add('slide-left');
        spacePage.classList.remove('active');
    } else if (name === 'space') {
        spacePage.classList.add('active');
        pillzPage.classList.remove('active');
    }

    startSlideshow(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('backToTopBtn').style.display = 'block';

    if (!mapsInitialized) {
        setTimeout(initMaps, 400);
        mapsInitialized = true;
    } else {
        setTimeout(() => {
            ['pillz', 'space'].forEach((key) => {
                const el = document.getElementById(`map-${key}`);
                if (el && el._leaflet_id) {
                    const map = L.map(el);
                    setTimeout(() => map.invalidateSize(), 200);
                }
            });
        }, 500);
    }

    setTimeout(() => {
        if (typeof initEquipment === 'function') {
            initEquipment();
        }
    }, 500);
}

// ===== ВОЗВРАТ НА ГЛАВНУЮ =====
function goHome() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }

    document.getElementById('studio-pillz').classList.remove('active', 'slide-left');
    document.getElementById('studio-space').classList.remove('active', 'slide-left');
    document.getElementById('main-page').style.display = 'flex';
    document.getElementById('backToTopBtn').style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== СЛАЙДШОУ =====
function startSlideshow(studio) {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }

    const page = document.getElementById(`studio-${studio}`);
    if (!page) return;

    const slides = page.querySelectorAll('.studio-hero .slide');
    if (slides.length < 2) return;

    let current = 0;

    slides.forEach((s, i) => {
        s.classList.toggle('active', i === 0);
        if (i === 0) s.classList.add('zoom');
        else s.classList.remove('zoom');
    });

    slideInterval = setInterval(() => {
        slides[current].classList.remove('active', 'zoom');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active', 'zoom');
    }, 4500);
}

// ===== КАРТЫ =====
function initMaps() {
    const studios = {
        pillz: {
            lat: 56.0147,
            lng: 92.8396,
            name: 'Pillz Studio',
            address: 'г. Красноярск, ул. Республики, 51'
        },
        space: {
            lat: 56.0067,
            lng: 92.8572,
            name: 'Space Pillz',
            address: 'г. Красноярск, ул. Дубровинского, 43'
        }
    };

    ['pillz', 'space'].forEach((key) => {
        const el = document.getElementById(`map-${key}`);
        if (!el) return;
        if (el._leaflet_id) return;

        const data = studios[key];
        const map = L.map(el, {
            center: [data.lat, data.lng],
            zoom: 16,
            zoomControl: true,
            attributionControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // ===== ЗАПРЕЩАЕМ ВСПЛЫТИЕ СОБЫТИЙ С КАРТЫ =====
        el.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        el.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
        el.addEventListener('mouseup', function(e) {
            e.stopPropagation();
        });

        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: #4ecdc4;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 3px solid #fff;
                box-shadow: 0 0 30px rgba(78, 205, 196, 0.6);
            "></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        L.marker([data.lat, data.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
                <strong>${data.name}</strong><br>
                ${data.address}
            `)
            .openPopup();

        setTimeout(() => map.invalidateSize(), 300);
    });
}
// В home.js, после инициализации карт
document.querySelectorAll('.map-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
        // Если клик был внутри карты — блокируем
        if (e.target.closest('.map-container')) {
            e.stopPropagation();
        }
    });
});
// ===== ОБОРУДОВАНИЕ =====
function initEquipment() {
    document.querySelectorAll('.equipment-section').forEach((section) => {
        const scrollContainer = section.querySelector('.equipment-scroll');
        const progressContainer = section.querySelector('.equipment-progress');
        const leftBtn = section.querySelector('[data-scroll-left]');
        const rightBtn = section.querySelector('[data-scroll-right]');

        if (!scrollContainer) return;

        const cards = scrollContainer.querySelectorAll('.equipment-card');
        const totalCards = cards.length;

        if (progressContainer) {
            progressContainer.innerHTML = '';
            for (let i = 0; i < totalCards; i++) {
                const dot = document.createElement('span');
                dot.className = 'equipment-progress-dot' + (i === 0 ? ' active' : '');
                progressContainer.appendChild(dot);
            }
        }

        function updateProgress() {
            const scrollLeft = scrollContainer.scrollLeft;
            const scrollWidth = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            const progress = scrollWidth > 0 ? scrollLeft / scrollWidth : 0;
            const activeIndex = Math.round(progress * (totalCards - 1));

            const dots = progressContainer?.querySelectorAll('.equipment-progress-dot');
            dots?.forEach((dot, i) => {
                dot.classList.toggle('active', i === activeIndex);
            });
        }

        function scrollTo(direction) {
            const cardWidth = cards[0]?.offsetWidth || 140;
            const gap = 16;
            const scrollAmount = (cardWidth + gap) * 2;

            if (direction === 'left') {
                scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }

            setTimeout(updateProgress, 350);
        }

        // Убираем старые обработчики
        const newLeftBtn = leftBtn?.cloneNode(true);
        const newRightBtn = rightBtn?.cloneNode(true);
        if (leftBtn && leftBtn.parentNode) {
            leftBtn.parentNode.replaceChild(newLeftBtn, leftBtn);
        }
        if (rightBtn && rightBtn.parentNode) {
            rightBtn.parentNode.replaceChild(newRightBtn, rightBtn);
        }

        if (newLeftBtn) newLeftBtn.addEventListener('click', () => scrollTo('left'));
        if (newRightBtn) newRightBtn.addEventListener('click', () => scrollTo('right'));

        scrollContainer.addEventListener('scroll', updateProgress);
        window.addEventListener('resize', updateProgress);

        setTimeout(updateProgress, 300);

        // Свайп мышкой
        let isDown = false;
        let startX;
        let scrollLeftPos;

        const onMouseDown = (e) => {
            isDown = true;
            startX = e.pageX - scrollContainer.offsetLeft;
            scrollLeftPos = scrollContainer.scrollLeft;
            scrollContainer.style.cursor = 'grabbing';
        };

        const onMouseLeave = () => {
            isDown = false;
            scrollContainer.style.cursor = 'grab';
        };

        const onMouseUp = () => {
            isDown = false;
            scrollContainer.style.cursor = 'grab';
        };

        const onMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scrollContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            scrollContainer.scrollLeft = scrollLeftPos - walk;
        };

        scrollContainer.removeEventListener('mousedown', onMouseDown);
        scrollContainer.removeEventListener('mouseleave', onMouseLeave);
        scrollContainer.removeEventListener('mouseup', onMouseUp);
        scrollContainer.removeEventListener('mousemove', onMouseMove);

        scrollContainer.addEventListener('mousedown', onMouseDown);
        scrollContainer.addEventListener('mouseleave', onMouseLeave);
        scrollContainer.addEventListener('mouseup', onMouseUp);
        scrollContainer.addEventListener('mousemove', onMouseMove);
    });
}

// ===== КЛИК ПО КАРТОЧКАМ =====
document.querySelectorAll('.studio-card-main').forEach(card => {
    card.addEventListener('click', function() {
        const isPillz = this.classList.contains('pillz');
        switchStudio(isPillz ? 'pillz' : 'space', isPillz ? 'left' : 'right');
    });
});

// ===== КЛАВИАТУРА =====
document.addEventListener('keydown', (e) => {
    const mainPage = document.getElementById('main-page');
    if (mainPage.style.display !== 'none') {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            switchStudio('pillz', 'left');
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            switchStudio('space', 'right');
        }
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
        goHome();
    }
});

// ===== КНОПКА НАВЕРХ =====
const backToTopBtn = document.getElementById('backToTopBtn');
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
    if (document.getElementById('main-page').style.display === 'none') {
        backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    }
});

// ===== СКРЫВАЕМ КНОПКУ НА ГЛАВНОЙ =====
const observer = new MutationObserver(() => {
    if (document.getElementById('main-page').style.display !== 'none') {
        backToTopBtn.style.display = 'none';
    }
});
observer.observe(document.getElementById('main-page'), {
    attributes: true,
    attributeFilter: ['style']
});

// ===== СТАРТ =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('main-page').style.display = 'flex';
    setTimeout(initEquipment, 300);
});

// Экспортируем для использования в других скриптах
window.initEquipment = initEquipment;
window.switchStudio = switchStudio;
window.goHome = goHome;
document.addEventListener('DOMContentLoaded', function() {
    // Запрещаем кликам на картах вызывать переходы
    document.querySelectorAll('.map-container').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        // Также блокируем mousedown, чтобы не срабатывали родительские обработчики
        el.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
        el.addEventListener('mouseup', function(e) {
            e.stopPropagation();
        });
    });
});