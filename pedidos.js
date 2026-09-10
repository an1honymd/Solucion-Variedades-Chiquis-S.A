'use strict';


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const STORAGE_PEDIDOS = 'pedidosChiquis';
const STORAGE_CLIENTES = 'clientesChiquis';
const STORAGE_TEMA = 'temaChiquis';


/* =========================================================
   UTILIDADES
========================================================= */

const $ = id => document.getElementById(id);


function on(id, evento, funcion) {

    const elemento = $(id);

    if (elemento) {
        elemento.addEventListener(evento, funcion);
    }
}


function escaparHTML(valor) {

    if (valor === null || valor === undefined) {
        return '';
    }

    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* =========================================================
   VARIABLES
========================================================= */

let pedidos = [];
let clientes = [];

let pedidoDetalleActual = null;

let filtroPedido = 'todos';

let toastTimer = null;


/* =========================================================
   CARGAR PEDIDOS
========================================================= */

function cargarPedidos() {

    try {

        const datos =
            localStorage.getItem(STORAGE_PEDIDOS);

        if (!datos) {
            return [];
        }

        const resultado =
            JSON.parse(datos);

        return Array.isArray(resultado)
            ? resultado
            : [];

    } catch (error) {

        console.error(
            'Error cargando pedidos:',
            error
        );

        return [];
    }
}


/* =========================================================
   GUARDAR PEDIDOS
========================================================= */

function guardarPedidos() {

    try {

        localStorage.setItem(
            STORAGE_PEDIDOS,
            JSON.stringify(pedidos)
        );

        return true;

    } catch (error) {

        console.error(error);

        mostrarToast(
            'No se pudieron guardar los pedidos.',
            'error'
        );

        return false;
    }
}


/* =========================================================
   CARGAR CLIENTES
========================================================= */

function cargarClientes() {

    try {

        const datos =
            localStorage.getItem(STORAGE_CLIENTES);

        if (!datos) {
            return [];
        }

        const resultado =
            JSON.parse(datos);

        return Array.isArray(resultado)
            ? resultado
            : [];

    } catch (error) {

        console.error(
            'Error cargando clientes:',
            error
        );

        return [];
    }
}


/* =========================================================
   GENERAR ID
========================================================= */

function generarId(prefijo = 'ID-') {

    return (
        prefijo +
        Date.now().toString(36).toUpperCase() +
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()
    );
}


/* =========================================================
   GENERAR NÚMERO DE PEDIDO
========================================================= */

function generarNumeroPedido() {

    let mayor = 0;

    pedidos.forEach(pedido => {

        const numero =
            String(pedido.numero || '')
                .replace(/\D/g, '');

        const valor =
            parseInt(numero, 10);

        if (!isNaN(valor) && valor > mayor) {
            mayor = valor;
        }

    });

    return (
        'PED-' +
        String(mayor + 1).padStart(4, '0')
    );
}


/* =========================================================
   FECHA ACTUAL
========================================================= */

function fechaActualInput() {

    const fecha = new Date();

    const año =
        fecha.getFullYear();

    const mes =
        String(fecha.getMonth() + 1)
            .padStart(2, '0');

    const dia =
        String(fecha.getDate())
            .padStart(2, '0');

    const horas =
        String(fecha.getHours())
            .padStart(2, '0');

    const minutos =
        String(fecha.getMinutes())
            .padStart(2, '0');

    return (
        año +
        '-' +
        mes +
        '-' +
        dia +
        'T' +
        horas +
        ':' +
        minutos
    );
}


/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatearFechaHora(fecha) {

    if (!fecha) {
        return 'Sin fecha';
    }

    const fechaObj =
        new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
        return String(fecha);
    }

    return fechaObj.toLocaleString(
        'es-GT',
        {
            dateStyle: 'short',
            timeStyle: 'short'
        }
    );
}


/* =========================================================
   DINERO
========================================================= */

function dinero(valor) {

    const numero =
        Number(valor) || 0;

    return numero.toLocaleString(
        'es-GT',
        {
            style: 'currency',
            currency: 'GTQ',
            minimumFractionDigits: 2
        }
    );
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
        $('toastMessage');

    const icono =
        $('toastIcon');

    if (!toast) {
        return;
    }

    if (texto) {
        texto.textContent = mensaje;
    }

    if (icono) {

        icono.textContent =
            tipo === 'error'
                ? '✕'
                : tipo === 'warning'
                    ? '⚠️'
                    : '✓';
    }

    toast.classList.add('show');

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove('show');

        }, 3000);
}


