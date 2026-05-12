/* ============================================================
   noticias.js
   ============================================================

   Carga dinámicamente las noticias desde el archivo externo
   "data/noticias.json" usando AJAX (XMLHttpRequest) y las
   inserta en el HTML del index.html SIN recargar la página.

   POR QUÉ SE HACE ASÍ (carga dinámica desde JSON):
   El enunciado pide que las noticias del index se carguen
   desde un archivo externo de forma dinámica. Esto significa
   que el HTML no contiene las noticias escritas a mano, sino
   que JavaScript las pide al servidor y las crea al vuelo.
   El formato recomendado por el enunciado es JSON.

   QUÉ ES AJAX:
   AJAX (Asynchronous JavaScript And XML) es una técnica que
   permite comunicarse con el servidor en segundo plano, sin
   que la página se recargue. El usuario puede seguir viendo
   la página mientras los datos llegan.

   CÓMO FUNCIONA LA CARGA DEL JSON PASO A PASO:
     1. new XMLHttpRequest()    → creamos el objeto que gestiona la petición
     2. xhr.open('GET', url)    → configuramos: método GET y ruta al JSON
     3. xhr.onreadystatechange  → definimos qué hacer cuando lleguen los datos
     4. xhr.send()              → lanzamos la petición al servidor

   CÓMO SE LEEN LOS DATOS DEL JSON:
   - xhr.responseText contiene la respuesta como texto plano
   - JSON.parse() convierte ese texto en un array de objetos JS
   - Cada objeto tiene: id, categoria, titulo, descripcion, fecha
   - Con forEach recorremos el array y creamos un <article> por noticia

   CONEXIÓN CON EL HTML (index.html):
   - En index.html existe: <section id="noticias-grid"></section>
   - Este script busca ese elemento y le añade las tarjetas dentro
   - También existe <p id="noticias-loading"> que se oculta al cargar
   ============================================================ */

// Esperamos a que el HTML esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {

    // Guardamos la referencia al contenedor donde meteremos las noticias
    var contenedor = document.getElementById('noticias-grid');

    // Guardamos la referencia al párrafo "Cargando noticias..."
    var loading = document.getElementById('noticias-loading');

    // Si no existe el contenedor en esta página, salimos sin hacer nada
    if (!contenedor) return;

    // ---- PASO 1: Crear el objeto XMLHttpRequest ----
    // Este objeto es el que gestiona toda la comunicación con el servidor
    var xhr = new XMLHttpRequest();

    // ---- PASO 2: Abrir la conexión ----
    // open(método, url, asíncrono)
    //   - "GET"  → solo pedimos datos, no enviamos nada
    //   - ruta al archivo JSON con las noticias
    //   - true   → asíncrono (la página no se congela mientras espera)
    xhr.open('GET', 'data/noticias.json', true);

    // ---- PASO 3: Definir qué hacer en cada cambio de estado ----
    // onreadystatechange se ejecuta cada vez que cambia el readyState (0 a 4)
    // Nosotros solo actuamos cuando readyState llega a 4 (carga completa)
    xhr.onreadystatechange = function () {

        // readyState 4 = la respuesta ha llegado completa
        // status 200   = el servidor respondió correctamente (como un "OK")
        if (xhr.readyState === 4 && xhr.status === 200) {

            // Ocultamos el texto "Cargando noticias..." ya que ya tenemos los datos
            if (loading) {
                loading.style.display = 'none';
            }

            // xhr.responseText contiene la respuesta del servidor como texto plano
            // JSON.parse() convierte ese texto en un array de objetos JavaScript
            // para que podamos acceder a cada propiedad (titulo, descripcion, etc.)
            var noticias = JSON.parse(xhr.responseText);

            // Recorremos el array de noticias con forEach
            // Por cada noticia creamos una tarjeta y la añadimos al contenedor
            noticias.forEach(function (noticia) {

                // Creamos un nuevo elemento <article> para cada noticia
                var card = document.createElement('article');

                // Le añadimos la clase CSS para que tenga el estilo de tarjeta
                card.classList.add('noticia-card');

                // Construimos el HTML interno de la tarjeta con los datos del JSON
                // noticia.categoria, noticia.titulo, etc. son las propiedades del JSON
                card.innerHTML =
                    '<span>' + noticia.categoria + '</span>' +
                    '<h3>' + noticia.titulo + '</h3>' +
                    '<p>' + noticia.descripcion + '</p>' +
                    '<p class="fecha">' + noticia.fecha + '</p>';

                // Añadimos la tarjeta al contenedor del HTML
                contenedor.appendChild(card);
            });

        } else if (xhr.readyState === 4) {
            // Si readyState es 4 pero status NO es 200, algo salió mal
            // Por ejemplo: archivo no encontrado (404), error del servidor (500)...
            if (loading) {
                loading.textContent = 'No se pudieron cargar las noticias.';
            }
        }
    };

    // ---- PASO 4: Enviar la petición ----
    // send() es el que realmente lanza la petición al servidor
    // Sin esta línea, open() configura pero nunca se envía nada
    xhr.send();

});
