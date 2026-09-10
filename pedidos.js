'use strict';

/* ============================================================
   VARIEDADES CHIQUIS - PEDIDOS
   ============================================================ */


/* ============================================================
   VARIABLES
   ============================================================ */

const STORAGE_PEDIDOS = 'pedidosChiquis';
const STORAGE_CLIENTES = 'clientesChiquis';
const STORAGE_TEMA = 'temaChiquis';


const $ = (id) => {
    return document.getElementById(id);
};


const on = (id, evento, funcion) => {

    const elemento = $(id);

    if (elemento) {
        elemento.addEventListener(evento, funcion);
    }

    return elemento;
};


let pedidos = [];
let clientes = [];

let pedidoDetalleActual = null;
let pedidoEditando = null;

let filtroPedido = 'todos';

let toastTimer = null;


/* ============================================================
   UTILIDADES
   ============================================================ */

function escaparHTML(valor) {

    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function dinero(valor) {

    return 'Q' +
        Number(valor || 0).toFixed(2);
}


function generarId(prefijo = 'PED-') {

    return prefijo +
        Date.now() +
        Math.random()
            .toString(36)
            .substring(2, 8);
}


function formatearFechaHora(fecha) {

    if (!fecha) {
        return 'Sin fecha';
    }

    const d = new Date(fecha);

    if (Number.isNaN(d.getTime())) {
        return 'Sin fecha';
    }

    return d.toLocaleString(
        'es-GT',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    );
}


function fechaActualInput() {

    const fecha = new Date();

    fecha.setMinutes(
        fecha.getMinutes() -
        fecha.getTimezoneOffset()
    );

    return fecha
        .toISOString()
        .slice(0, 16);
}


/* ============================================================
   TOAST
   ============================================================ */

function mostrarToast(
    mensaje,
    tipo = 'success'
) {

    const toast = $('toast');

    if (!toast) {
        return;
    }

    const icono = $('toastIcon');
    const texto = $('toastMessage');

    if (texto) {
        texto.textContent = mensaje;
    }

    if (icono) {

        icono.textContent =
            tipo === 'error'
                ? '!'
                : '✓';
    }

    toast.classList.add('show');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove('show');

    }, 3000);
}


/* ============================================================
   LOCAL STORAGE
   ============================================================ */

function cargarPedidos() {

    try {

        const datos =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_PEDIDOS
                ) || '[]'
            );

        return Array.isArray(datos)
            ? datos
            : [];

    } catch (error) {

        console.error(
            'Error cargando pedidos:',
            error
        );

        return [];
    }
}


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


function cargarClientes() {

    try {

        const datos =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_CLIENTES
                ) || '[]'
            );

        return Array.isArray(datos)
            ? datos
            : [];

    } catch (error) {

        console.error(
            'Error cargando clientes:',
            error
        );

        return [];
    }
}


/* ============================================================
   NÚMERO DE PEDIDO
   ============================================================ */

function generarNumeroPedido() {

    let mayor = 0;

    pedidos.forEach(pedido => {

        const numero =
            String(
                pedido.numero || ''
            );

        const coincidencia =
            numero.match(
                /^PED-(\d+)$/i
            );

        if (coincidencia) {

            const n =
                Number(
                    coincidencia[1]
                );

            if (n > mayor) {
                mayor = n;
            }
        }
    });

    return 'PED-' +
        String(mayor + 1)
            .padStart(4, '0');
}


/* ============================================================
   CLIENTES SELECT
   ============================================================ */

function cargarClientesEnSelect() {

    const select =
        $('pedidoCliente');

    if (!select) {
        return;
    }

    clientes =
        cargarClientes();

    select.innerHTML = `
        <option value="">
            Seleccionar cliente
        </option>
    `;

    clientes.forEach(cliente => {

        const option =
            document.createElement(
                'option'
            );

        option.value =
            cliente.id;

        option.textContent =
            `${cliente.nombre} — ${
                cliente.telefono ||
                'Sin teléfono'
            }`;

        select.appendChild(option);
    });
}


/* ============================================================
   PRODUCTOS
   ============================================================ */

