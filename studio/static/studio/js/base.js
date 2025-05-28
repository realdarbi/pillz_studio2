document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.alert').remove();
        });
    });

    document.querySelectorAll('.pill-effect').forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    initNavbar();
    initFooter();
});

function initNavbar() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.opacity = '0.8';
        });
        link.addEventListener('mouseleave', () => {
            link.style.opacity = '1';
        });
    });
}

function initFooter() {
    const yearElement = document.querySelector('.copyright');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = ` Студия звукозаписи. Все права защищены.`;
    }
}