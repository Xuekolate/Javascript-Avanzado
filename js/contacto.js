/* ============================================================
   contacto.js
     Crea el mapa dinámico con Leaflet.js + OpenStreetMap y
   permite calcular la ruta desde la dirección del cliente
   hasta las instalaciones de la empresa.

   Leaflet es una librería externa gratuita para mapas.
   OpenStreetMap es el mapa que usamos (sin API key).
   OSRM es el servicio gratuito que calcula la ruta en coche.

   Para la geocodificación (convertir una dirección en coordenadas)
   usamos Nominatim, también gratuito y de OpenStreetMap.
   ============================================================ */
// Esperamos a que el HTML esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // COORDENADAS DE LA EMPRESA
    // Latitud y longitud de C/ Sorbesopas 20, Alcorcón, Madrid
    // ============================================================
    var LAT_EMPRESA = 40.3465;
    var LNG_EMPRESA = -3.8305;

    // ============================================================
    // INICIALIZAR EL MAPA con Leaflet + OpenStreetMap
    // L es el objeto global que nos da la librería Leaflet
    // ============================================================

    // Creamos el mapa dentro del elemento <div id="mapa">
    // El segundo parámetro son las coordenadas del centro inicial
    // El tercero es el nivel de zoom (15 = nivel de calle)
    var mapa = L.map('mapa').setView([LAT_EMPRESA, LNG_EMPRESA], 15);

    // Añadimos la capa de tiles (las imágenes del mapa) de OpenStreetMap
    // {s}, {z}, {x}, {y} son variables que Leaflet rellena automáticamente
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(mapa);
  // ============================================================
  // AÑADIR EL MARCADOR DE LA EMPRESA
  // ============================================================

     // L.marker crea un marcador en las coordenadas indicadas
    // .addTo(mapa) lo añade al mapa
    // .bindPopup crea el globo de texto que aparece al hacer clic
    // .openPopup lo abre por defecto al cargar la página
    // Marcador en la ubicación de la empresa con popup informativo
    L.marker([LAT_EMPRESA, LNG_EMPRESA])
        .addTo(mapa)
        .bindPopup('<b>CubiertasChueca</b><br>C/ Sorbesopas 20, Alcorcón')
        .openPopup();

  // ============================================================
  //CALCULAR LA RUTA DESDE LA DIRECCIÓN DEL CLIENTE
  // ============================================================

    // ============================================================
    // REFERENCIAS A ELEMENTOS DEL HTML (A partir de aqui hemos cambiado el codigo para que empieze la funcion del mapa automático)
    // ============================================================
    var btnRuta     = document.getElementById('btn-calcular-ruta');
    var inDireccion = document.getElementById('direccion-cliente');
    var infoRuta    = document.getElementById('info-ruta');
    var geoEstado   = document.getElementById('geo-estado');

    // Capas del mapa que podemos necesitar eliminar al recalcular
    var rutaDibujada    = null; // línea de la ruta en el mapa
    var marcadorCliente = null; // marcador en la ubicación del cliente


    // ============================================================
    // FUNCIÓN PRINCIPAL: calcular y dibujar la ruta
    // Recibe latitud y longitud del punto de origen del cliente
    // Es llamada tanto por la geolocalización automática como
    // por el botón manual, para evitar duplicar código.
    // ============================================================
    function calcularRuta(latCliente, lngCliente) {

        // Borramos ruta y marcador anteriores si existían
        if (rutaDibujada)    { mapa.removeLayer(rutaDibujada);    rutaDibujada    = null; }
        if (marcadorCliente) { mapa.removeLayer(marcadorCliente); marcadorCliente = null; }

        // Añadimos marcador en la ubicación del cliente
        marcadorCliente = L.marker([latCliente, lngCliente])
            .addTo(mapa)
            .bindPopup('<b>Tu ubicación</b>')
            .openPopup();

        // Petición AJAX a OSRM para calcular la ruta en coche
        // La URL lleva las coordenadas en orden: origen → destino
        var urlRuta =
            'https://router.project-osrm.org/route/v1/driving/' +
            lngCliente + ',' + latCliente + ';' +
            LNG_EMPRESA + ',' + LAT_EMPRESA +
            '?overview=full&geometries=geojson';

        var xhrRuta = new XMLHttpRequest();
        xhrRuta.open('GET', urlRuta, true);

        xhrRuta.onreadystatechange = function () {
            // Esperamos a que la respuesta esté completa (readyState 4)
            if (xhrRuta.readyState === 4 && xhrRuta.status === 200) {

                var datos = JSON.parse(xhrRuta.responseText);

                if (datos.routes && datos.routes.length > 0) {
                    var ruta    = datos.routes[0];
                    var km      = (ruta.distance / 1000).toFixed(1);
                    var minutos = Math.round(ruta.duration / 60);

                    // Dibujamos la línea de la ruta en el mapa
                    rutaDibujada = L.geoJSON(ruta.geometry, {
                        style: { color: '#e94560', weight: 5, opacity: 0.8 }
                    }).addTo(mapa);

                    // Ajustamos el zoom para que se vea toda la ruta
                    mapa.fitBounds(rutaDibujada.getBounds(), { padding: [40, 40] });

                    // Mostraremos distancia y tiempo estimado
                    infoRuta.style.display = 'block';
                    infoRuta.innerHTML =
                        '<strong>Distancia:</strong> ' + km + ' km &nbsp;|&nbsp; ' +
                        '<strong>Tiempo estimado:</strong> ' + minutos + ' min en coche';
                }

                btnRuta.textContent = 'Calcular ruta';
                btnRuta.disabled    = false;
            }
        };

        xhrRuta.send();
    }

    // ============================================================
    // GEOLOCALIZACIÓN AUTOMÁTICA AL CARGAR LA PÁGINA
    // Se ejecuta sin pulsar ningún botón.
    // ============================================================
    if (navigator.geolocation) {

        // El navegador pide permiso al usuario para acceder a su ubicación
        navigator.geolocation.getCurrentPosition(

            // ÉXITO: el usuario concedió el permiso
            function (posicion) {
                var latCliente = posicion.coords.latitude;
                var lngCliente = posicion.coords.longitude;

                geoEstado.textContent = '✓ Ubicación obtenida. Calculando ruta...';
                geoEstado.style.color = '#2e7d32';

                // Calculamos la ruta automáticamente sin que el usuario haga nada
                calcularRuta(latCliente, lngCliente);

                setTimeout(function () {
                    geoEstado.textContent = '✓ Ruta calculada desde tu ubicación actual.';
                }, 3000);
            },

            // ERROR: el usuario denegó el permiso o no está disponible
            function () {
                geoEstado.textContent = 'No se pudo obtener tu ubicación. Introduce tu dirección manualmente.';
                geoEstado.style.color = '#888';
            },

            { timeout: 10000, maximumAge: 60000 }
        );

    } else {
        geoEstado.textContent = 'Tu navegador no soporta geolocalización. Introduce tu dirección manualmente.';
        geoEstado.style.color = '#888';
    }

    // ============================================================
    // (aqui empieza codigo antiguo)
    // BOTÓN MANUAL: alternativa cuando la geolocalización falla
    // o el usuario quiere calcular desde otra dirección
    // ============================================================

    btnRuta.addEventListener('click', function () {
       // Recogemos la dirección que escribió el usuario
        var direccion = inDireccion.value.trim();
       // Si el campo está vacío, avisamos y salimos
        if (!direccion) {
            alert('Por favor, introduce tu dirección.');
            inDireccion.focus();
            return;
        }

        btnRuta.textContent = 'Calculando...';
        btnRuta.disabled    = true;

        // Geocodificación con Nominatim (dirección en texto → coordenadas)
        var urlGeo =
            'https://nominatim.openstreetmap.org/search?' +
            'q=' + encodeURIComponent(direccion) +
            '&format=json&limit=1&countrycodes=es';

        var xhrGeo = new XMLHttpRequest();
        xhrGeo.open('GET', urlGeo, true);
        xhrGeo.setRequestHeader('Accept-Language', 'es');

        xhrGeo.onreadystatechange = function () {
            if (xhrGeo.readyState === 4 && xhrGeo.status === 200) {
                // Convertimos la respuesta JSON en un array de resultados
                var resultados = JSON.parse(xhrGeo.responseText);
                // Si no se encontró la dirección, avisamos y salimos
                if (resultados.length === 0) {
                    alert('No se encontró la dirección. Prueba a añadir la ciudad.');
                    btnRuta.textContent = 'Calcular ruta';
                    btnRuta.disabled    = false;
                    return;
                }
                // Extraemos la latitud y longitud del primer resultado
                var latCliente = parseFloat(resultados[0].lat);
                var lngCliente = parseFloat(resultados[0].lon);

                // Usamos la misma función que usa la geolocalización automática
                calcularRuta(latCliente, lngCliente);
            }
        };

        xhrGeo.send();
    });

});
