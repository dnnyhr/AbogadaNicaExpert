/**
 * Función para encontrar contenido relacionado con el artículo actual
 * @param {string} contenidoId - ID del contenido actual (artículo, caso, etc.)
 * @param {string} tipoContenido - Tipo de contenido ('articulo', 'caso', 'tutoria', 'termino')
 * @returns {Object} - Objeto con arrays de contenido relacionado
 */
function encontrarContenidoRelacionado(contenidoId, tipoContenido = 'articulo') {
    // Obtener el contenido actual según su tipo
    let contenidoActual = null;
    
    switch (tipoContenido) {
      case 'articulo':
        contenidoActual = legalContent.articulos.find(art => art.id === contenidoId);
        break;
      case 'caso':
        contenidoActual = legalContent.casos.find(caso => caso.id === contenidoId);
        break;
      case 'tutoria':
        contenidoActual = legalContent.tutorias.find(tut => tut.id === contenidoId);
        break;
      case 'termino':
        contenidoActual = legalContent.diccionario.find(term => term.id === contenidoId);
        break;
      default:
        return null;
    }
    
    if (!contenidoActual) return null;
    
    const resultado = {
      articulosRelacionados: [],
      casosRelacionados: [],
      tutoriasRelacionadas: [],
      terminosRelacionados: []
    };
    
    // Obtener categorías y etiquetas del contenido actual
    const categorias = contenidoActual.categorias || [];
    const etiquetas = contenidoActual.etiquetas || [];
    const terminos = contenidoActual.terminos || [];
    
    // Constantes para el sistema de puntuación equilibrado
    const PUNTOS_CATEGORIA = 2;
    const PUNTOS_ETIQUETA = 2;
    const PUNTOS_TERMINO = 2;
    const PUNTOS_ETIQUETA_ESPECIALIZADA = 1; // Puntos adicionales para etiquetas consideradas especializadas
    
    // Lista de etiquetas consideradas especializadas
    const etiquetasEspecializadas = [
      'despido-injustificado', 'indemnizacion', 'acoso-laboral', 
      'calculo', 'demanda', 'proceso', 'reintegro'
    ];
    
    // Función genérica para calcular la puntuación entre dos contenidos
    function calcularPuntuacion(contenido) {
      let puntuacion = 0;
      
      // Puntuar por categorías coincidentes
      contenido.categorias?.forEach(cat => {
        if (categorias.includes(cat)) puntuacion += PUNTOS_CATEGORIA;
      });
      
      // Puntuar por etiquetas coincidentes
      contenido.etiquetas?.forEach(tag => {
        if (etiquetas.includes(tag)) {
          puntuacion += PUNTOS_ETIQUETA;
          
          // Puntos adicionales para etiquetas especializadas
          if (etiquetasEspecializadas.includes(tag)) {
            puntuacion += PUNTOS_ETIQUETA_ESPECIALIZADA;
          }
        }
      });
      
      // Puntuar por términos coincidentes (si existen)
      const contenidoTerminos = contenido.terminos || [];
      contenidoTerminos.forEach(term => {
        if (terminos?.includes(term)) puntuacion += PUNTOS_TERMINO;
      });
      
      return puntuacion;
    }
    
    // Procesar artículos
    legalContent.articulos.forEach(articulo => {
      // Asegurarnos de que no estamos añadiendo el mismo contenido
      if (tipoContenido === 'articulo' && articulo.id === contenidoId) return;
      
      const puntuacion = calcularPuntuacion(articulo);
      
      // Si tiene suficiente relevancia, añadirlo a los resultados
      if (puntuacion > 1) {
        resultado.articulosRelacionados.push({
          ...articulo,
          tipo: 'Artículo',
          puntuacion
        });
      }
    });
    
    // Procesar casos
    legalContent.casos.forEach(caso => {
      // Asegurarnos de que no estamos añadiendo el mismo contenido
      if (tipoContenido === 'caso' && caso.id === contenidoId) return;
      
      const puntuacion = calcularPuntuacion(caso);
      
      if (puntuacion > 1) {
        resultado.casosRelacionados.push({
          ...caso,
          tipo: 'Caso Real',
          puntuacion
        });
      }
    });
    
    // Procesar tutorías
    legalContent.tutorias.forEach(tutoria => {
      // Asegurarnos de que no estamos añadiendo el mismo contenido
      if (tipoContenido === 'tutoria' && tutoria.id === contenidoId) return;
      
      const puntuacion = calcularPuntuacion(tutoria);
      
      if (puntuacion > 1) {
        resultado.tutoriasRelacionadas.push({
          ...tutoria,
          tipo: 'Tutoría',
          puntuacion
        });
      }
    });
    
    // Procesar términos del diccionario
    legalContent.diccionario.forEach(termino => {
      // Asegurarnos de que no estamos añadiendo el mismo contenido
      if (tipoContenido === 'termino' && termino.id === contenidoId) return;
      
      const puntuacion = calcularPuntuacion(termino);
      
      // Relevancia adicional para términos mencionados en el contenido actual
      if (terminos?.includes(termino.termino.toLowerCase().replace(/ /g, '-'))) {
        puntuacion += 2;
      }
      
      if (puntuacion > 1) {
        resultado.terminosRelacionados.push({
          ...termino,
          tipo: 'Término',
          puntuacion
        });
      }
    });
    
    // Ordenar todos los resultados por puntuación (de mayor a menor)
    for (const tipo in resultado) {
      if (resultado[tipo].length > 0) {
        resultado[tipo].sort((a, b) => b.puntuacion - a.puntuacion);
      }
    }
    
    return resultado;
  }
  
  /**
   * Función para cargar contenido relacionado en la sección "También te puede interesar"
   */
  function cargarContenidoRelacionado() {
    console.log("Ejecutando cargarContenidoRelacionado");
    
    // Extraer ID del contenido de la ruta
    const rutaActual = window.location.pathname;
    
    // Usar expresiones regulares para extraer la información desde la ruta
    const articuloMatch = rutaActual.match(/\/contenido\/articulos\/([^\/]+)\.html$/i);
    const casoMatch = rutaActual.match(/\/contenido\/casos\/([^\/]+)\.html$/i);
    const tutoriaMatch = rutaActual.match(/\/contenido\/tutorias\/([^\/]+)\.html$/i);
    const terminoMatch = rutaActual.match(/\/contenido\/diccionario\/([^\/]+)\.html$/i);
    
    let contenidoId = null;
    let tipoContenido = null;
    
    if (articuloMatch) {
      contenidoId = articuloMatch[1];
      tipoContenido = 'articulo';
    } else if (casoMatch) {
      contenidoId = casoMatch[1];
      tipoContenido = 'caso';
    } else if (tutoriaMatch) {
      contenidoId = tutoriaMatch[1];
      tipoContenido = 'tutoria';
    } else if (terminoMatch) {
      contenidoId = terminoMatch[1];
      tipoContenido = 'termino';
    }
    
    if (!contenidoId || !tipoContenido) {
      console.log("No se encontró ID o tipo de contenido en la ruta: " + rutaActual);
      return;
    }
    
    console.log(`Buscando contenido relacionado para: ${tipoContenido} con ID: ${contenidoId}`);
    
    // Obtener el contenido relacionado
    const contenidoRelacionado = encontrarContenidoRelacionado(contenidoId, tipoContenido);
    
    if (!contenidoRelacionado) {
      console.warn("No se encontró contenido relacionado");
      return;
    }
    
    // Obtener el contenedor donde mostraremos los artículos relacionados
    const articulosGrid = document.querySelector('.recommended-section .articles-grid');
    
    if (!articulosGrid) {
      console.warn("No se encontró el contenedor para mostrar artículos relacionados");
      return;
    }
    
    // Limpiar el contenedor
    articulosGrid.innerHTML = '';
    
    // Crear un array mixto con diferentes tipos de contenido relacionado
    const contenidoMixto = [
      ...contenidoRelacionado.articulosRelacionados.slice(0, 2),
      ...contenidoRelacionado.casosRelacionados.slice(0, 2),
      ...contenidoRelacionado.tutoriasRelacionadas.slice(0, 2),
      ...contenidoRelacionado.terminosRelacionados.slice(0, 2)
    ];
    
    // Limitamos a 3 elementos y ordenamos por puntuación
    const elementosAMostrar = contenidoMixto
      .sort((a, b) => b.puntuacion - a.puntuacion)
      .slice(0, 3);
    
    // Si no tenemos suficientes elementos relacionados, mostrar un mensaje
    if (elementosAMostrar.length === 0) {
      articulosGrid.innerHTML = `
        <div class="no-content-message">
          <i class="fas fa-info-circle"></i>
          <p>No se encontró contenido relacionado.</p>
        </div>
      `;
      return;
    }
    
    console.log(`Se encontraron ${elementosAMostrar.length} elementos relacionados para mostrar`);
    
    // Renderizar cada elemento
    elementosAMostrar.forEach(item => {
      // Determinar qué campo usar para el texto de extracto
      let extracto = item.extracto || item.resumen || item.descripcion || item.definicion || '';
      
      // Crear el HTML para este elemento
      const itemHTML = `
        <div class="article-card">
          <div class="article-image" style="background-image: url('${item.imagen}');">
            <span class="article-relevance" title="Relevancia: ${item.puntuacion}">
              <i class="fas fa-star"></i> ${Math.min(5, Math.round(item.puntuacion / 2))}
            </span>
          </div>
          <div class="article-content">
            <span class="article-category">${item.tipo}</span>
            <h3 class="article-title">${item.titulo || item.termino}</h3>
            <p class="article-excerpt">${extracto.length > 120 ? extracto.substring(0, 120) + '...' : extracto}</p>
            <div class="article-meta">
              <span><i class="far fa-calendar"></i> ${item.fecha || 'Recurso permanente'}</span>
              ${item.comentarios ? `<span><i class="far fa-comment"></i> ${item.comentarios} comentarios</span>` : ''}
            </div>
            <a href="${getItemUrl(item)}" class="read-more-link">Leer más <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
      `;
      
      // Añadir este elemento al contenedor
      articulosGrid.innerHTML += itemHTML;
    });
    
    // Actualizar el título de la sección con información relevante
    const sectionDescription = document.querySelector('.recommended-section .section-description');
    
    // Obtener el contenido actual
    let contenidoActual = null;
    switch (tipoContenido) {
      case 'articulo':
        contenidoActual = legalContent.articulos.find(art => art.id === contenidoId);
        break;
      case 'caso':
        contenidoActual = legalContent.casos.find(caso => caso.id === contenidoId);
        break;
      case 'tutoria':
        contenidoActual = legalContent.tutorias.find(tut => tut.id === contenidoId);
        break;
      case 'termino':
        contenidoActual = legalContent.diccionario.find(term => term.id === contenidoId);
        break;
    }
    
    if (contenidoActual && sectionDescription) {
      const temasPrincipales = contenidoActual.etiquetas?.slice(0, 2).map(tag => tag.replace(/-/g, ' ')).join(', ') || '';
      sectionDescription.textContent = `Contenido relacionado con ${temasPrincipales || 'temas legales relevantes'}`;
    }
  }
  
  /**
   * Función para obtener la URL correcta según el tipo de contenido
   * @param {Object} item - Elemento de contenido
   * @returns {string} - URL para el elemento
   */
  function getItemUrl(item) {
    const id = item.id;
    
    switch(item.tipo) {
      case 'Artículo':
        return `/contenido/articulos/${id}.html`;
      case 'Caso Real':
        return `/contenido/casos/${id}.html`;
      case 'Tutoría':
        return `/contenido/tutorias/${id}.html`;
      case 'Término':
        return `/contenido/diccionario/${id}.html`;
      default:
        return '#';
    }
  }
  
  /**
   * Función para actualizar la barra lateral con contenido relacionado
   */
  function actualizarBarraLateral() {
    console.log("Ejecutando actualizarBarraLateral");
    
    // Extraer ID del contenido de la ruta
    const rutaActual = window.location.pathname;
    
    // Usar expresiones regulares para extraer la información desde la ruta
    const articuloMatch = rutaActual.match(/\/contenido\/articulos\/([^\/]+)\.html$/i);
    const casoMatch = rutaActual.match(/\/contenido\/casos\/([^\/]+)\.html$/i);
    const tutoriaMatch = rutaActual.match(/\/contenido\/tutorias\/([^\/]+)\.html$/i);
    const terminoMatch = rutaActual.match(/\/contenido\/diccionario\/([^\/]+)\.html$/i);
    
    let contenidoId = null;
    let tipoContenido = null;
    
    if (articuloMatch) {
      contenidoId = articuloMatch[1];
      tipoContenido = 'articulo';
    } else if (casoMatch) {
      contenidoId = casoMatch[1];
      tipoContenido = 'caso';
    } else if (tutoriaMatch) {
      contenidoId = tutoriaMatch[1];
      tipoContenido = 'tutoria';
    } else if (terminoMatch) {
      contenidoId = terminoMatch[1];
      tipoContenido = 'termino';
    }
    
    if (!contenidoId || !tipoContenido) {
      console.log("No se encontró ID o tipo de contenido en la ruta para la barra lateral: " + rutaActual);
      return;
    }
    
    const contenidoRelacionado = encontrarContenidoRelacionado(contenidoId, tipoContenido);
    
    if (!contenidoRelacionado) {
      console.warn("No se encontró contenido relacionado para la barra lateral");
      return;
    }
    
    // Actualizar sección "Artículos relacionados" en la barra lateral
    const sidebarRelatedArticles = document.querySelector('.sidebar-section .related-articles');
    
    if (sidebarRelatedArticles) {
      sidebarRelatedArticles.innerHTML = '';
      
      // Si no hay artículos relacionados, mostrar un mensaje
      if (contenidoRelacionado.articulosRelacionados.length === 0) {
        sidebarRelatedArticles.innerHTML = '<li>No hay artículos relacionados disponibles</li>';
        return;
      }
      
      // Mostrar hasta 4 artículos relacionados en la barra lateral
      contenidoRelacionado.articulosRelacionados.slice(0, 4).forEach(articulo => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="/contenido/articulos/${articulo.id}.html">${articulo.titulo}</a>`;
        sidebarRelatedArticles.appendChild(li);
      });
      
      // Añadir la opción de ver más si hay más de 4 artículos relacionados
      if (contenidoRelacionado.articulosRelacionados.length > 4) {
        const verMas = document.createElement('li');
        verMas.className = 'see-more';
        verMas.innerHTML = `<a href="/buscar.html?categoria=${encodeURIComponent(contenidoRelacionado.articulosRelacionados[0].categorias[0])}">Ver más artículos <i class="fas fa-chevron-right"></i></a>`;
        sidebarRelatedArticles.appendChild(verMas);
      }
    }
    
    // Actualizar sección de "Etiquetas" si existe
    const tagsContainer = document.querySelector('.sidebar-section .article-tags');
    if (tagsContainer) {
      // Obtener el contenido actual
      let contenidoActual = null;
      switch (tipoContenido) {
        case 'articulo':
          contenidoActual = legalContent.articulos.find(art => art.id === contenidoId);
          break;
        case 'caso':
          contenidoActual = legalContent.casos.find(caso => caso.id === contenidoId);
          break;
        case 'tutoria':
          contenidoActual = legalContent.tutorias.find(tut => tut.id === contenidoId);
          break;
        case 'termino':
          contenidoActual = legalContent.diccionario.find(term => term.id === contenidoId);
          break;
      }
      
      if (contenidoActual && contenidoActual.etiquetas) {
        tagsContainer.innerHTML = '';
        contenidoActual.etiquetas.forEach(tag => {
          const tagElement = document.createElement('a');
          tagElement.href = `/buscar.html?etiqueta=${encodeURIComponent(tag)}`;
          tagElement.className = 'article-tag';
          tagElement.textContent = tag.replace(/-/g, ' ');
          tagsContainer.appendChild(tagElement);
        });
      }
    }
  }
  
  // Exponer las funciones para que load-content.js pueda utilizarlas
  window.contentRelations = {
    encontrarContenidoRelacionado,
    cargarContenidoRelacionado,
    actualizarBarraLateral,
    getItemUrl
  };
  
  // No añadimos event listeners aquí, lo dejamos para load-content.js
  console.log("Módulo content-relations cargado correctamente");