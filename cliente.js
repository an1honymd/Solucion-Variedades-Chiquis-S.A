/* =========================================================
   VARIEDADES CHIQUIS
   JAVASCRIPT - GESTIÓN DE CLIENTES
   ========================================================= */

'use strict';


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const STORAGE_KEY = 'clientesChiquis';
const THEME_KEY = 'temaChiquis';


/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

const $ = (id) => document.getElementById(id);


function on(id, event, callback) {

    const element = $(id);

    if (element) {
        element.addEventListener(event, callback);
    }

}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}


/* =========================================================
   DATOS
   ========================================================= */

let clientes = [];
let clienteEditando = null;
let clienteEliminar = null;
let toastTimer = null;


/* =========================================================
   CARGAR CLIENTES
   ========================================================= */

function cargarClientes() {

    try {

        const datos = localStorage.getItem(STORAGE_KEY);

        if (!datos) {
            clientes = [];
            return;
        }

        const parsed = JSON.parse(datos);

        clientes = Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        console.error('Error al cargar clientes:', error);

        clientes = [];

        mostrarToast(
            'No se pudieron cargar los clientes.',
            'error'
        );

    }

}


/* =========================================================
   GUARDAR CLIENTES
   ========================================================= */

function guardarClientes() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(clientes)
        );

        return true;

    } catch (error) {

        console.error('Error al guardar clientes:', error);

        mostrarToast(
            'No se pudieron guardar los clientes.',
            'error'
        );

        return false;

    }

}


/* =========================================================
   GENERAR ID
   ========================================================= */

function generarId(prefijo = 'CLI-') {

    const ahora = Date.now();

    const aleatorio = Math.floor(
        Math.random() * 1000
    );

    return `${prefijo}${ahora}-${aleatorio}`;

}


/* =========================================================
   OBTENER TIPO
   ========================================================= */

function obtenerTipoCliente() {

    const mayorista = $('tipoMayorista');

    if (mayorista && mayorista.checked) {
        return 'mayorista';
    }

    return 'minorista';

}


/* =========================================================
   ABRIR PANEL
   ========================================================= */

function abrirPanelCliente(cliente = null) {

    clienteEditando = cliente;

    const panel = $('panelCliente');
    const overlay = $('overlay');

    if (!panel) {
        return;
    }


    if (cliente) {

        $('tituloPanel').textContent = 'Editar cliente';

        $('clienteId').value = cliente.id || '';

        $('nombre').value = cliente.nombre || '';
        $('telefono').value = cliente.telefono || '';
        $('email').value = cliente.email || '';
        $('dpi').value = cliente.dpi || '';
        $('nit').value = cliente.nit || '';
        $('direccion').value = cliente.direccion || '';

        $('descuento').value =
            cliente.descuento ?? 0;

        $('limiteCredito').value =
            cliente.limiteCredito ?? 0;


        if (cliente.tipo === 'mayorista') {

            $('tipoMayorista').checked = true;

        } else {

            $('tipoMinorista').checked = true;

        }

    } else {

        $('tituloPanel').textContent = 'Nuevo cliente';

        limpiarFormularioCliente();

    }


    actualizarCamposTipo();


    panel.classList.add('show');

    if (overlay) {
        overlay.classList.add('show');
    }


    setTimeout(() => {

        const nombre = $('nombre');

        if (nombre) {
            nombre.focus();
        }

    }, 100);

}


/* =========================================================
   CERRAR PANEL
   ========================================================= */

function cerrarPanelCliente() {

    const panel = $('panelCliente');
    const overlay = $('overlay');

    if (panel) {
        panel.classList.remove('show');
    }

    if (overlay) {
        overlay.classList.remove('show');
    }

    clienteEditando = null;

    limpiarFormularioCliente();

}


/* =========================================================
   LIMPIAR FORMULARIO
   ========================================================= */

function limpiarFormularioCliente() {

    const form = $('clienteForm');

    if (form) {
        form.reset();
    }


    if ($('clienteId')) {
        $('clienteId').value = '';
    }


    if ($('tipoMinorista')) {
        $('tipoMinorista').checked = true;
    }


    if ($('descuento')) {
        $('descuento').value = 0;
    }


    if ($('limiteCredito')) {
        $('limiteCredito').value = 0;
    }


    actualizarCamposTipo();

}


/* =========================================================
   ACTUALIZAR CAMPOS SEGÚN TIPO
   ========================================================= */

