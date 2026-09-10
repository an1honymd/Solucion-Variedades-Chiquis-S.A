'use strict';

const STORAGE_KEY = 'clientesChiquis';
const THEME_KEY = 'temaChiquis';

const $ = id => document.getElementById(id);

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

let clientes = [];
let clienteEditando = null;
let clienteEliminar = null;
let toastTimer = null;

function cargarClientes() {

    try {

        const datos =
            localStorage.getItem(STORAGE_KEY);

        if (!datos) {
            clientes = [];
            return;
        }

        const parsed = JSON.parse(datos);

        clientes =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(error);

        clientes = [];

        mostrarToast(
            'No se pudieron cargar los clientes.',
            'error'
        );
    }
}

function guardarClientes() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(clientes)
        );

        return true;

    } catch (error) {

        console.error(error);

        mostrarToast(
            'No se pudieron guardar los clientes.',
            'error'
        );

        return false;
    }
}

function generarId(prefijo = 'CLI-') {

    return (
        prefijo +
        Date.now() +
        '-' +
        Math.floor(Math.random() * 1000)
    );
}

function obtenerTipoCliente() {

    if ($('tipoMayorista')?.checked) {
        return 'mayorista';
    }

    return 'minorista';
}

function abrirPanelCliente(cliente = null) {

    clienteEditando = cliente;

    const panel = $('panelCliente');
    const overlay = $('overlay');

    if (!panel) {
        return;
    }

    if (cliente) {

        $('tituloPanel').textContent =
            'Editar cliente';

        $('clienteId').value =
            cliente.id || '';

        $('nombre').value =
            cliente.nombre || '';

        $('telefono').value =
            cliente.telefono || '';

        $('email').value =
            cliente.email || '';

        $('dpi').value =
            cliente.dpi || '';

        $('nit').value =
            cliente.nit || '';

        $('direccion').value =
            cliente.direccion || '';

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

        $('tituloPanel').textContent =
            'Nuevo cliente';

        limpiarFormularioCliente();
    }

    panel.classList.add('show');

    if (overlay) {
        overlay.classList.add('show');
    }

    setTimeout(() => {

        $('nombre')?.focus();

    }, 100);
}

function cerrarPanelCliente() {

    $('panelCliente')?.classList.remove('show');

    $('overlay')?.classList.remove('show');

    clienteEditando = null;

    limpiarFormularioCliente();
}

function limpiarFormularioCliente() {

    $('clienteForm')?.reset();

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
}

