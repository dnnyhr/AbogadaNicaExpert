        // Scripts para el menú lateral
        document.getElementById('menuButton').addEventListener('click', function() {
            document.getElementById('sidebar').classList.add('active');
        });
        
        document.getElementById('closeButton').addEventListener('click', function() {
            document.getElementById('sidebar').classList.remove('active');
        });
        
        // Script para el botón de regreso arriba
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                document.getElementById('backToTop').classList.add('active');
            } else {
                document.getElementById('backToTop').classList.remove('active');
            }
        });
        
        document.getElementById('backToTop').addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Script para el contador de redirección
        let countdownValue = 5;
        const countdownElement = document.getElementById('countdown');
        const countdownTextElement = document.getElementById('countdown-text');
        
        const countdownInterval = setInterval(function() {
            countdownValue--;
            countdownElement.textContent = countdownValue;
            countdownTextElement.textContent = countdownValue;
            
            if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                window.location.href = '/index.html';
            }
        }, 1000);