/* =========================================================
   OVERLAY
========================================================= */

function abrirOverlay() {

    const overlay =
        $('overlay');

    if (!overlay) {
        return;
    }

    overlay.classList.add('show');
}


function cerrarOverlay() {

    const overlay =
        $('overlay');

    if (!overlay) {
        return;
    }

    overlay.classList.remove('show');
}


/* =========================================================
   CERRAR TODO
========================================================= */

function cerrarTodoAlIniciar() {

    const overlay =
        $('overlay');

    const panel =
        $('pedidoPanel');

    const detalle =
        $('dialogPedidoDetalle');


    overlay?.classList.remove('show');

    panel?.classList.remove('show');

    detalle?.classList.remove('show');

    document.body.classList.remove('modal-open');
}


/* =========================================================
   CLIENTES EN SELECT
========================================================= */

function cargarClientesEnSelect() {

    const select =
        $('pedidoCliente');

    if (!select) {
        return;
    }

    const valorAnterior =
        select.value;

    select.innerHTML =
        '<option value="">Selecciona un cliente</option>';


    clientes.forEach(cliente => {

        const option =
            document.createElement('option');

        option.value =
            cliente.id;

        option.textContent =
            cliente.nombre ||
            'Cliente sin nombre';

        select.appendChild(option);

    });


    if (valorAnterior) {
        select.value = valorAnterior;
    }
}


/* =========================================================
   AGREGAR PRODUCTO
========================================================= */

function agregarFilaProducto(producto = {}) {

    const contenedor =
        $('productosPedido');

    if (!contenedor) {
        return;
    }


    const fila =
        document.createElement('div');

    fila.className =
        'producto-row';


    fila.innerHTML = `

        <div class="field">

            <label>
                Producto
            </label>

            <input
                type="text"
                class="producto-nombre"
                placeholder="Nombre del producto"
                value="${escaparHTML(
                    producto.nombre || ''
                )}"
            >

        </div>


        <div class="field">

            <label>
                Cantidad
            </label>

            <input
                type="number"
                class="producto-cantidad"
                min="1"
                step="1"
                value="${producto.cantidad || 1}"
            >

        </div>


        <div class="field">

            <label>
                Precio
            </label>

            <input
                type="number"
                class="producto-precio"
                min="0"
                step="0.01"
                value="${producto.precio || 0}"
            >

        </div>


        <button
            type="button"
            class="btn-eliminar-producto"
            title="Eliminar producto">

            🗑️

        </button>

    `;


    const btnEliminar =
        fila.querySelector(
            '.btn-eliminar-producto'
        );


    btnEliminar.addEventListener(
        'click',
        () => {

            fila.remove();

            calcularTotales();
        }
    );


    fila.querySelector(
        '.producto-cantidad'
    ).addEventListener(
        'input',
        calcularTotales
    );


    fila.querySelector(
        '.producto-precio'
    ).addEventListener(
        'input',
        calcularTotales
    );


    contenedor.appendChild(fila);
}


/* =========================================================
   OBTENER PRODUCTOS
========================================================= */

function obtenerProductos() {

    const contenedor =
        $('productosPedido');

    if (!contenedor) {
        return [];
    }


    const filas =
        contenedor.querySelectorAll(
            '.producto-row'
        );


    const productos = [];


    filas.forEach(fila => {

        const nombre =
            fila.querySelector(
                '.producto-nombre'
            )?.value.trim() || '';


        const cantidad =
            Number(
                fila.querySelector(
                    '.producto-cantidad'
                )?.value
            ) || 0;


        const precio =
            Number(
                fila.querySelector(
                    '.producto-precio'
                )?.value
            ) || 0;


        if (
            nombre ||
            cantidad ||
            precio
        ) {

            productos.push({

                nombre,

                cantidad,

                precio,

                subtotal:
                    cantidad * precio

            });
        }

    });


    return productos;
}


/* =========================================================
   CALCULAR TOTALES
========================================================= */