function validarCliente() {

    const nombre =
        $('nombre').value.trim();

    const telefono =
        $('telefono').value.trim();

    const email =
        $('email').value.trim();

    const nit =
        $('nit').value.trim();

    const tipo =
        obtenerTipoCliente();

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

function guardarCliente(event) {

    event.preventDefault();

    if (!validarCliente()) {
        return;
    }

    const id =
        $('clienteId').value ||
        generarId();

    const cliente = {

        id,

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

        tipo:
            obtenerTipoCliente(),

        descuento:
            Number($('descuento').value || 0),

        limiteCredito:
            Number(
                $('limiteCredito').value || 0
            ),

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

function obtenerIniciales(nombre) {

    const partes =
        String(nombre || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!partes.length) {
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

function formatearFecha(fecha) {

    if (!fecha) {
        return '—';
    }

    const date = new Date(fecha);

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
}

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

    const filtrados =
        clientes.filter(cliente => {

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
                String(cliente.tipo || '')
                    .toLowerCase() ===
                filtroTipo;

            return coincideBusqueda &&
                   coincideTipo;
        });

    tabla.innerHTML = '';

    if (!filtrados.length) {

        estadoVacio?.classList.add('show');

        return;
    }

    estadoVacio?.classList.remove('show');

    filtrados.forEach(cliente => {

        const fila =
            document.createElement('tr');

        const nombre =
            cliente.nombre || 'Sin nombre';

        const tipo =
            cliente.tipo || 'minorista';

        const descuento =
            Number(cliente.descuento || 0);

        fila.innerHTML = `

            <td>

                <div class="client-cell">

                    <div class="client-avatar">

                        ${escapeHTML(
                            obtenerIniciales(nombre)
                        )}

                    </div>

                    <div>

                        <div class="client-name">

                            ${escapeHTML(nombre)}

                        </div>

                        <span class="client-id">

                            ${escapeHTML(
                                cliente.id || ''
                            )}

                        </span>

                    </div>

                </div>

            </td>

            <td>
                ${escapeHTML(
                    cliente.telefono || '—'
                )}
            </td>

            <td>
                ${escapeHTML(
                    cliente.email || '—'
                )}
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
                ${escapeHTML(
                    formatearFecha(
                        cliente.fechaRegistro
                    )
                )}
            </td>

            <td>

                <div class="actions">

                    <button
                        class="action-btn"
                        type="button"
                        data-action="editar"
                        data-id="${escapeHTML(cliente.id)}">

                        ✏️

                    </button>

                    <button
                        class="action-btn"
                        type="button"
                        data-action="whatsapp"
                        data-id="${escapeHTML(cliente.id)}">

                        💬

                    </button>

                    <button
                        class="action-btn delete"
                        type="button"
                        data-action="eliminar"
                        data-id="${escapeHTML(cliente.id)}">

                        🗑️

                    </button>

                </div>

            </td>
        `;

        tabla.appendChild(fila);
    });
}

function actualizarEstadisticas() {

    const total = clientes.length;

    const minoristas =
        clientes.filter(
            c => c.tipo === 'minorista'
        ).length;

    const mayoristas =
        clientes.filter(
            c => c.tipo === 'mayorista'
        ).length;

    $('totalClientes').textContent =
        total;

    $('totalMinoristas').textContent =
        minoristas;

    $('totalMayoristas').textContent =
        mayoristas;

    $('totalActivos').textContent =
        total;
}

function editarCliente(id) {

    const cliente =
        clientes.find(
            c => String(c.id) === String(id)
        );

    if (!cliente) {
        return;
    }

    abrirPanelCliente(cliente);
}

function solicitarEliminarCliente(id) {

    const cliente =
        clientes.find(
            c => String(c.id) === String(id)
        );

    if (!cliente) {
        return;
    }

    clienteEliminar = cliente;

    $('modalTitulo').textContent =
        '¿Eliminar cliente?';

    $('modalMensaje').textContent =
        `¿Deseas eliminar a "${cliente.nombre}"? Esta acción no se puede deshacer.`;

    $('modalConfirmacion')
        .classList.add('show');
}

function cerrarModal() {

    $('modalConfirmacion')
        ?.classList.remove('show');

    clienteEliminar = null;
}

function confirmarEliminar() {

    if (!clienteEliminar) {
        return;
    }

    const id = clienteEliminar.id;

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

    if (telefono.length === 8) {
        telefono = '502' + telefono;
    }

    if (!telefono) {

        mostrarToast(
            'Este cliente no tiene teléfono registrado.',
            'error'
        );

        return;
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

function exportarClientes() {

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

    enlace.href = url;

    enlace.download =
        `clientes-chiquis-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

    URL.revokeObjectURL(url);

    mostrarToast(
        'Clientes exportados correctamente.',
        'success'
    );
}

function importarClientes(event) {

    const archivo =
        event.target.files?.[0];

    if (!archivo) {
        return;
    }

    const lector =
        new FileReader();

    lector.onload = () => {

        try {

            const datos =
                JSON.parse(lector.result);

            if (!Array.isArray(datos)) {
                throw new Error();
            }

            clientes =
                datos.map(cliente => ({

                    ...cliente,

                    id:
                        cliente.id ||
                        generarId(),

                    fechaRegistro:
                        cliente.fechaRegistro ||
                        new Date().toISOString()

                }));

            guardarClientes();

            mostrarClientes();

            actualizarEstadisticas();

            mostrarToast(
                'Clientes importados correctamente.',
                'success'
            );

        } catch {

            mostrarToast(
                'El archivo seleccionado no es válido.',
                'error'
            );
        }

        event.target.value = '';
    };

    lector.readAsText(archivo);
}

function aplicarTema() {

    const tema =
        localStorage.getItem(
            THEME_KEY
        ) || 'claro';

    document.body.classList.toggle(
        'dark',
        tema === 'oscuro'
    );

    actualizarBotonTema();
}

function cambiarTema() {

    const oscuro =
        document.body.classList.toggle('dark');

    localStorage.setItem(
        THEME_KEY,
        oscuro ? 'oscuro' : 'claro'
    );

    actualizarBotonTema();
}

function actualizarBotonTema() {

    const boton = $('btnTema');

    if (!boton) {
        return;
    }

    const oscuro =
        document.body.classList.contains('dark');

    boton.innerHTML =
        oscuro
            ? '<span>☀️</span><span>Tema claro</span>'
            : '<span>🌙</span><span>Tema oscuro</span>';
}

function mostrarToast(
    mensaje,
    tipo = 'success'
) {

    const toast = $('toast');
    const texto = $('toastMensaje');
    const icono = $('toastIcon');

    if (!toast) {
        return;
    }

    texto.textContent = mensaje;

    icono.textContent =
        tipo === 'error'
            ? '✕'
            : '✓';

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

document.addEventListener(
    'click',
    event => {

        const boton =
            event.target.closest(
                '[data-action]'
            );

        if (!boton) {
            return;
        }

        const id =
            boton.dataset.id;

        const accion =
            boton.dataset.action;

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
    () => $('archivoImportar')?.click()
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

document.addEventListener(
    'keydown',
    event => {

        if (event.key !== 'Escape') {
            return;
        }

        if (
            $('panelCliente')
                ?.classList.contains('show')
        ) {

            cerrarPanelCliente();

            return;
        }

        if (
            $('modalConfirmacion')
                ?.classList.contains('show')
        ) {

            cerrarModal();
        }
    }
);

document.addEventListener(
    'keydown',
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === 'n'
        ) {

            event.preventDefault();

            abrirPanelCliente();
        }

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === 'f'
        ) {

            event.preventDefault();

            $('buscar')?.focus();
        }
    }
);

document.addEventListener(
    'DOMContentLoaded',
    () => {

        aplicarTema();

        cargarClientes();

        mostrarClientes();

        actualizarEstadisticas();
    }
);