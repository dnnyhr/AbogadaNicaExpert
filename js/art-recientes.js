// Script para cargar y mostrar los artículos más recientes de todas las categorías
document.addEventListener('DOMContentLoaded', function() {
    // Array de rutas a los archivos JSON que contienen los artículos
    // Ahora incluyen el prefijo '/contenido/' correctamente
    const jsonPaths = [
        '/contenido/articulos/index.json',
        '/contenido/diccionario/index.json',
        '/contenido/casos/index.json',
        '/contenido/tutorias/index.json'
    ];

    // Contenedor donde se mostrarán los artículos
    const articlesContainer = document.querySelector('.articles-grid');
    
    // Función para cargar los JSON
    async function cargarArticulos() {
        try {
            // Array para almacenar todos los artículos
            let todosLosArticulos = [];
            
            // Obtener los datos de cada archivo JSON
            const promesas = jsonPaths.map(path => 
                fetch(path)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error al cargar ${path}: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Extraer la categoría de la ruta completa
                        const pathParts = path.split('/');
                        const categoria = pathParts[pathParts.length - 2]; // Extrae 'articulos', 'diccionario', etc.
                        
                        // Añadir cada artículo al array con su categoría
                        if (data.articulos && Array.isArray(data.articulos)) {
                            data.articulos.forEach(articulo => {
                                articulo.fuenteCategoria = categoria;
                                todosLosArticulos.push(articulo);
                            });
                        }
                    })
                    .catch(error => {
                        console.error(`Error cargando ${path}:`, error);
                    })
            );
            
            // Esperar a que todas las promesas se resuelvan
            await Promise.all(promesas);
            
            // Ordenar los artículos por fecha (más recientes primero)
            todosLosArticulos.sort((a, b) => {
                return new Date(b.fecha) - new Date(a.fecha);
            });
            
            // Mostrar solo los 3 artículos más recientes
            mostrarArticulosRecientes(todosLosArticulos.slice(0, 3));
            
            // Actualizar contador de artículos en el botón de "Ver todos"
            const viewAllBtn = document.querySelector('.view-all-btn');
            if (viewAllBtn) {
                viewAllBtn.textContent = `Ver todos los artículos (${todosLosArticulos.length})`;
            }
            
        } catch (error) {
            console.error('Error al cargar los artículos:', error);
            articlesContainer.innerHTML = '<p class="error-message">Hubo un problema al cargar los artículos. Por favor, intenta de nuevo más tarde.</p>';
        }
    }
    
    // Función para mostrar los artículos recientes en el DOM
    function mostrarArticulosRecientes(articulos) {
        // Limpiar el contenedor antes de añadir nuevos artículos
        articlesContainer.innerHTML = '';
        
        if (articulos.length === 0) {
            articlesContainer.innerHTML = '<p class="no-articles">No hay artículos disponibles actualmente.</p>';
            return;
        }
        
        // Crear elementos HTML para cada artículo
        articulos.forEach(articulo => {
            // Mapeo para nombres más amigables de las categorías
            const categoriasMostrar = {
                'articulos': 'Artículo Legal',
                'diccionario': 'Diccionario Jurídico',
                'casos': 'Caso Real',
                'tutorias': 'Tutoría'
            };
            
            // Obtener la primera categoría del artículo si existe
            let categoriaTexto = articulo.fuenteCategoria ? 
                categoriasMostrar[articulo.fuenteCategoria] : 
                (articulo.categorias && articulo.categorias.length > 0 ? 
                    articulo.categorias[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                    'General');
            
            // Formatear fecha en español
            const fecha = new Date(articulo.fecha);
            const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
            const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
            
            // Crear el HTML del artículo
            const articuloHTML = `
                <div class="article-card" data-url="${articulo.ruta}">
                    <div class="article-image" style="background-image: url('${articulo.imagen || '/api/placeholder/800/500'}');">
                    </div>
                    <div class="article-content">
                        <span class="article-category">${categoriaTexto}</span>
                        <h3 class="article-title">${articulo.titulo}</h3>
                        <p class="article-excerpt">${articulo.extracto}</p>
                        <div class="article-meta">
                            <span><i class="far fa-calendar"></i> ${fechaFormateada}</span>
                            <span><i class="far fa-comment"></i> ${articulo.comentarios || 0} comentarios</span>
                            ${articulo.autor ? `<span><i class="far fa-user"></i> ${articulo.autor}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar el artículo al contenedor
            articlesContainer.innerHTML += articuloHTML;
        });
        
        // Añadir event listeners a las tarjetas de artículos
        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', function() {
                // Redirigir a la página del artículo usando el atributo data-url
                const url = this.getAttribute('data-url');
                if (url) {
                    window.location.href = url;
                }
            });
        });
    }
    
    // Inicializar la carga de artículos
    cargarArticulos();
    
    // Event listener para el botón "Ver todos los artículos"
    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            // Redireccionar a la página de todos los artículos
            window.location.href = '/contenido/todos-los-articulos.html';
        });
    }
    
    // Agregar manejador de errores para mostrar mensaje amigable
    window.addEventListener('error', function(event) {
        console.error('Error capturado:', event.error);
        // Solo mostrar mensaje si el error está relacionado con la carga de JSON
        if (event.error && (event.error.message.includes('JSON') || event.error.message.includes('fetch'))) {
            articlesContainer.innerHTML = '<p class="error-message">No se pudieron cargar los artículos. Por favor, verifica la conexión e intenta de nuevo.</p>';
        }
    });
});