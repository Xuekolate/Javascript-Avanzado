/* ============================================================
   main.js
   Script compartido por todas las páginas del sitio.
   Se encarga de:
     1. Mostrar el año actual en el footer automáticamente
   ============================================================ */

// Esperamos a que el HTML esté completamente cargado antes de ejecutar nada
document.addEventListener('DOMContentLoaded', function () {

    // --- AÑO DINÁMICO EN EL FOOTER ---
    // Buscamos el elemento <span> con id "footer-year"
    var spanAño = document.getElementById('footer-year');

    // Si existe en la página, le ponemos el año actual
    // new Date() crea un objeto con la fecha de hoy
    // .getFullYear() extrae solo el año (ej: 2026)
    if (spanAño) {
        spanAño.textContent = new Date().getFullYear();
    }

});
