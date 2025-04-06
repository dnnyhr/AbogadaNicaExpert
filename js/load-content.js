/**
 * Estructura global para almacenar todo el contenido legal
 */
let legalContent = {
    articulos: [],
    casos: [],
    tutorias: [],
    diccionario: []
  };
  
  /**
   * Función para cargar todos los índices de contenido
   * @returns {Promise} - Promesa que se resuelve cuando todos los índices están cargados
   */
  async function cargarIndicesContenido() {
    try {
      console.log("Iniciando carga de índices de contenido...");
      
      // Lista de rutas de archivos de índice a cargar
      const rutas = [
        '/contenido/articulos/index.json',
        '/contenido/casos/index.json',
        '/contenido/tutorias/index.json',
        '/contenido/diccionario/index.json'
      ];
      
      // Realizar todas las peticiones en paralelo
      const respuestas = await Promise.all(
        rutas.map(ruta => fetch(ruta)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error al cargar ${ruta}: ${response.status} ${response.statusText}`);
            }
            return response.json();
          })
        )
      );
      
      // Asignar los datos obtenidos a la estructura global
      legalContent.articulos = respuestas[0].articulos || [];
      legalContent.casos = respuestas[1].casos || [];
      legalContent.tutorias = respuestas[2].tutorias || [];
      legalContent.diccionario = respuestas[3].terminos || [];
      
      console.log('Índices de contenido cargados correctamente:', {
        articulos: legalContent.articulos.length,
        casos: legalContent.casos.length,
        tutorias: legalContent.tutorias.length,
        terminos: legalContent.diccionario.length
      });
      
      // Devolver los datos para posible uso posterior
      return legalContent;
    } catch (error) {
      console.error('Error al cargar los índices de contenido:', error);
      
      // Inicializar con arrays vacíos para evitar errores
      legalContent.articulos = [];
      legalContent.casos = [];
      legalContent.tutorias = [];
      legalContent.diccionario = [];
      
      // Re-lanzar el error para manejo posterior si es necesario
      throw error;
    }
  }
  
  /**
   * Verifica si el objeto contentRelations está disponible en el ámbito global
   * @returns {boolean} - true si contentRelations está disponible
   */
  function verificarModuloContenidoRelacionado() {
    if (typeof window.contentRelations === 'undefined') {
      console.error('Error: El módulo content-relations.js no está cargado o no exportó sus funciones correctamente');
      return false;
    }
    return true;
  }
  
  /**
   * Muestra un mensaje de error en las secciones de contenido relacionado
   * @param {string} mensaje - Mensaje de error a mostrar
   */
  function mostrarMensajeError(mensaje) {
    const seccionesContenido = document.querySelectorAll('.recommended-section .articles-grid, .sidebar-section .related-articles');
    
    seccionesContenido.forEach(seccion => {
      seccion.innerHTML = `
        <div class="content-error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>${mensaje}</p>
        </div>
      `;
    });
  }
  
  /**
   * Función para mostrar información de depuración en la consola
   */
  function mostrarInfoDepuracion() {
    console.log("Información de depuración:");
    console.log("Ruta actual:", window.location.pathname);
    console.log("¿Existe articles-grid?", !!document.querySelector('.recommended-section .articles-grid'));
    console.log("¿Existe related-articles?", !!document.querySelector('.sidebar-section .related-articles'));
  }
  
  /**
   * Inicializa el sistema de contenido
   * Carga los índices y luego ejecuta las funciones de contenido relacionado
   */
  async function inicializarSistemaContenido() {
    try {
      // Mostrar información de depuración
      mostrarInfoDepuracion();
      
      // Verificar que el módulo content-relations.js está cargado
      if (!verificarModuloContenidoRelacionado()) {
        mostrarMensajeError('No se pudo cargar el sistema de contenido relacionado. Asegúrese de que todos los scripts están correctamente cargados.');
        return;
      }
      
      // Cargar los índices desde los archivos JSON
      await cargarIndicesContenido();
      
      // Una vez que tenemos el contenido, ejecutamos las funciones que muestran contenido relacionado
      window.contentRelations.cargarContenidoRelacionado();
      window.contentRelations.actualizarBarraLateral();
      
      console.log("Sistema de contenido inicializado correctamente");
    } catch (error) {
      console.error('No se pudo cargar el contenido:', error.message);
      
      mostrarMensajeError('No se pudo cargar el contenido. Por favor, intente nuevamente más tarde.');
    }
  }
  
  // Ejecutar la inicialización cuando el DOM esté completamente cargado
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado, iniciando sistema de contenido...");
    inicializarSistemaContenido();
  });