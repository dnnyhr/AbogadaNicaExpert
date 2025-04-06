// Menú lateral
const menuButton = document.getElementById('menuButton');
const closeButton = document.getElementById('closeButton');
const sidebar = document.getElementById('sidebar');

menuButton.addEventListener('click', () => {
    sidebar.classList.add('active');
});

closeButton.addEventListener('click', () => {
    sidebar.classList.remove('active');
});

// Testimoniales
const testimonialDots = document.querySelectorAll('.testimonial-dot');
const testimonialSlides = document.querySelectorAll('.testimonial-slide');

testimonialDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideIndex = dot.getAttribute('data-slide');
        
        // Eliminar clase active de todos los slides y dots
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        testimonialDots.forEach(dot => dot.classList.remove('active'));
        
        // Añadir clase active al slide y dot correspondiente
        testimonialSlides[slideIndex].classList.add('active');
        dot.classList.add('active');
    });
});

// Rotación automática de testimoniales
let currentSlide = 0;

function rotateTestimonials() {
    testimonialSlides.forEach(slide => slide.classList.remove('active'));
    testimonialDots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (currentSlide + 1) % testimonialSlides.length;
    
    testimonialSlides[currentSlide].classList.add('active');
    testimonialDots[currentSlide].classList.add('active');
}

setInterval(rotateTestimonials, 6000);

// Botón de regreso arriba
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('active');
    } else {
        backToTop.classList.remove('active');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Scroll suave para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
        
        // Cerrar sidebar si está abierto
        sidebar.classList.remove('active');
    });
});
function shareArticle(network, event) {
    event.preventDefault();
    const titleElement = document.querySelector('.article-header h1');
    const title = titleElement ? titleElement.innerText : document.title;
    const url = window.location.href;
    // Texto enriquecido para una tarjeta de artículo más llamativa
    const text = "¡No te pierdas este increíble artículo! Descúbrelo: " + title + " " + url;
    let shareUrl = "";
    if (network === 'facebook') {
        shareUrl = "https://www.facebook.com/sharer/sharer.php?quote=" + encodeURIComponent(text) + "&u=" + encodeURIComponent(url);
        window.open(shareUrl, '_blank');
    } else if (network === 'twitter') {
        shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
        window.open(shareUrl, '_blank');
    } else if (network === 'linkedin') {
        shareUrl = "https://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(url) + 
                   "&title=" + encodeURIComponent(title) + "&summary=" + encodeURIComponent(text) +
                   "&source=" + encodeURIComponent(url);
        window.open(shareUrl, '_blank');
    } else if (network === 'whatsapp') {
        shareUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
        window.open(shareUrl, '_blank');
    } else if (network === 'clipboard') {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert('Texto copiado al portapapeles.');
            })
            .catch(err => {
                alert('Error al copiar el texto: ' + err);
            });
    }
}