function agregarFilaProducto(
    producto = {}
) {

    const contenedor =
        $('productosPedido');

    if (!contenedor) {
        return;
    }

    const fila =
        document.createElement('div');

    fila.className =
        'producto-pedido-row';


    fila.innerHTML = `

        <div class="field">

            <label class="field-label">
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

            <label class="field-label">
                Cantidad
            </label>

            <input
                type="number"
                class="producto-cantidad"
                min="1"
                step="1"
                value="${
                    producto.cantidad ||
                    1
                }"
            >

        </div>


        <div class="field">

            <label class="field-label">
                Precio
            </label>

            <input
                type="number"
                class="producto-precio"
                min="0"
                step="0.01"
                value="${
                    producto.precio ?? 0
                }"
            >

        </div>


        <button
            type="button"
            class="btn-eliminar-producto"
            title="Eliminar producto">

            ×

        </button>

    `;


    contenedor.appendChild(fila);


    fila
        .querySelectorAll(
            '.producto-cantidad, .producto-precio'
        )
        .forEach(input => {

            input.addEventListener(
                'input',
                calcularTotales
            );
        });


    const btnEliminar =
        fila.querySelector(
            '.btn-eliminar-producto'
        );


    if (btnEliminar) {

        btnEliminar.addEventListener(
            'click',
            () => {

                fila.remove();

                calcularTotales();
            }
        );
    }
}


function obtenerProductos() {

    const filas =
        document.querySelectorAll(
            '.producto-pedido-row'
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
                )?.value || 0
            );


        const precio =
            Number(
                fila.querySelector(
                    '.producto-precio'
                )?.value || 0
            );


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


/* ============================================================
   TOTALES
   ============================================================ */

function calcularTotales() {

    const productos =
        obtenerProductos();


    const subtotal =
        productos.reduce(
            (total, producto) => {

                return total +
                    Number(
                        producto.subtotal || 0
                    );

            },
            0
        );


    const clienteId =
        $('pedidoCliente')?.value;


    const cliente =
        clientes.find(
            c =>
                String(c.id) ===
                String(clienteId)
        );


    const porcentaje =
        Number(
            cliente?.descuento || 0
        );


    const descuento =
        subtotal *
        porcentaje /
        100;


    const total =
        Math.max(
            0,
            subtotal - descuento
        );


    if ($('pedidoSubtotal')) {

        $('pedidoSubtotal')
            .textContent =
            dinero(subtotal);
    }


    if ($('pedidoDescuento')) {

        $('pedidoDescuento')
            .textContent =
            dinero(descuento);
    }


    if ($('pedidoTotal')) {

        $('pedidoTotal')
            .textContent =
            dinero(total);
    }
}


/* ============================================================
   ABRIR PANEL
   ============================================================ */

function abrirPanelPedido(
    pedido = null
) {

    const panel =
        $('pedidoPanel');

    const formulario =
        $('pedidoForm');


    if (!panel || !formulario) {
        return;
    }


    pedidoEditando =
        pedido;


    clientes =
        cargarClientes();


    cargarClientesEnSelect();


    const overlay =
        $('overlay');


    if (overlay) {

        overlay.hidden = false;
    }


    formulario.reset();


    const contenedorProductos =
        $('productosPedido');


    if (contenedorProductos) {

        contenedorProductos.innerHTML =
            '';
    }


    if ($('pedidoId')) {

        $('pedidoId').value =
            pedido?.id || '';
    }


    if ($('pedidoPanelTitulo')) {

        $('pedidoPanelTitulo')
            .textContent =
            pedido
                ? 'Editar pedido'
                : 'Nuevo pedido';
    }


    if ($('pedidoNumero')) {

        $('pedidoNumero').value =
            pedido?.numero ||
            generarNumeroPedido();
    }


    if ($('pedidoFecha')) {

        $('pedidoFecha').value =
            pedido?.fecha ||
            fechaActualInput();
    }


    if ($('pedidoCliente')) {

        $('pedidoCliente').value =
            pedido?.clienteId || '';
    }


    if ($('pedidoOrigen')) {

        $('pedidoOrigen').value =
            pedido?.origen ||
            'WhatsApp';
    }


    if ($('pedidoEstado')) {

        $('pedidoEstado').value =
            pedido?.estado ||
            'pendiente';
    }


    if ($('pedidoDireccion')) {

        $('pedidoDireccion').value =
            pedido?.direccion ||
            '';
    }


    if ($('pedidoNotas')) {

        $('pedidoNotas').value =
            pedido?.notas ||
            '';
    }


    if (
        pedido &&
        Array.isArray(pedido.productos) &&
        pedido.productos.length
    ) {

        pedido.productos.forEach(
            producto => {

                agregarFilaProducto(
                    producto
                );
            }
        );

    } else {

        agregarFilaProducto();
    }


    panel.classList.add('show');

    panel.setAttribute(
        'aria-hidden',
        'false'
    );


    calcularTotales();


    setTimeout(() => {

        $('pedidoCliente')
            ?.focus();

    }, 250);
}