function actualizarCamposTipo() {

    const mayorista = obtenerTipoCliente();

    const descuento = $('descuento');
    const limiteCredito = $('limiteCredito');

    if (!descuento || !limiteCredito) {
        return;
    }


    if (mayorista === 'mayorista') {

        descuento.disabled = false;
        limiteCredito.disabled = false;

    } else {

        descuento.disabled = false;
        limiteCredito.disabled = false;

    }

}


/* =========================================================
   VALIDAR CLIENTE
   ========================================================= */

function validarCliente() {

    const nombre = $('nombre').value.trim();
    const telefono = $('telefono').value.trim();
    const email = $('email').value.trim();
    const nit = $('nit').value.trim();

    const tipo = obtenerTipoCliente();

    const descuento =
        Number($('descuento').value || 0);


    if (nombre.length < 3) {

        mostrarToast(
            'El nombre debe tener al menos 3 caracteres.',
            'error'
        );

        $('nombre').focus();

        return false;

    }


    const telefonoNumeros =
        telefono.replace(/\D/g, '');


    if (telefonoNumeros.length < 8) {

        mostrarToast(
            'El teléfono debe tener al menos 8 dígitos.',
            'error'
        );

        $('telefono').focus();

        return false;

    }


    if (email) {

        const emailValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!emailValido) {

            mostrarToast(
                'Ingresa un correo electrónico válido.',
                'error'
            );

            $('email').focus();

            return false;

        }

    }


    if (tipo === 'mayorista' && !nit) {

        mostrarToast(
            'El NIT es obligatorio para clientes mayoristas.',
            'error'
        );

        $('nit').focus();

        return false;

    }


    if (
        Number.isNaN(descuento) ||
        descuento < 0 ||
        descuento > 100
    ) {

        mostrarToast(
            'El descuento debe estar entre 0 y 100%.',
            'error'
        );

        $('descuento').focus();

        return false;

    }


    return true;

}


/* =========================================================
   GUARDAR CLIENTE
   ========================================================= */

function guardarCliente(event) {

    event.preventDefault();


    if (!validarCliente()) {
        return;
    }


    const id =
        $('clienteId').value ||
        generarId('CLI-');


    const tipo =
        obtenerTipoCliente();


    const cliente = {

        id: id,

        nombre:
            $('nombre').value.trim(),

        telefono:
            $('telefono').value.trim(),

        email:
            $('email').value.trim(),

        dpi:
            $('dpi').value.trim(),

        nit:
            $('nit').value.trim(),

        direccion:
            $('direccion').value.trim(),

        tipo: tipo,

        descuento:
            Number($('descuento').value || 0),

        limiteCredito:
            Number($('limiteCredito').value || 0),

        fechaRegistro:
            clienteEditando?.fechaRegistro ||
            new Date().toISOString()

    };


    const indice =
        clientes.findIndex(
            c => String(c.id) === String(id)
        );


    if (indice >= 0) {

        clientes[indice] = cliente;

        if (guardarClientes()) {

            mostrarToast(
                'Cliente actualizado correctamente.',
                'success'
            );

            cerrarPanelCliente();

            mostrarClientes();

            actualizarEstadisticas();

        }

    } else {

        clientes.push(cliente);

        if (guardarClientes()) {

            mostrarToast(
                'Cliente creado correctamente.',
                'success'
            );

            cerrarPanelCliente();

            mostrarClientes();

            actualizarEstadisticas();

        }

    }

}


/* =========================================================
   MOSTRAR CLIENTES
   ========================================================= */

