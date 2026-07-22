document.addEventListener('DOMContentLoaded', function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const slideInterval = 5000; 

    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }


    showSlide(0);
    setInterval(nextSlide, slideInterval)

    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        const hue = 270 + Math.floor(Math.random() * 30) - 15;
        card.style.borderLeftColor = `hsl(${hue}, 80%, 60%)`;

        card.addEventListener('mouseenter', function () {
            this.style.boxShadow = `0 10px 25px hsla(${hue}, 80%, 60%, 0.3)`;
        });

        card.addEventListener('mouseleave', function () {
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        });
    });

    const backToTopButton = document.getElementById('backToTopBtn');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {  
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});