/* ============================================================
   CERRAR PANEL
   ============================================================ */

function cerrarPanelPedido() {

    const panel =
        $('pedidoPanel');

    const overlay =
        $('overlay');


    if (!panel) {
        return;
    }


    panel.classList.remove('show');

    panel.setAttribute(
        'aria-hidden',
        'true'
    );


    if (overlay) {

        overlay.hidden = true;
    }


    pedidoEditando = null;
}


/* ============================================================
   VALIDAR PEDIDO
   ============================================================ */

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
            'error'
        );

        return false;
    }


    if (!fecha) {

        mostrarToast(
            'Selecciona la fecha del pedido.',
            'error'
        );

        return false;
    }


    if (!productos.length) {

        mostrarToast(
            'Agrega al menos un producto.',
            'error'
        );

        return false;
    }


    for (const producto of productos) {

        if (
            !producto.nombre ||
            producto.cantidad <= 0 ||
            producto.precio < 0
        ) {

            mostrarToast(
                'Revisa los productos del pedido.',
                'error'
            );

            return false;
        }
    }


    return true;
}


/* ============================================================
   GUARDAR PEDIDO
   ============================================================ */

function guardarPedido(event) {

    event.preventDefault();


    if (!validarPedido()) {
        return;
    }


    clientes =
        cargarClientes();


    const id =
        $('pedidoId')?.value ||
        generarId();


    const numero =
        $('pedidoNumero')?.value ||
        generarNumeroPedido();


    const clienteId =
        $('pedidoCliente').value;


    const cliente =
        clientes.find(
            c =>
                String(c.id) ===
                String(clienteId)
        );


    const productos =
        obtenerProductos();


    const subtotal =
        productos.reduce(
            (total, producto) => {

                return total +
                    Number(
                        producto.subtotal || 0
                    );

            },
            0
        );


    const porcentajeDescuento =
        Number(
            cliente?.descuento || 0
        );


    const descuento =
        subtotal *
        porcentajeDescuento /
        100;


    const total =
        Math.max(
            0,
            subtotal - descuento
        );


    const pedido = {

        id,

        numero,

        fecha:
            $('pedidoFecha').value,

        clienteId,

        clienteNombre:
            cliente?.nombre || '',

        clienteTelefono:
            cliente?.telefono || '',

        origen:
            $('pedidoOrigen').value,

        estado:
            $('pedidoEstado').value,

        productos,

        subtotal,

        porcentajeDescuento,

        descuento,

        total,

        direccion:
            $('pedidoDireccion')
                .value.trim(),

        notas:
            $('pedidoNotas')
                .value.trim(),

        fechaActualizacion:
            new Date().toISOString()
    };


    const indice =
        pedidos.findIndex(
            p =>
                String(p.id) ===
                String(id)
        );


    if (indice >= 0) {

        pedido.fechaCreacion =
            pedidos[indice]
                .fechaCreacion ||
            new Date().toISOString();


        pedidos[indice] = {

            ...pedidos[indice],

            ...pedido
        };


        mostrarToast(
            'Pedido actualizado correctamente.'
        );

    } else {

        pedido.fechaCreacion =
            new Date().toISOString();


        pedidos.push(pedido);


        mostrarToast(
            'Pedido registrado correctamente.'
        );
    }


    if (guardarPedidos()) {

        cerrarPanelPedido();

        mostrarPedidos();

        actualizarEstadisticasPedidos();
    }
}


/* ============================================================
   FILTRAR PEDIDOS
   ============================================================ */

function obtenerPedidosFiltrados() {

    const busqueda =
        (
            $('searchPedidos')
                ?.value || ''
        )
            .trim()
            .toLowerCase();


    return pedidos.filter(pedido => {

        const coincideEstado =
            filtroPedido === 'todos' ||
            pedido.estado === filtroPedido;


        const productosTexto =
            (pedido.productos || [])
                .map(
                    producto =>
                        producto.nombre || ''
                )
                .join(' ');


        const texto = [

            pedido.numero,

            pedido.clienteNombre,

            pedido.clienteTelefono,

            pedido.origen,

            pedido.direccion,

            pedido.notas,

            productosTexto

        ]
            .join(' ')
            .toLowerCase();


        const coincideBusqueda =
            !busqueda ||
            texto.includes(busqueda);


        return coincideEstado &&
            coincideBusqueda;
    });
}