function mostrarClientes() {

    const tabla = $('clientesTabla');
    const estadoVacio = $('estadoVacio');

    if (!tabla) {
        return;
    }


    const busqueda =
        ($('buscar')?.value || '')
            .trim()
            .toLowerCase();


    const filtroTipo =
        ($('filtroTipo')?.value || '')
            .toLowerCase();


    let filtrados = clientes.filter(cliente => {

        const texto = [

            cliente.nombre,
            cliente.telefono,
            cliente.email,
            cliente.nit,
            cliente.dpi,
            cliente.direccion,
            cliente.id

        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();


        const coincideBusqueda =
            !busqueda ||
            texto.includes(busqueda);


        const coincideTipo =
            !filtroTipo ||
            String(cliente.tipo || '').toLowerCase()
                === filtroTipo;


        return coincideBusqueda && coincideTipo;

    });


    tabla.innerHTML = '';


    if (filtrados.length === 0) {

        if (estadoVacio) {
            estadoVacio.classList.add('show');
        }

        return;

    }


    if (estadoVacio) {
        estadoVacio.classList.remove('show');
    }


    filtrados.forEach(cliente => {

        const fila =
            document.createElement('tr');


        const nombre =
            cliente.nombre || 'Sin nombre';


        const iniciales =
            obtenerIniciales(nombre);


        const tipo =
            cliente.tipo || 'minorista';


        const descuento =
            Number(cliente.descuento || 0);


        const fecha =
            formatearFecha(cliente.fechaRegistro);


        fila.innerHTML = `

            <td>

                <div class="client-cell">

                    <div class="client-avatar">
                        ${escapeHTML(iniciales)}
                    </div>

                    <div>

                        <div class="client-name">
                            ${escapeHTML(nombre)}
                        </div>

                        <span class="client-id">
                            ${escapeHTML(cliente.id || '')}
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(cliente.telefono || '—')}
            </td>


            <td>
                ${escapeHTML(cliente.email || '—')}
            </td>


            <td>

                <span class="badge ${
                    tipo === 'mayorista'
                        ? 'badge-mayorista'
                        : 'badge-minorista'
                }">

                    ${
                        tipo === 'mayorista'
                            ? '🏪 Mayorista'
                            : '🛒 Minorista'
                    }

                </span>

            </td>


            <td>
                ${descuento.toFixed(2)}%
            </td>


            <td>
                ${escapeHTML(fecha)}
            </td>


            <td>

                <div class="actions">

                    <button
                        class="action-btn"
                        type="button"
                        title="Editar cliente"
                        data-action="editar"
                        data-id="${escapeHTML(cliente.id)}"
                    >
                        ✏️
                    </button>


                    <button
                        class="action-btn"
                        type="button"
                        title="WhatsApp"
                        data-action="whatsapp"
                        data-id="${escapeHTML(cliente.id)}"
                    >
                        💬
                    </button>


                    <button
                        class="action-btn delete"
                        type="button"
                        title="Eliminar cliente"
                        data-action="eliminar"
                        data-id="${escapeHTML(cliente.id)}"
                    >
                        🗑️
                    </button>

                </div>

            </td>

        `;


        tabla.appendChild(fila);

    });

}


/* =========================================================
   INICIALES
   ========================================================= */

function obtenerIniciales(nombre) {

    const partes =
        String(nombre)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (partes.length === 0) {
        return '?';
    }


    if (partes.length === 1) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   FECHA
   ========================================================= */

function formatearFecha(fecha) {

    if (!fecha) {
        return '—';
    }


    try {

        const date =
            new Date(fecha);


        if (Number.isNaN(date.getTime())) {
            return '—';
        }


        return date.toLocaleDateString(
            'es-GT',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }
        );

    } catch {

        return '—';

    }

}


/* =========================================================
   ESTADÍSTICAS
   ========================================================= */

function actualizarEstadisticas() {

    const total =
        clientes.length;


    const minoristas =
        clientes.filter(
            c => c.tipo === 'minorista'
        ).length;


    const mayoristas =
        clientes.filter(
            c => c.tipo === 'mayorista'
        ).length;


    const activos =
        clientes.length;


    if ($('totalClientes')) {
        $('totalClientes').textContent = total;
    }


    if ($('totalMinoristas')) {
        $('totalMinoristas').textContent =
            minoristas;
    }


    if ($('totalMayoristas')) {
        $('totalMayoristas').textContent =
            mayoristas;
    }


    if ($('totalActivos')) {
        $('totalActivos').textContent =
            activos;
    }

}


/* =========================================================
   EDITAR
   ========================================================= */

function editarCliente(id) {

    const cliente =
        clientes.find(
            c => String(c.id) === String(id)
        );


    if (!cliente) {

        mostrarToast(
            'No se encontró el cliente.',
            'error'
        );

        return;

    }


    abrirPanelCliente(cliente);

}


/* =========================================================
   ELIMINAR
   ========================================================= */

function solicitarEliminarCliente(id) {

    const cliente =
        clientes.find(
            c => String(c.id) === String(id)
        );


    if (!cliente) {
        return;
    }


    clienteEliminar = cliente;


    const titulo =
        $('modalTitulo');

    const mensaje =
        $('modalMensaje');


    if (titulo) {
        titulo.textContent =
            '¿Eliminar cliente?';
    }


    if (mensaje) {

        mensaje.textContent =
            `¿Deseas eliminar a "${cliente.nombre}"? Esta acción no se puede deshacer.`;

    }


    const modal =
        $('modalConfirmacion');


    if (modal) {
        modal.classList.add('show');
    }

}


/* =========================================================
   CERRAR MODAL
   ========================================================= */

function cerrarModal() {

    const modal =
        $('modalConfirmacion');


    if (modal) {
        modal.classList.remove('show');
    }


    clienteEliminar = null;

}


/* =========================================================
   CONFIRMAR ELIMINACIÓN
   ========================================================= */

function confirmarEliminar() {

    if (!clienteEliminar) {
        return;
    }


    const id =
        clienteEliminar.id;


    clientes =
        clientes.filter(
            c => String(c.id) !== String(id)
        );


    if (guardarClientes()) {

        mostrarToast(
            'Cliente eliminado correctamente.',
            'success'
        );

        cerrarModal();

        mostrarClientes();

        actualizarEstadisticas();

    }

}


/* =========================================================
   WHATSAPP
   ========================================================= */

function abrirWhatsApp(id) {

    const cliente =
        clientes.find(
            c => String(c.id) === String(id)
        );


    if (!cliente) {
        return;
    }


    let telefono =
        String(cliente.telefono || '')
            .replace(/\D/g, '');


    if (!telefono) {

        mostrarToast(
            'Este cliente no tiene teléfono registrado.',
            'error'
        );

        return;

    }


    /*
       Guatemala = 502.
       Si el número tiene 8 dígitos,
       agregamos automáticamente el código.
    */

    if (telefono.length === 8) {
        telefono = '502' + telefono;
    }


    const mensaje =
        encodeURIComponent(
            `Hola ${cliente.nombre}, le saluda Variedades Chiquis.`
        );


    const url =
        `https://wa.me/${telefono}?text=${mensaje}`;


    window.open(
        url,
        '_blank',
        'noopener,noreferrer'
    );

}


/* =========================================================
   EXPORTAR
   ========================================================= */

function exportarClientes() {

    try {

        const contenido =
            JSON.stringify(
                clientes,
                null,
                2
            );


        const blob =
            new Blob(
                [contenido],
                {
                    type: 'application/json'
                }
            );


        const url =
            URL.createObjectURL(blob);


        const enlace =
            document.createElement('a');


        const fecha =
            new Date()
                .toISOString()
                .slice(0, 10);


        enlace.href = url;

        enlace.download =
            `clientes-chiquis-${fecha}.json`;


        document.body.appendChild(enlace);

        enlace.click();

        enlace.remove();


        URL.revokeObjectURL(url);


        mostrarToast(
            'Clientes exportados correctamente.',
            'success'
        );

    } catch (error) {

        console.error(error);

        mostrarToast(
            'No se pudo exportar la información.',
            'error'
        );

    }

}


/* =========================================================
   IMPORTAR
   ========================================================= */

function importarClientes(event) {

    const archivo =
        event.target.files?.[0];


    if (!archivo) {
        return;
    }


    const lector =
        new FileReader();


    lector.onload =
        function () {

            try {

                const datos =
                    JSON.parse(
                        lector.result
                    );


                if (!Array.isArray(datos)) {

                    throw new Error(
                        'El archivo no contiene una lista válida.'
                    );

                }


                const nuevos =
                    datos.map(cliente => ({

                        ...cliente,

                        id:
                            cliente.id ||
                            generarId('CLI-'),

                        fechaRegistro:
                            cliente.fechaRegistro ||
                            new Date().toISOString()

                    }));


                clientes = nuevos;


                if (guardarClientes()) {

                    mostrarClientes();

                    actualizarEstadisticas();

                    mostrarToast(
                        'Clientes importados correctamente.',
                        'success'
                    );

                }

            } catch (error) {

                console.error(error);

                mostrarToast(
                    'El archivo seleccionado no es válido.',
                    'error'
                );

            }


            event.target.value = '';

        };


    lector.onerror =
        function () {

            mostrarToast(
                'No se pudo leer el archivo.',
                'error'
            );

            event.target.value = '';

        };


    lector.readAsText(archivo);

}


/* =========================================================
   TEMA
   ========================================================= */

function aplicarTema() {

    let tema = 'light';


    try {

        tema =
            localStorage.getItem(THEME_KEY)
            || 'light';

    } catch (error) {

        console.warn(
            'No se pudo leer el tema.',
            error
        );

    }


    if (tema === 'dark') {

        document.body.classList.add('dark');

    } else {

        document.body.classList.remove('dark');

    }


    actualizarBotonTema();

}


/* =========================================================
   CAMBIAR TEMA
   ========================================================= */

function cambiarTema() {

    const oscuro =
        document.body.classList.toggle('dark');


    const nuevoTema =
        oscuro ? 'dark' : 'light';


    try {

        localStorage.setItem(
            THEME_KEY,
            nuevoTema
        );

    } catch (error) {

        console.warn(
            'No se pudo guardar el tema.',
            error
        );

    }


    actualizarBotonTema();

}


/* =========================================================
   BOTÓN DE TEMA
   ========================================================= */

function actualizarBotonTema() {

    const boton =
        $('btnTema');


    if (!boton) {
        return;
    }


    if (
        document.body.classList.contains('dark')
    ) {

        boton.innerHTML =
            '<span>☀️</span><span>Tema claro</span>';

    } else {

        boton.innerHTML =
            '<span>🌙</span><span>Tema oscuro</span>';

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function mostrarToast(
    mensaje,
    tipo = 'success'
) {

    const toast =
        $('toast');

    const texto =
        $('toastMensaje');

    const icono =
        $('toastIcon');


    if (!toast || !texto) {
        return;
    }


    texto.textContent =
        mensaje;


    if (icono) {

        if (tipo === 'error') {

            icono.textContent = '✕';

            icono.style.background =
                'var(--danger-light)';

            icono.style.color =
                'var(--danger)';

        } else {

            icono.textContent = '✓';

            icono.style.background =
                'var(--success-light)';

            icono.style.color =
                'var(--success)';

        }

    }


    toast.classList.add('show');


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {
                toast.classList.remove('show');
            },
            3000
        );

}


/* =========================================================
   EVENTOS DE TABLA
   ========================================================= */

on(
    'clientesTabla',
    'click',
    function (event) {

        const boton =
            event.target.closest(
                '[data-action]'
            );


        if (!boton) {
            return;
        }


        const accion =
            boton.dataset.action;


        const id =
            boton.dataset.id;


        if (accion === 'editar') {

            editarCliente(id);

        }


        if (accion === 'eliminar') {

            solicitarEliminarCliente(id);

        }


        if (accion === 'whatsapp') {

            abrirWhatsApp(id);

        }

    }
);


/* =========================================================
   EVENTOS PRINCIPALES
   ========================================================= */

on(
    'btnNuevo',
    'click',
    () => abrirPanelCliente()
);


on(
    'btnNuevoVacio',
    'click',
    () => abrirPanelCliente()
);


on(
    'btnCerrarPanel',
    'click',
    cerrarPanelCliente
);


on(
    'btnCancelar',
    'click',
    cerrarPanelCliente
);


on(
    'overlay',
    'click',
    cerrarPanelCliente
);


on(
    'clienteForm',
    'submit',
    guardarCliente
);


on(
    'tipoMinorista',
    'change',
    actualizarCamposTipo
);


on(
    'tipoMayorista',
    'change',
    actualizarCamposTipo
);


on(
    'buscar',
    'input',
    mostrarClientes
);


on(
    'filtroTipo',
    'change',
    mostrarClientes
);


on(
    'btnModalCancelar',
    'click',
    cerrarModal
);


on(
    'btnModalConfirmar',
    'click',
    confirmarEliminar
);


on(
    'btnExportar',
    'click',
    exportarClientes
);


on(
    'btnImportar',
    'click',
    () => {

        const archivo =
            $('archivoImportar');

        if (archivo) {
            archivo.click();
        }

    }
);


on(
    'archivoImportar',
    'change',
    importarClientes
);


on(
    'btnTema',
    'click',
    cambiarTema
);


/* =========================================================
   CERRAR CON ESCAPE
   ========================================================= */

document.addEventListener(
    'keydown',
    function (event) {

        if (event.key !== 'Escape') {
            return;
        }


        const panel =
            $('panelCliente');


        if (
            panel &&
            panel.classList.contains('show')
        ) {

            cerrarPanelCliente();

            return;

        }


        const modal =
            $('modalConfirmacion');


        if (
            modal &&
            modal.classList.contains('show')
        ) {

            cerrarModal();

        }

    }
);


/* =========================================================
   ATAJOS DE TECLADO
   ========================================================= */

document.addEventListener(
    'keydown',
    function (event) {

        /*
         * Ctrl + N = Nuevo cliente
         */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === 'n'
        ) {

            event.preventDefault();

            abrirPanelCliente();

        }


        /*
         * Ctrl + F = Buscar
         */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === 'f'
        ) {

            event.preventDefault();

            const buscar =
                $('buscar');

            if (buscar) {

                buscar.focus();

                buscar.select();

            }

        }

    }
);


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    function () {

        aplicarTema();

        cargarClientes();

        mostrarClientes();

        actualizarEstadisticas();

        actualizarCamposTipo();

    }
);