function calcularTotales() {

    const productos =
        obtenerProductos();


    let subtotal = 0;


    productos.forEach(producto => {

        subtotal +=
            Number(producto.cantidad || 0) *
            Number(producto.precio || 0);

    });


    const clienteId =
        $('pedidoCliente')?.value;


    const cliente =
        clientes.find(
            c =>
                String(c.id) ===
                String(clienteId)
        );


    const porcentaje =
        Number(cliente?.descuento || 0);


    const descuento =
        subtotal *
        (porcentaje / 100);


    const total =
        subtotal - descuento;


    if ($('pedidoSubtotal')) {

        $('pedidoSubtotal').textContent =
            dinero(subtotal);
    }


    if ($('pedidoDescuento')) {

        $('pedidoDescuento').textContent =
            dinero(descuento);
    }


    if ($('pedidoTotal')) {

        $('pedidoTotal').textContent =
            dinero(total);
    }


    return {
        subtotal,
        descuento,
        total
    };
}


/* =========================================================
   ABRIR PANEL DE PEDIDO
========================================================= */

function abrirPanelPedido(pedido = null) {

    cargarClientesEnSelect();


    const panel =
        $('pedidoPanel');


    const form =
        $('pedidoForm');


    if (!panel || !form) {
        return;
    }


    if (!pedido) {

        form.reset();


        $('pedidoId').value =
            '';


        $('pedidoNumero').value =
            generarNumeroPedido();


        $('pedidoFecha').value =
            fechaActualInput();


        $('pedidoEstado').value =
            'pendiente';


        $('pedidoOrigen').value =
            'Tienda';


        $('pedidoDireccion').value =
            '';


        $('pedidoNotas').value =
            '';


        $('productosPedido').innerHTML =
            '';


        agregarFilaProducto();


        if ($('tituloPanelPedido')) {

            $('tituloPanelPedido').textContent =
                'Nuevo pedido';
        }


        if ($('textoGuardarPedido')) {

            $('textoGuardarPedido').textContent =
                'Guardar pedido';
        }

    } else {

        $('pedidoId').value =
            pedido.id || '';


        $('pedidoNumero').value =
            pedido.numero || '';


        $('pedidoFecha').value =
            pedido.fecha ||
            fechaActualInput();


        $('pedidoCliente').value =
            pedido.clienteId || '';


        $('pedidoOrigen').value =
            pedido.origen ||
            'Tienda';


        $('pedidoEstado').value =
            pedido.estado ||
            'pendiente';


        $('pedidoDireccion').value =
            pedido.direccion ||
            '';


        $('pedidoNotas').value =
            pedido.notas ||
            '';


        $('productosPedido').innerHTML =
            '';


        const productos =
            Array.isArray(pedido.productos)
                ? pedido.productos
                : [];


        if (!productos.length) {

            agregarFilaProducto();

        } else {

            productos.forEach(producto => {

                agregarFilaProducto(producto);

            });
        }


        if ($('tituloPanelPedido')) {

            $('tituloPanelPedido').textContent =
                'Editar pedido';
        }


        if ($('textoGuardarPedido')) {

            $('textoGuardarPedido').textContent =
                'Actualizar pedido';
        }
    }


    calcularTotales();


    abrirOverlay();


    panel.classList.add('show');


    document.body.classList.add(
        'modal-open'
    );


    setTimeout(() => {

        $('pedidoCliente')?.focus();

    }, 150);
}


/* =========================================================
   CERRAR PANEL
========================================================= */

function cerrarPanelPedido() {

    const panel =
        $('pedidoPanel');

    panel?.classList.remove('show');

    cerrarOverlay();

    document.body.classList.remove(
        'modal-open'
    );
}


/* =========================================================
   VALIDAR PEDIDO
========================================================= */

function validarPedido() {

    const cliente =
        $('pedidoCliente')?.value;


    const fecha =
        $('pedidoFecha')?.value;


    const productos =
        obtenerProductos();


    if (!cliente) {

        mostrarToast(
            'Selecciona un cliente.',
            'warning'
        );

        $('pedidoCliente')?.focus();

        return false;
    }


    if (!fecha) {

        mostrarToast(
            'Selecciona la fecha del pedido.',
            'warning'
        );

        $('pedidoFecha')?.focus();

        return false;
    }


    if (!productos.length) {

        mostrarToast(
            'Agrega al menos un producto.',
            'warning'
        );

        return false;
    }


    for (const producto of productos) {

        if (!producto.nombre) {

            mostrarToast(
                'Todos los productos deben tener nombre.',
                'warning'
            );

            return false;
        }


        if (producto.cantidad <= 0) {

            mostrarToast(
                'La cantidad debe ser mayor que cero.',
                'warning'
            );

            return false;
        }


        if (producto.precio < 0) {

            mostrarToast(
                'El precio no puede ser negativo.',
                'warning'
            );

            return false;
        }
    }


    return true;
}


