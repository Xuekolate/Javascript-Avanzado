/* ============================================================
   presupuesto.js
      Gestiona el formulario de presupuesto:
     1. Validación de los datos de contacto en tiempo real
     2. Cálculo automático del presupuesto sin recargar la página
     3. Envío del formulario — permite múltiples envíos seguidos
   ============================================================
       RESET COMPLETO (btnReset):
      limpia también los VALUES de todos los campos del formulario
             (inNombre.value = '', selProducto.value = '', etc.) y desmarca
              reset de verdad!!
      tras mostrar la confirmación 3 segundos, se llama a
             resetearFormulario() automáticamente, dejando el formulario
             listo para una segunda solicitud sin necesidad de recargar.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // PRECIOS
    // ============================================================
    var preciosProducto = {
        'pizarra':  5500,
        'zinc':     8200,
        'ceramica': 4800,
        'cobre':    9600,
        'grava':    3200
    };

    var preciosExtras = {
        'limpieza':    350,
        'canalon':     480,
        'lucernario': 1200,
        'aislamiento': 680
    };

    // ============================================================
    // REFERENCIAS A LOS CAMPOS DEL FORMULARIO
    // ============================================================
    var inNombre    = document.getElementById('nombre');
    var inApellidos = document.getElementById('apellidos');
    var inTelefono  = document.getElementById('telefono');
    var inEmail     = document.getElementById('email');
    var selProducto = document.getElementById('producto');
    var inPlazo     = document.getElementById('plazo');
    var chkExtras   = document.querySelectorAll('.extra-check');
    var chkCondic   = document.getElementById('condiciones');

    // Referencias al panel de presupuesto
    var spProducto  = document.getElementById('sp-producto');
    var spExtras    = document.getElementById('sp-extras');
    var spDescuento = document.getElementById('sp-descuento');
    var spTotal     = document.getElementById('sp-total');
    var liDescuento = document.getElementById('li-descuento');
    var notaPlazo   = document.getElementById('nota-plazo-panel');

    // ============================================================
    // CÁLCULO DEL DESCUENTO SEGÚN EL PLAZO
    // ============================================================
    function calcularDescuentoPlazo(meses) {
        if (meses < 1)  return -0.15;  // recargo del 15% por urgente
        if (meses >= 6) return  0.10;  // 10% de descuento
        if (meses >= 3) return  0.05;  // 5% de descuento
        return 0;
    }

    // ============================================================
    // FUNCIÓN PRINCIPAL: CALCULAR EL PRESUPUESTO EN TIEMPO REAL
    // Se llama cada vez que el usuario cambia cualquier campo
    // ============================================================
    function calcularPresupuesto() {

        var baseProducto = preciosProducto[selProducto.value] || 0;

        var totalExtras = 0;
        chkExtras.forEach(function (chk) {
            if (chk.checked) {
                totalExtras += preciosExtras[chk.value] || 0;
            }
        });

        var meses            = parseInt(inPlazo.value) || 0;
        var porcentaje       = calcularDescuentoPlazo(meses);
        var importeDescuento = (baseProducto + totalExtras) * porcentaje;
        var total            = baseProducto + totalExtras + importeDescuento;
        if (total < 0) total = 0;

        spProducto.textContent = baseProducto > 0
            ? baseProducto.toLocaleString('es-ES') + ' €'
            : '—';

        spExtras.textContent = totalExtras.toLocaleString('es-ES') + ' €';

        if (porcentaje !== 0 && baseProducto > 0) {
            liDescuento.style.display = '';
            spDescuento.textContent =
                (porcentaje > 0 ? '-' : '+') +
                Math.abs(importeDescuento).toLocaleString('es-ES') + ' €' +
                ' (' + Math.abs(porcentaje * 100) + '%)';
            notaPlazo.textContent = porcentaje < 0
                ? 'Recargo por plazo urgente (menos de 1 mes)'
                : 'Descuento por plazo de ' + meses + ' meses';
        } else {
            liDescuento.style.display = 'none';
            notaPlazo.textContent = '';
        }

        spTotal.textContent = total > 0
            ? total.toLocaleString('es-ES') + ' €'
            : '0 €';
    }

    selProducto.addEventListener('change', calcularPresupuesto);
    inPlazo.addEventListener('input', calcularPresupuesto);
    chkExtras.forEach(function (chk) {
        chk.addEventListener('change', calcularPresupuesto);
    });

    calcularPresupuesto();

    // ============================================================
    // VALIDACIÓN DE LOS CAMPOS DE CONTACTO
    // ============================================================
    function mostrarError(campo, idMensaje, hayError) {
        var msg = document.getElementById(idMensaje);
        if (hayError) {
            campo.classList.add('error');
            msg.classList.add('visible');
        } else {
            campo.classList.remove('error');
            msg.classList.remove('visible');
        }
    }

    function validarNombre() {
        var val   = inNombre.value.trim();
        var regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
        var ok    = val.length > 0 && val.length <= 15 && regex.test(val);
        mostrarError(inNombre, 'err-nombre', !ok && val.length > 0);
        return ok;
    }

    function validarApellidos() {
        var val   = inApellidos.value.trim();
        var regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
        var ok    = val.length > 0 && val.length <= 40 && regex.test(val);
        mostrarError(inApellidos, 'err-apellidos', !ok && val.length > 0);
        return ok;
    }

    function validarTelefono() {
        var val   = inTelefono.value.trim();
        var regex = /^[0-9]{1,9}$/;
        var ok    = regex.test(val);
        mostrarError(inTelefono, 'err-telefono', !ok && val.length > 0);
        return ok;
    }

    function validarEmail() {
        var val   = inEmail.value.trim();
        var regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        var ok    = regex.test(val);
        mostrarError(inEmail, 'err-email', !ok && val.length > 0);
        return ok;
    }

    inNombre.addEventListener('blur', validarNombre);
    inNombre.addEventListener('input', function () { if (this.classList.contains('error')) validarNombre(); });

    inApellidos.addEventListener('blur', validarApellidos);
    inApellidos.addEventListener('input', function () { if (this.classList.contains('error')) validarApellidos(); });

    inTelefono.addEventListener('blur', validarTelefono);
    inTelefono.addEventListener('input', function () { if (this.classList.contains('error')) validarTelefono(); });

    inEmail.addEventListener('blur', validarEmail);
    inEmail.addEventListener('input', function () { if (this.classList.contains('error')) validarEmail(); });

    // ============================================================
    // limpia los valores de los campos y desmarca
    // los checkboxes, haciendo un reset real del formulario.
    // ============================================================
    function resetearFormulario() {

        // 1. Limpiar los VALORES de todos los campos del formulario
        inNombre.value    = '';
        inApellidos.value = '';
        inTelefono.value  = '';
        inEmail.value     = '';
        selProducto.value = '';
        inPlazo.value     = '3';
        chkCondic.checked = false;

        // 2. Desmarcar todos los checkboxes de extras
        chkExtras.forEach(function (chk) {
            chk.checked = false;
        });

        // 3. Quitar los estilos de error de los campos
        [inNombre, inApellidos, inTelefono, inEmail].forEach(function (campo) {
            campo.classList.remove('error');
        });

        // 4. Ocultar todos los mensajes de error
        document.querySelectorAll('.msg-error').forEach(function (msg) {
            msg.classList.remove('visible');
        });

        // 5. Ocultar el mensaje de confirmación y reactivar el botón de envío
        var msgConf   = document.getElementById('msg-confirmacion');
        var btnEnviar = document.getElementById('btn-enviar');
        msgConf.style.display = 'none';
        btnEnviar.disabled    = false;
        btnEnviar.textContent = 'Enviar solicitud';

        // 6. Recalcular el panel de presupuesto con los valores vacíos
        setTimeout(calcularPresupuesto, 50);
    }

    // ============================================================
    // ENVÍO DEL FORMULARIO
    // tras mostrar la confirmación 3 segundos, se llama
    // a resetearFormulario() automáticamente para permitir
    // hacer una segunda solicitud sin recargar la página.
    // ============================================================
    var btnEnviar = document.getElementById('btn-enviar');
    var msgConf   = document.getElementById('msg-confirmacion');

    btnEnviar.addEventListener('click', function () {

        var nombreOk    = validarNombre();
        var apellidosOk = validarApellidos();
        var telefonoOk  = validarTelefono();
        var emailOk     = validarEmail();
        var productoOk  = selProducto.value !== '';
        var condOk      = chkCondic.checked;

        if (!nombreOk || !apellidosOk || !telefonoOk || !emailOk) {
            if (!nombreOk)    mostrarError(inNombre,    'err-nombre',    true);
            if (!apellidosOk) mostrarError(inApellidos, 'err-apellidos', true);
            if (!telefonoOk)  mostrarError(inTelefono,  'err-telefono',  true);
            if (!emailOk)     mostrarError(inEmail,     'err-email',     true);
            return;
        }

        if (!productoOk) {
            alert('Por favor, selecciona un tipo de cubierta.');
            selProducto.focus();
            return;
        }

        if (!condOk) {
            alert('Debes aceptar la política de privacidad para enviar el formulario.');
            return;
        }

        // Mostramos la confirmación
        msgConf.style.display = 'block';
        btnEnviar.disabled    = true;
        btnEnviar.textContent = 'Solicitud enviada ✓';

        // Tras 3 segundos reseteamos el formulario para permitir una nueva solicitud
        setTimeout(function () {
            resetearFormulario();
        }, 3000);
    });

    // ============================================================
    // BOTÓN DE RESET MANUAL
    // ============================================================
    var btnReset = document.getElementById('btn-reset');

    btnReset.addEventListener('click', function () {
        resetearFormulario();
    });

});
