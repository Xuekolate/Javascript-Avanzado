/* ============================================================
   galeria.js
   Crea la galería de imágenes dinámicamente con JavaScript
   y gestiona el lightbox (ventana emergente con la imagen ampliada).

   Todo se hace con addEventListener, sin usar onclick en el HTML.
  separo el HTML del JavaScript.
   ============================================================ */

// Esperamos a que el HTML esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  // ============================================================
  // DATOS DE LA GALERÍA
  // Array de objetos con la información de cada imagen

  // ============================================================
  var imagenes = [
    {
      src: '../images/Galeria/galeria7.jpg',
      alt: 'Cubierta de pizarra en chaflán',
      titulo: 'Pizarra — Alcorcón'
    },
    {
      src: '../images/Galeria/galeria11.jpeg',
      alt: 'Tejado de zinc en edificio histórico',
      titulo: 'Zinc — Madrid centro'
    },
    {
      src: '../images/Galeria/galeria2.jpg',
      alt: 'Impermeabilización de cubierta plana',
      titulo: 'Impermeabilización — Leganés'
    },
    {
      src: '../images/Galeria/galeria12.jpg',
      alt: 'Cubierta de Zinc en villa',
      titulo: 'Zinc — Villa residencial'
    },
    {
      src: '../images/Galeria/galeria10.jpg',
      alt: 'Tejado de teja cerámica restaurado',
      titulo: 'Teja cerámica — Restauración'
    },
    {
      src: '../images/Galeria/galeria6.jpg',
      alt: 'Lucernario en cubierta de pizarra',
      titulo: 'Lucernario — Pizarra'
    },
    {
      src: '../images/Galeria/galeria13.jpg',
      alt: 'Canalones y bajantes de zinc',
      titulo: 'Canalones zinc'
    },
    {
      src: '../images/Galeria/galeria9.jpg',
      alt: 'Cubierta metálica en nave industrial',
      titulo: 'Cubierta industrial'
    },
    {
      src: '../images/Galeria/galeria1.jpg',
      alt: 'Rehabilitación de tejado',
      titulo: 'Rehabilitación completa'
    }
  ]

  // Colores de fondo para cuando la imagen no existe en disco
  // Se muestran en su lugar para que la galería no quede vacía
  var colores = [
    '#2C3E50',
    '#34495E',
    '#2E4057',
    '#1B3A4B',
    '#264653',
    '#2a2a4a',
    '#3D5A80',
    '#1C2B3A',
    '#2C3344'
  ]

  // Variable que guarda qué imagen está abierta en el lightbox ahora mismo
  var indiceActual = 0

  // ============================================================
  // CREAR LAS TARJETAS DE IMAGEN DINÁMICAMENTE
  // ============================================================

  // Obtenemos el contenedor del grid en el HTML
  var grid = document.getElementById('galeria-grid')

  // Si no existe el contenedor, salimos sin hacer nada
  if (!grid) return

  // Recorremos el array de imágenes y creamos un elemento por cada una
  imagenes.forEach(function (imagen, i) {
    // Creamos el elemento contenedor de cada imagen
    var item = document.createElement('figure')
    item.classList.add('galeria__item')

    // Guardamos el índice como dato del elemento para saber cuál se clicó
    item.setAttribute('data-index', i)

    // Construimos el HTML: fondo de color + imagen encima + título al hover
    item.style.backgroundColor = colores[i % colores.length]

    item.innerHTML =
      '<img src="' +
      imagen.src +
      '" alt="' +
      imagen.alt +
      '">' +
      '<figcaption class="galeria__item__overlay">' +
      imagen.titulo +
      '</figcaption>'

    // --- addEventListener para abrir el lightbox al hacer clic ---
    // Usamos addEventListener en lugar de onclick para poder
    // añadir y eliminar eventos de forma controlada
    item.addEventListener('click', function () {
      // Leemos el índice guardado en data-index y abrimos el lightbox
      abrirLightbox(parseInt(this.getAttribute('data-index')))
    })

    // Añadimos la tarjeta al grid del HTML
    grid.appendChild(item)
  })

  // ============================================================
  // LIGHTBOX — ventana emergente con la imagen ampliada
  // ============================================================

  // Guardamos referencias a todos los elementos del lightbox
  var lightbox = document.getElementById('lightbox')
  var lbImg = document.getElementById('lb-img')
  var lbCaption = document.getElementById('lb-caption')
  var lbContador = document.getElementById('lb-contador')
  var btnCerrar = document.getElementById('lb-cerrar')
  var btnPrev = document.getElementById('lb-prev')
  var btnNext = document.getElementById('lb-next')

  // Función que abre el lightbox mostrando la imagen del índice recibido
  function abrirLightbox(indice) {
    indiceActual = indice // guardamos qué imagen estamos viendo
    actualizarLightbox() // mostramos la imagen correcta
    lightbox.classList.add('activo') // mostramos el lightbox (ver CSS)
    document.body.style.overflow = 'hidden' // bloqueamos el scroll del fondo
  }

  // Función que cierra el lightbox
  function cerrarLightbox() {
    lightbox.classList.remove('activo') // ocultamos el lightbox
    document.body.style.overflow = '' // restauramos el scroll
  }

  // Función que actualiza la imagen y el texto del lightbox
  // según el índice actual
  function actualizarLightbox() {
    var img = imagenes[indiceActual]
    lbImg.src = img.src
    lbImg.alt = img.alt
    lbCaption.textContent = img.titulo
    // Mostramos "3 / 9" para que el usuario sepa en qué imagen está
    lbContador.textContent = indiceActual + 1 + ' / ' + imagenes.length
  }

  // --- addEventListener en el botón de cerrar ---
  btnCerrar.addEventListener('click', cerrarLightbox)

  // --- addEventListener en el botón "imagen anterior" ---
  btnPrev.addEventListener('click', function () {
    // El % (módulo) hace que al llegar a la primera imagen vuelva a la última
    indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length
    actualizarLightbox()
  })

  // --- addEventListener en el botón "imagen siguiente" ---
  btnNext.addEventListener('click', function () {
    // El % (módulo) hace que al llegar a la última imagen vuelva a la primera
    indiceActual = (indiceActual + 1) % imagenes.length
    actualizarLightbox()
  })

  // --- Cerrar el lightbox al hacer clic en el fondo oscuro ---
  // Si el clic es directamente sobre el lightbox (no sobre la imagen),
  // cerramos la ventana
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      cerrarLightbox()
    }
  })

  // --- Navegación con el teclado ---
  // Añadimos un listener al documento completo para capturar teclas
  document.addEventListener('keydown', function (e) {
    // Solo actuamos si el lightbox está abierto en este momento
    if (!lightbox.classList.contains('activo')) return

    if (e.key === 'Escape') {
      // Escape → cerrar
      cerrarLightbox()
    }
    if (e.key === 'ArrowLeft') {
      // Flecha izquierda → imagen anterior
      indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length
      actualizarLightbox()
    }
    if (e.key === 'ArrowRight') {
      // Flecha derecha → imagen siguiente
      indiceActual = (indiceActual + 1) % imagenes.length
      actualizarLightbox()
    }
  })
})