/* ============================================================
   MOSTRAR PEDIDOS
   ============================================================ */

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


    tbody.innerHTML = '';


    lista.forEach(pedido => {

        const tr =
            document.createElement('tr');


        const productos =
            Array.isArray(pedido.productos)
                ? pedido.productos
                : [];


        const nombres =
            productos
                .map(
                    producto =>
                        producto.nombre
                )
                .filter(Boolean)
                .join(', ');


        const estadoTexto = {

            pendiente:
                'Pendiente',

            preparando:
                'Preparando',

            entregado:
                'Entregado',

            cancelado:
                'Cancelado'

        }[
            pedido.estado
        ] || 'Sin estado';


        const inicial =
            (
                pedido.clienteNombre ||
                '?'
            )
                .charAt(0)
                .toUpperCase();


        tr.innerHTML = `

            <td class="pedido-numero">

                <strong>
                    ${escaparHTML(
                        pedido.numero ||
                        'Sin número'
                    )}
                </strong>

                <small>
                    ${escaparHTML(
                        pedido.origen ||
                        ''
                    )}
                </small>

            </td>


            <td>

                <div class="client-cell">

                    <div class="client-avatar">

                        ${escaparHTML(
                            inicial
                        )}

                    </div>


                    <div>

                        <strong>

                            ${escaparHTML(
                                pedido.clienteNombre ||
                                'Sin cliente'
                            )}

                        </strong>


                        <small>

                            ${escaparHTML(
                                pedido.clienteTelefono ||
                                'Sin teléfono'
                            )}

                        </small>

                    </div>

                </div>

            </td>


            <td>

                <div class="productos-resumen">

                    <strong>

                        ${productos.length}

                        ${
                            productos.length === 1
                                ? 'producto'
                                : 'productos'
                        }

                    </strong>


                    <small>

                        ${escaparHTML(
                            nombres ||
                            'Sin productos'
                        )}

                    </small>

                </div>

            </td>


            <td>

                <strong>

                    ${dinero(
                        pedido.total
                    )}

                </strong>

            </td>


            <td>

                ${formatearFechaHora(
                    pedido.fecha
                )}

            </td>


            <td>

                <span class="status-badge ${
                    escaparHTML(
                        pedido.estado ||
                        ''
                    )
                }">

                    ${estadoTexto}

                </span>

            </td>


            <td>

                <div class="row-actions">

                    <button
                        type="button"
                        class="table-action btn-ver-pedido"
                        data-id="${escaparHTML(
                            pedido.id
                        )}"
                        title="Ver pedido">

                        👁

                    </button>


                    <button
                        type="button"
                        class="table-action btn-editar-pedido"
                        data-id="${escaparHTML(
                            pedido.id
                        )}"
                        title="Editar pedido">

                        ✎

                    </button>


                    <button
                        type="button"
                        class="table-action danger btn-eliminar-pedido"
                        data-id="${escaparHTML(
                            pedido.id
                        )}"
                        title="Eliminar pedido">

                        🗑

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(tr);
    });


    if (empty) {

        empty.classList.toggle(
            'show',
            lista.length === 0
        );
    }


    if ($('footerPedidos')) {

        $('footerPedidos')
            .textContent =
            `${lista.length} pedido${
                lista.length === 1
                    ? ''
                    : 's'
            }`;
    }


    actualizarContadoresPedidos();
}


/* ============================================================
   CONTADORES
   ============================================================ */

function actualizarContadoresPedidos() {

    const pendientes =
        pedidos.filter(
            p =>
                p.estado ===
                'pendiente'
        ).length;


    const preparando =
        pedidos.filter(
            p =>
                p.estado ===
                'preparando'
        ).length;


    const entregados =
        pedidos.filter(
            p =>
                p.estado ===
                'entregado'
        ).length;


    if ($('countPedidosTodos')) {

        $('countPedidosTodos')
            .textContent =
            pedidos.length;
    }


    if ($('countPedidosPendientes')) {

        $('countPedidosPendientes')
            .textContent =
            pendientes;
    }


    if ($('countPedidosPreparando')) {

        $('countPedidosPreparando')
            .textContent =
            preparando;
    }


    if ($('countPedidosEntregados')) {

        $('countPedidosEntregados')
            .textContent =
            entregados;
    }
}


/* ============================================================
   ESTADÍSTICAS
   ============================================================ */

function actualizarEstadisticasPedidos() {

    const total =
        pedidos.length;


    const pendientes =
        pedidos.filter(
            p =>
                p.estado ===
                'pendiente'
        ).length;


    const entregados =
        pedidos.filter(
            p =>
                p.estado ===
                'entregado'
        ).length;


    const ventas =
        pedidos.reduce(
            (sum, pedido) => {

                return sum +
                    Number(
                        pedido.total || 0
                    );

            },
            0
        );


    if ($('statPedidos')) {

        $('statPedidos')
            .textContent =
            total;
    }


    if ($('statPedidosPendientes')) {

        $('statPedidosPendientes')
            .textContent =
            pendientes;
    }


    if ($('statPedidosEntregados')) {

        $('statPedidosEntregados')
            .textContent =
            entregados;
    }


    if ($('statVentas')) {

        $('statVentas')
            .textContent =
            dinero(ventas);
    }


    actualizarContadoresPedidos();
}


/* ============================================================
   EVENTOS DE LA TABLA
   ============================================================ */

on(
    'pedidosBody',
    'click',
    event => {

        const boton =
            event.target.closest(
                'button[data-id]'
            );


        if (!boton) {
            return;
        }


        const id =
            boton.dataset.id;


        const pedido =
            pedidos.find(
                p =>
                    String(p.id) ===
                    String(id)
            );


        if (!pedido) {
            return;
        }


        if (
            boton.classList.contains(
                'btn-ver-pedido'
            )
        ) {

            mostrarDetallePedido(
                pedido
            );
        }


        else if (
            boton.classList.contains(
                'btn-editar-pedido'
            )
        ) {

            abrirPanelPedido(
                pedido
            );
        }


        else if (
            boton.classList.contains(
                'btn-eliminar-pedido'
            )
        ) {

            eliminarPedido(
                pedido
            );
        }

    }
);


/* ============================================================
   BUSCADOR
   ============================================================ */

on(
    'searchPedidos',
    'input',
    () => {

        const input =
            $('searchPedidos');

        const limpiar =
            $('btnLimpiarPedidos');


        if (limpiar && input) {

            limpiar.classList.toggle(
                'visible',
                input.value.trim() !== ''
            );
        }


        mostrarPedidos();
    }
);


/* ============================================================
   LIMPIAR
   ============================================================ */

on(
    'btnLimpiarPedidos',
    'click',
    () => {

        if ($('searchPedidos')) {

            $('searchPedidos').value =
                '';
        }


        $('btnLimpiarPedidos')
            ?.classList.remove(
                'visible'
            );


        filtroPedido =
            'todos';


        document
            .querySelectorAll(
                '.filter-button[data-estado]'
            )
            .forEach(boton => {

                boton.classList.remove(
                    'active'
                );
            });


        document
            .querySelector(
                '.filter-button[data-estado="todos"]'
            )
            ?.classList.add(
                'active'
            );


        mostrarPedidos();
    }
);


/* ============================================================
   FILTROS
   ============================================================ */

document
    .querySelectorAll(
        '.filter-button[data-estado]'
    )
    .forEach(boton => {

        boton.addEventListener(
            'click',
            () => {

                filtroPedido =
                    boton.dataset.estado ||
                    'todos';


                document
                    .querySelectorAll(
                        '.filter-button[data-estado]'
                    )
                    .forEach(b => {

                        b.classList.remove(
                            'active'
                        );
                    });


                boton.classList.add(
                    'active'
                );


                mostrarPedidos();
            }
        );
    });


/* ============================================================
   DETALLE DEL PEDIDO
   ============================================================ */

function mostrarDetallePedido(
    pedido
) {

    pedidoDetalleActual =
        pedido;


    const dialog =
        $('dialogPedidoDetalle');


    if (!dialog) {
        return;
    }


    if ($('detallePedidoNumero')) {

        $('detallePedidoNumero')
            .textContent =
            pedido.numero ||
            'Pedido';
    }


    if ($('detallePedidoEstado')) {

        const estadoTexto = {

            pendiente:
                'Pendiente',

            preparando:
                'Preparando',

            entregado:
                'Entregado',

            cancelado:
                'Cancelado'

        }[
            pedido.estado
        ] || 'Sin estado';


        const badge =
            $('detallePedidoEstado');


        badge.textContent =
            estadoTexto;


        badge.className =
            'detail-badge';


        if (pedido.estado) {

            badge.classList.add(
                pedido.estado
            );
        }
    }


    if ($('detallePedidoCliente')) {

        $('detallePedidoCliente')
            .textContent =
            pedido.clienteNombre ||
            '-';
    }


    if ($('detallePedidoTelefono')) {

        $('detallePedidoTelefono')
            .textContent =
            pedido.clienteTelefono ||
            '-';
    }


    if ($('detallePedidoFecha')) {

        $('detallePedidoFecha')
            .textContent =
            formatearFechaHora(
                pedido.fecha
            );
    }


    if ($('detallePedidoOrigen')) {

        $('detallePedidoOrigen')
            .textContent =
            pedido.origen ||
            '-';
    }


    if ($('detallePedidoDireccion')) {

        $('detallePedidoDireccion')
            .textContent =
            pedido.direccion ||
            '-';
    }


    if ($('detallePedidoTotal')) {

        $('detallePedidoTotal')
            .textContent =
            dinero(
                pedido.total
            );
    }


    if ($('detallePedidoProductos')) {

        const contenedor =
            $('detallePedidoProductos');


        contenedor.innerHTML =
            '';


        (
            pedido.productos ||
            []
        ).forEach(producto => {

            const div =
                document.createElement(
                    'div'
                );


            div.className =
                'detalle-producto';


            div.innerHTML = `

                <span>

                    ${escaparHTML(
                        producto.nombre ||
                        'Producto'
                    )}

                </span>


                <strong>

                    ${Number(
                        producto.cantidad || 0
                    )}

                    ×

                    ${dinero(
                        producto.precio
                    )}

                    =

                    ${dinero(
                        producto.subtotal
                    )}

                </strong>

            `;


            contenedor.appendChild(
                div
            );
        });
    }


    if ($('detallePedidoNotas')) {

        $('detallePedidoNotas')
            .textContent =
            pedido.notas ||
            'Sin notas registradas.';
    }


    if (
        typeof dialog.showModal ===
        'function'
    ) {

        if (!dialog.open) {

            dialog.showModal();
        }

    } else {

        dialog.setAttribute(
            'open',
            ''
        );
    }
}


/* ============================================================
   CERRAR DETALLE
   ============================================================ */

on(
    'btnCerrarPedidoDetalle',
    'click',
    () => {

        $('dialogPedidoDetalle')
            ?.close();
    }
);


/* ============================================================
   EDITAR DESDE DETALLE
   ============================================================ */

on(
    'btnEditarPedidoDetalle',
    'click',
    () => {

        if (!pedidoDetalleActual) {
            return;
        }


        $('dialogPedidoDetalle')
            ?.close();


        abrirPanelPedido(
            pedidoDetalleActual
        );
    }
);


/* ============================================================
   ELIMINAR PEDIDO
   ============================================================ */

function eliminarPedido(
    pedido
) {

    const confirmar =
        confirm(
            `¿Deseas eliminar el pedido ${pedido.numero}?`
        );


    if (!confirmar) {
        return;
    }


    pedidos =
        pedidos.filter(
            p =>
                String(p.id) !==
                String(pedido.id)
        );


    if (guardarPedidos()) {

        mostrarPedidos();

        actualizarEstadisticasPedidos();

        mostrarToast(
            'Pedido eliminado correctamente.'
        );
    }
}


/* ============================================================
   ELIMINAR DESDE DETALLE
   ============================================================ */

on(
    'btnEliminarPedidoDetalle',
    'click',
    () => {

        if (!pedidoDetalleActual) {
            return;
        }


        const pedido =
            pedidoDetalleActual;


        $('dialogPedidoDetalle')
            ?.close();


        eliminarPedido(
            pedido
        );
    }
);


/* ============================================================
   WHATSAPP
   ============================================================ */

on(
    'btnWhatsAppPedido',
    'click',
    () => {

        if (
            !pedidoDetalleActual ||
            !pedidoDetalleActual.clienteTelefono
        ) {

            mostrarToast(
                'El cliente no tiene teléfono registrado.',
                'error'
            );

            return;
        }


        const pedido =
            pedidoDetalleActual;


        let telefono =
            String(
                pedido.clienteTelefono
            )
            .replace(/\D/g, '');


        if (telefono.length === 8) {

            telefono =
                '502' +
                telefono;
        }


        let mensaje =
            `Hola ${
                pedido.clienteNombre ||
                ''
            },\n\n`;


        mensaje +=
            `Detalle del pedido ${
                pedido.numero
            }:\n\n`;


        (
            pedido.productos ||
            []
        ).forEach(producto => {

            mensaje +=
                `• ${
                    producto.nombre
                } — ${
                    producto.cantidad
                } x ${
                    dinero(
                        producto.precio
                    )
                } = ${
                    dinero(
                        producto.subtotal
                    )
                }\n`;
        });


        mensaje +=
            `\nSubtotal: ${
                dinero(
                    pedido.subtotal
                )
            }`;


        if (
            Number(
                pedido.descuento || 0
            ) > 0
        ) {

            mensaje +=
                `\nDescuento: ${
                    dinero(
                        pedido.descuento
                    )
                }`;
        }


        mensaje +=
            `\nTotal: ${
                dinero(
                    pedido.total
                )
            }`;


        if (pedido.direccion) {

            mensaje +=
                `\n\nDirección: ${
                    pedido.direccion
                }`;
        }


        window.open(
            `https://wa.me/${telefono}?text=${
                encodeURIComponent(
                    mensaje
                )
            }`,
            '_blank'
        );
    }
);


/* ============================================================
   BOTONES PRINCIPALES
   ============================================================ */

on(
    'btnNuevoPedido',
    'click',
    () => {

        abrirPanelPedido();
    }
);


on(
    'btnNuevoPedidoVacio',
    'click',
    () => {

        abrirPanelPedido();
    }
);


on(
    'btnAgregarProducto',
    'click',
    () => {

        agregarFilaProducto();

        calcularTotales();
    }
);


on(
    'btnCerrarPedidoPanel',
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


on(
    'pedidoForm',
    'submit',
    guardarPedido
);


on(
    'pedidoCliente',
    'change',
    calcularTotales
);


/* ============================================================
   NAVEGACIÓN
   ============================================================ */

/*
    NO agregamos ningún evento para btnNavClientes.

    El HTML ya tiene:

    <a href="cliente.html">

    Por lo tanto el navegador se encarga
    directamente de cambiar de página.

    Esto evita el error anterior.
*/


/* ============================================================
   TEMA
   ============================================================ */

function actualizarTema() {

    const oscuro =
        document.body.classList.contains(
            'dark'
        );


    const icono =
        $('themeIcon');


    if (icono) {

        icono.textContent =
            oscuro
                ? '☀️'
                : '🌙';
    }
}


function cambiarTema() {

    const oscuro =
        document.body.classList.toggle(
            'dark'
        );


    localStorage.setItem(
        STORAGE_TEMA,
        oscuro
            ? 'dark'
            : 'light'
    );


    actualizarTema();
}


function cargarTema() {

    const tema =
        localStorage.getItem(
            STORAGE_TEMA
        );


    if (tema === 'dark') {

        document.body.classList.add(
            'dark'
        );

    } else {

        document.body.classList.remove(
            'dark'
        );
    }


    actualizarTema();
}


on(
    'btnTema',
    'click',
    cambiarTema
);


/* ============================================================
   TECLADO
   ============================================================ */

document.addEventListener(
    'keydown',
    event => {

        if (
            event.key === 'Escape'
        ) {

            const panel =
                $('pedidoPanel');


            if (
                panel?.classList.contains(
                    'show'
                )
            ) {

                cerrarPanelPedido();

                return;
            }


            const dialog =
                $('dialogPedidoDetalle');


            if (dialog?.open) {

                dialog.close();
            }
        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() === 'n'
        ) {

            event.preventDefault();

            abrirPanelPedido();
        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() === 'f'
        ) {

            event.preventDefault();

            $('searchPedidos')
                ?.focus();
        }
    }
);


/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        pedidos =
            cargarPedidos();


        clientes =
            cargarClientes();


        cargarTema();


        cargarClientesEnSelect();


        mostrarPedidos();


        actualizarEstadisticasPedidos();

    }
);