/* =========================================================
   GUARDAR PEDIDO
========================================================= */

function guardarPedido(evento) {

    evento.preventDefault();


    if (!validarPedido()) {
        return;
    }


    const id =
        $('pedidoId')?.value ||
        generarId('PED-');


    const pedidoExistente =
        pedidos.find(
            pedido =>
                String(pedido.id) ===
                String(id)
        );


    const productos =
        obtenerProductos();


    const totales =
        calcularTotales();


    const clienteId =
        $('pedidoCliente').value;


    const cliente =
        clientes.find(
            c =>
                String(c.id) ===
                String(clienteId)
        );


    const datos = {

        id,

        numero:
            $('pedidoNumero').value ||
            generarNumeroPedido(),

        fecha:
            $('pedidoFecha').value ||
            fechaActualInput(),

        clienteId,

        clienteNombre:
            cliente?.nombre ||
            'Cliente',

        clienteTelefono:
            cliente?.telefono ||
            '',

        origen:
            $('pedidoOrigen').value ||
            'Tienda',

        estado:
            $('pedidoEstado').value ||
            'pendiente',

        productos,

        subtotal:
            totales.subtotal,

        descuento:
            totales.descuento,

        total:
            totales.total,

        direccion:
            $('pedidoDireccion').value.trim(),

        notas:
            $('pedidoNotas').value.trim(),

        actualizado:
            new Date().toISOString()
    };


    if (pedidoExistente) {

        Object.assign(
            pedidoExistente,
            datos
        );


        mostrarToast(
            'Pedido actualizado correctamente.'
        );

    } else {

        pedidos.push(datos);


        mostrarToast(
            'Pedido creado correctamente.'
        );
    }


    if (!guardarPedidos()) {
        return;
    }


    cerrarPanelPedido();


    mostrarPedidos();


    actualizarEstadisticasPedidos();
}


/* =========================================================
   FILTRAR PEDIDOS
========================================================= */

function obtenerPedidosFiltrados() {

    const texto =
        $('searchPedidos')?.value
            .trim()
            .toLowerCase() ||
        '';


    return pedidos.filter(pedido => {

        const coincideEstado =
            filtroPedido === 'todos' ||
            String(pedido.estado || '')
                .toLowerCase() ===
            filtroPedido;


        const contenido = [

            pedido.numero,

            pedido.clienteNombre,

            pedido.clienteTelefono,

            pedido.origen,

            pedido.estado

        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();


        const coincideBusqueda =
            !texto ||
            contenido.includes(texto);


        return (
            coincideEstado &&
            coincideBusqueda
        );
    });
}


/* =========================================================
   MOSTRAR PEDIDOS
========================================================= */

function mostrarPedidos() {

    const tbody =
        $('pedidosBody');


    const empty =
        $('emptyPedidos');


    if (!tbody) {
        return;
    }


    const lista =
        obtenerPedidosFiltrados();


    tbody.innerHTML =
        '';


    if (!lista.length) {

        empty?.classList.add('show');

        return;
    }


    empty?.classList.remove('show');


    lista.forEach(pedido => {

        const fila =
            document.createElement('tr');


        const estado =
            String(
                pedido.estado ||
                'pendiente'
            ).toLowerCase();


        const nombre =
            pedido.clienteNombre ||
            obtenerNombreCliente(
                pedido.clienteId
            );


        fila.innerHTML = `

            <td>

                <div class="pedido-numero">

                    <strong>
                        ${escaparHTML(
                            pedido.numero ||
                            'Sin número'
                        )}
                    </strong>

                    <small>
                        ${escaparHTML(
                            pedido.id || ''
                        )}
                    </small>

                </div>

            </td>


            <td>

                <div class="cliente-cell">

                    <div class="avatar">

                        ${escaparHTML(
                            obtenerIniciales(nombre)
                        )}

                    </div>

                    <div>

                        <strong>
                            ${escaparHTML(nombre)}
                        </strong>

                        <small>
                            ${escaparHTML(
                                pedido.clienteTelefono ||
                                ''
                            )}
                        </small>

                    </div>

                </div>

            </td>


            <td>

                ${escaparHTML(
                    formatearFechaHora(
                        pedido.fecha
                    )
                )}

            </td>


            <td>

                <span class="status-badge ${estado}">

                    ${textoEstado(estado)}

                </span>

            </td>


            <td>

                ${escaparHTML(
                    pedido.origen ||
                    'Tienda'
                )}

            </td>


            <td>

                <strong>
                    ${dinero(pedido.total)}
                </strong>

            </td>


            <td>

                <div class="actions">

                    <button
                        class="action-btn"
                        type="button"
                        data-action="ver"
                        data-id="${escaparHTML(
                            pedido.id
                        )}"
                        title="Ver pedido">

                        👁️

                    </button>


                    <button
                        class="action-btn"
                        type="button"
                        data-action="editar"
                        data-id="${escaparHTML(
                            pedido.id
                        )}"
                        title="Editar pedido">

                        ✏️

                    </button>


                    <button
                        class="action-btn danger"
                        type="button"
                        data-action="eliminar"
                        data-id="${escaparHTML(
                            pedido.id
                        )}"
                        title="Eliminar pedido">

                        🗑️

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(fila);

    });
}


/* =========================================================
   NOMBRE CLIENTE
========================================================= */

function obtenerNombreCliente(clienteId) {

    const cliente =
        clientes.find(
            c =>
                String(c.id) ===
                String(clienteId)
        );


    return cliente?.nombre ||
        'Cliente eliminado';
}


/* =========================================================
   INICIALES
========================================================= */

function obtenerIniciales(nombre) {

    if (!nombre) {
        return '?';
    }


    const partes =
        String(nombre)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2);


    return partes
        .map(parte =>
            parte.charAt(0)
        )
        .join('')
        .toUpperCase();
}


/* =========================================================
   ESTADO
========================================================= */

function textoEstado(estado) {

    const estados = {

        pendiente:
            'Pendiente',

        preparando:
            'Preparando',

        entregado:
            'Entregado'

    };


    return estados[estado] ||
        estado;
}


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function actualizarEstadisticasPedidos() {

    const total =
        pedidos.length;


    const pendientes =
        pedidos.filter(
            pedido =>
                String(
                    pedido.estado
                ).toLowerCase() ===
                'pendiente'
        ).length;


    const entregados =
        pedidos.filter(
            pedido =>
                String(
                    pedido.estado
                ).toLowerCase() ===
                'entregado'
        ).length;


    const ventas =
        pedidos.reduce(
            (suma, pedido) =>
                suma +
                (
                    Number(
                        pedido.total
                    ) || 0
                ),
            0
        );


    if ($('statPedidos')) {

        $('statPedidos').textContent =
            total;
    }


    if ($('statPedidosPendientes')) {

        $('statPedidosPendientes').textContent =
            pendientes;
    }


    if ($('statPedidosEntregados')) {

        $('statPedidosEntregados').textContent =
            entregados;
    }


    if ($('statVentas')) {

        $('statVentas').textContent =
            dinero(ventas);
    }
}


/* =========================================================
   MOSTRAR DETALLE
========================================================= */

function mostrarDetallePedido(id) {

    const pedido =
        pedidos.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!pedido) {
        return;
    }


    pedidoDetalleActual =
        pedido;


    const nombre =
        pedido.clienteNombre ||
        obtenerNombreCliente(
            pedido.clienteId
        );


    $('detallePedidoNumero').textContent =
        pedido.numero || '';


    $('detallePedidoCliente').textContent =
        nombre;


    $('detallePedidoTelefono').textContent =
        pedido.clienteTelefono ||
        'Sin teléfono';


    $('detallePedidoFecha').textContent =
        formatearFechaHora(
            pedido.fecha
        );


    $('detallePedidoOrigen').textContent =
        pedido.origen ||
        'Tienda';


    $('detallePedidoDireccion').textContent =
        pedido.direccion ||
        'Sin dirección';


    $('detallePedidoEstado').textContent =
        textoEstado(
            String(
                pedido.estado ||
                'pendiente'
            ).toLowerCase()
        );


    $('detallePedidoTotal').textContent =
        dinero(pedido.total);


    $('detallePedidoNotas').textContent =
        pedido.notas ||
        'Sin notas.';


    const productos =
        $('detallePedidoProductos');


    if (productos) {

        productos.innerHTML =
            '';


        (
            pedido.productos ||
            []
        ).forEach(producto => {

            const fila =
                document.createElement('div');


            fila.className =
                'detalle-producto';


            fila.innerHTML = `

                <span>
                    ${escaparHTML(
                        producto.nombre
                    )}
                </span>


                <span>

                    ${producto.cantidad}
                    ×
                    ${dinero(producto.precio)}

                </span>


                <strong>

                    ${dinero(
                        producto.subtotal ||
                        (
                            producto.cantidad *
                            producto.precio
                        )
                    )}

                </strong>

            `;


            productos.appendChild(fila);

        });
    }


    const dialog =
        $('dialogPedidoDetalle');


    if (dialog) {

        dialog.classList.add('show');
    }
}


/* =========================================================
   CERRAR DETALLE
========================================================= */

function cerrarDetallePedido() {

    const dialog =
        $('dialogPedidoDetalle');


    dialog?.classList.remove('show');


    pedidoDetalleActual =
        null;
}


/* =========================================================
   EDITAR PEDIDO
========================================================= */

function editarPedido(id) {

    const pedido =
        pedidos.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!pedido) {
        return;
    }


    cerrarDetallePedido();


    abrirPanelPedido(pedido);
}


/* =========================================================
   ELIMINAR PEDIDO
========================================================= */

function eliminarPedido(id) {

    const pedido =
        pedidos.find(
            p =>
                String(p.id) ===
                String(id)
        );


    if (!pedido) {
        return;
    }


    const confirmar =
        window.confirm(
            `¿Deseas eliminar el pedido ${pedido.numero}?`
        );


    if (!confirmar) {
        return;
    }


    pedidos =
        pedidos.filter(
            p =>
                String(p.id) !==
                String(id)
        );


    if (!guardarPedidos()) {
        return;
    }


    cerrarDetallePedido();


    mostrarPedidos();


    actualizarEstadisticasPedidos();


    mostrarToast(
        'Pedido eliminado correctamente.'
    );
}


/* =========================================================
   WHATSAPP
========================================================= */

function abrirWhatsAppPedido() {

    if (!pedidoDetalleActual) {
        return;
    }


    let telefono =
        String(
            pedidoDetalleActual.clienteTelefono ||
            ''
        ).replace(/\D/g, '');


    if (telefono.length === 8) {

        telefono =
            '502' +
            telefono;
    }


    if (!telefono) {

        mostrarToast(
            'El cliente no tiene teléfono registrado.',
            'warning'
        );

        return;
    }


    const mensaje =
        'Hola, le escribimos de Variedades Chiquis. ' +
        'Respecto a su pedido ' +
        (
            pedidoDetalleActual.numero ||
            ''
        ) +
        '.';


    const url =
        'https://wa.me/' +
        telefono +
        '?text=' +
        encodeURIComponent(mensaje);


    window.open(
        url,
        '_blank',
        'noopener,noreferrer'
    );
}


/* =========================================================
   EXPORTAR
========================================================= */

function exportarPedidos() {

    const datos =
        JSON.stringify(
            pedidos,
            null,
            2
        );


    const blob =
        new Blob(
            [datos],
            {
                type:
                    'application/json'
            }
        );


    const url =
        URL.createObjectURL(blob);


    const enlace =
        document.createElement('a');


    enlace.href =
        url;


    enlace.download =
        'pedidos-variedades-chiquis.json';


    document.body.appendChild(enlace);


    enlace.click();


    enlace.remove();


    URL.revokeObjectURL(url);


    mostrarToast(
        'Pedidos exportados correctamente.'
    );
}


/* =========================================================
   TEMA
========================================================= */

function aplicarTema() {

    const tema =
        localStorage.getItem(
            STORAGE_TEMA
        );


    if (tema === 'oscuro') {

        document.body.classList.add('dark');

    } else {

        document.body.classList.remove('dark');
    }


    actualizarBotonTema();
}


function actualizarBotonTema() {

    const oscuro =
        document.body.classList.contains('dark');


    if ($('themeIcon')) {

        $('themeIcon').textContent =
            oscuro
                ? '☀️'
                : '🌙';
    }


    if ($('themeText')) {

        $('themeText').textContent =
            oscuro
                ? 'Tema claro'
                : 'Cambiar tema';
    }
}


function cambiarTema() {

    const oscuro =
        document.body.classList.toggle('dark');


    localStorage.setItem(
        STORAGE_TEMA,
        oscuro
            ? 'oscuro'
            : 'claro'
    );


    actualizarBotonTema();
}


/* =========================================================
   EVENTOS
========================================================= */


/* NUEVO PEDIDO */

on(
    'btnNuevoPedido',
    'click',
    () => abrirPanelPedido()
);


on(
    'btnNuevoPedidoVacio',
    'click',
    () => abrirPanelPedido()
);


/* PRODUCTOS */

on(
    'btnAgregarProducto',
    'click',
    () => agregarFilaProducto()
);


/* CERRAR PANEL */

on(
    'btnCerrarPedido',
    'click',
    cerrarPanelPedido
);


on(
    'btnCancelarPedido',
    'click',
    cerrarPanelPedido
);


on(
    'overlay',
    'click',
    cerrarPanelPedido
);


/* CLIENTE */

on(
    'pedidoCliente',
    'change',
    calcularTotales
);


/* FORMULARIO */

on(
    'pedidoForm',
    'submit',
    guardarPedido
);


/* BUSCAR */

on(
    'searchPedidos',
    'input',
    mostrarPedidos
);


/* FILTRO */

on(
    'filtroEstado',
    'change',
    () => {

        filtroPedido =
            $('filtroEstado')?.value ||
            'todos';


        mostrarPedidos();
    }
);


/* LIMPIAR */

on(
    'btnLimpiarPedidos',
    'click',
    () => {

        if ($('searchPedidos')) {

            $('searchPedidos').value =
                '';
        }


        if ($('filtroEstado')) {

            $('filtroEstado').value =
                'todos';
        }


        filtroPedido =
            'todos';


        mostrarPedidos();
    }
);


/* EXPORTAR */

on(
    'btnExportarPedidos',
    'click',
    exportarPedidos
);


/* TEMA */

on(
    'btnTema',
    'click',
    cambiarTema
);


/* =========================================================
   NAVEGACIÓN CLIENTES
========================================================= */

on(
    'btnNavClientes',
    'click',
    evento => {

        evento.preventDefault();

        window.location.href =
            './cliente.html';
    }
);


/* =========================================================
   ACCIONES TABLA
========================================================= */

on(
    'pedidosBody',
    'click',
    evento => {

        const boton =
            evento.target.closest(
                '[data-action]'
            );


        if (!boton) {
            return;
        }


        const accion =
            boton.dataset.action;


        const id =
            boton.dataset.id;


        if (accion === 'ver') {

            mostrarDetallePedido(id);

        } else if (accion === 'editar') {

            editarPedido(id);

        } else if (accion === 'eliminar') {

            eliminarPedido(id);
        }
    }
);


/* =========================================================
   BOTONES DETALLE
========================================================= */

on(
    'btnCerrarDetalle',
    'click',
    cerrarDetallePedido
);


on(
    'btnEditarPedidoDetalle',
    'click',
    () => {

        if (pedidoDetalleActual) {

            editarPedido(
                pedidoDetalleActual.id
            );
        }
    }
);


on(
    'btnEliminarPedidoDetalle',
    'click',
    () => {

        if (pedidoDetalleActual) {

            eliminarPedido(
                pedidoDetalleActual.id
            );
        }
    }
);


on(
    'btnWhatsAppPedido',
    'click',
    abrirWhatsAppPedido
);


/* =========================================================
   CERRAR MODAL DETALLE AL HACER CLIC AFUERA
========================================================= */

on(
    'dialogPedidoDetalle',
    'click',
    evento => {

        if (
            evento.target ===
            $('dialogPedidoDetalle')
        ) {

            cerrarDetallePedido();
        }
    }
);


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    'keydown',
    evento => {

        if (evento.key !== 'Escape') {
            return;
        }


        const panel =
            $('pedidoPanel');


        const detalle =
            $('dialogPedidoDetalle');


        if (
            panel?.classList.contains('show')
        ) {

            cerrarPanelPedido();

            return;
        }


        if (
            detalle?.classList.contains('show')
        ) {

            cerrarDetallePedido();
        }
    }
);


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        pedidos =
            cargarPedidos();


        clientes =
            cargarClientes();


        cerrarTodoAlIniciar();


        aplicarTema();


        mostrarPedidos();


        actualizarEstadisticasPedidos();

    }
);