/* =========================================================
   VARIEDADES CHIQUIS
   GESTIÓN Y SEGUIMIENTO DE PEDIDOS
   ========================================================= */

'use strict';

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_PEDIDOS = 'pedidosChiquis';
const STORAGE_CLIENTES = 'clientesChiquis';
const STORAGE_TEMA = 'temaChiquis';

/* =========================================================
   ESTADOS DEL PEDIDO
========================================================= */

const ESTADOS_PEDIDO = [
    {
        id: 'pedido_recibido',
        nombre: 'Pedido recibido',
        icono: '📥'
    },
    {
        id: 'en_preparacion',
        nombre: 'En preparación',
        icono: '🧑‍🍳'
    },
    {
        id: 'preparado',
        nombre: 'Preparado',
        icono: '📦'
    },
    {
        id: 'despachado',
        nombre: 'Despachado',
        icono: '🚚'
    },
    {
        id: 'en_proceso_entrega',
        nombre: 'En proceso de entrega',
        icono: '🛵'
    },
    {
        id: 'entregado',
        nombre: 'Entregado',
        icono: '✅'
    }
];

const MAPA_ESTADOS_ANTIGUOS = {
    pendiente: 'pedido_recibido',
    preparando: 'en_preparacion',
    enviado: 'despachado',
    entregado: 'entregado',
    cancelado: 'cancelado'
};

/* =========================================================
   PRODUCTOS
========================================================= */

const productos = [
    {
        id: 1,
        nombre: 'Laptop',
        precio: 5500
    },
    {
        id: 2,
        nombre: 'Monitor',
        precio: 1800
    },
    {
        id: 3,
        nombre: 'Teclado',
        precio: 450
    },
    {
        id: 4,
        nombre: 'Mouse',
        precio: 250
    },
    {
        id: 5,
        nombre: 'Impresora',
        precio: 1200
    },
    {
        id: 6,
        nombre: 'Audífonos',
        precio: 1000
    },
    {
        id: 7,
        nombre: 'Bocinas',
        precio: 2000
    },
    {
        id: 8,
        nombre: 'Silla Gamer',
        precio: 1000
    },
    {
        id: 9,
        nombre: 'SSD',
        precio: 750
    }
];

/* =========================================================
   UTILIDADES
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function dinero(valor) {
    return Number(valor || 0).toLocaleString(
        'es-GT',
        {
            style: 'currency',
            currency: 'GTQ'
        }
    );
}

function escapeHTML(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatearFechaHora(fecha) {

    if (!fecha) {
        return '';
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
        return fecha;
    }

    return fechaObj.toLocaleString(
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

    const ahora = new Date();

    const year =
        ahora.getFullYear();

    const month =
        String(
            ahora.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            ahora.getDate()
        ).padStart(2, '0');

    const hours =
        String(
            ahora.getHours()
        ).padStart(2, '0');

    const minutes =
        String(
            ahora.getMinutes()
        ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/* =========================================================
   STORAGE
========================================================= */

function cargarPedidos() {

    try {

        const datos =
            localStorage.getItem(
                STORAGE_PEDIDOS
            );

        return datos
            ? JSON.parse(datos)
            : [];

    } catch (error) {

        console.error(
            'Error cargando pedidos:',
            error
        );

        return [];
    }
}

function guardarPedidos(pedidos) {

    localStorage.setItem(
        STORAGE_PEDIDOS,
        JSON.stringify(pedidos)
    );
}

function cargarClientes() {

    try {

        const datos =
            localStorage.getItem(
                STORAGE_CLIENTES
            );

        return datos
            ? JSON.parse(datos)
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
   ESTADOS
========================================================= */

function normalizarEstado(estado) {

    if (!estado) {
        return 'pedido_recibido';
    }

    return MAPA_ESTADOS_ANTIGUOS[estado] ||
        estado;
}

function obtenerEstado(estado) {

    const normalizado =
        normalizarEstado(estado);

    return ESTADOS_PEDIDO.find(
        item =>
            item.id === normalizado
    );
}

function textoEstado(estado) {

    const normalizado =
        normalizarEstado(estado);

    if (normalizado === 'cancelado') {
        return 'Cancelado';
    }

    const encontrado =
        obtenerEstado(normalizado);

    return encontrado
        ? encontrado.nombre
        : 'Pedido recibido';
}

function iconoEstado(estado) {

    const encontrado =
        obtenerEstado(estado);

    return encontrado
        ? encontrado.icono
        : '📦';
}

function prepararHistorial(pedido) {

    if (!Array.isArray(
        pedido.historialEstados
    )) {
        pedido.historialEstados = [];
    }

    pedido.estado =
        normalizarEstado(
            pedido.estado
        );

    if (
        pedido.historialEstados.length === 0
    ) {

        pedido.historialEstados.push({
            estado: pedido.estado,
            fecha:
                pedido.actualizado ||
                pedido.fecha ||
                new Date().toISOString()
        });
    }

    pedido.historialEstados =
        pedido.historialEstados.map(
            item => ({
                estado:
                    normalizarEstado(
                        item.estado
                    ),
                fecha:
                    item.fecha ||
                    new Date().toISOString()
            })
        );

    return pedido;
}

function migrarPedidos() {

    const pedidos =
        cargarPedidos();

    if (!pedidos.length) {
        return;
    }

    let cambios = false;

    pedidos.forEach(pedido => {

        const estadoAntes =
            pedido.estado;

        const teniaHistorial =
            Array.isArray(
                pedido.historialEstados
            );

        prepararHistorial(pedido);

        if (
            estadoAntes !==
            pedido.estado ||
            !teniaHistorial
        ) {
            cambios = true;
        }
    });

    if (cambios) {
        guardarPedidos(pedidos);
    }
}

/* =========================================================
   CLIENTES
========================================================= */

function cargarClientesEnSelect() {

    const select =
        $('pedidoCliente');

    if (!select) {
        return;
    }

    const clientes =
        cargarClientes();

    select.innerHTML =
        '<option value="">Seleccione un cliente</option>';

    clientes.forEach(cliente => {

        const option =
            document.createElement(
                'option'
            );

        option.value =
            cliente.id;

        option.textContent =
            cliente.nombre ||
            'Cliente';

        select.appendChild(option);
    });
}

/* =========================================================
   IDS
========================================================= */

function generarId() {

    return Date.now().toString() +
        Math.floor(
            Math.random() * 10000
        ).toString();
}

function generarNumeroPedido(
    pedidos
) {

    let mayor = 0;

    pedidos.forEach(pedido => {

        const numero =
            String(
                pedido.numero || ''
            );

        const coincidencia =
            numero.match(/\d+/);

        if (coincidencia) {

            mayor =
                Math.max(
                    mayor,
                    Number(
                        coincidencia[0]
                    )
                );
        }
    });

    return `CHQ-${String(
        mayor + 1
    ).padStart(4, '0')}`;
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

    if (!toast) {
        return;
    }

    toast.textContent =
        mensaje;

    toast.className =
        `toast mostrar ${tipo}`;

    setTimeout(() => {

        toast.classList.remove(
            'mostrar'
        );

    }, 3000);
}

/* =========================================================
   PANEL PEDIDO
========================================================= */

function abrirPanelPedido(
    pedido = null
) {

    const panel =
        $('pedidoPanel');

    if (!panel) {
        return;
    }

    const form =
        $('pedidoForm');

    if (form) {
        form.reset();
    }

    $('pedidoId').value =
        '';

    $('productosPedido').innerHTML =
        '';

    if (!pedido) {

        $('panelTitulo').textContent =
            'Nuevo pedido';

        $('pedidoNumero').value =
            generarNumeroPedido(
                cargarPedidos()
            );

        $('pedidoFecha').value =
            fechaActualInput();

        $('pedidoOrigen').value =
            'Tienda';

        $('pedidoEstado').value =
            'pedido_recibido';

        agregarFilaProducto();

    } else {

        pedido =
            prepararHistorial(
                pedido
            );

        $('panelTitulo').textContent =
            'Editar pedido';

        $('pedidoId').value =
            pedido.id || '';

        $('pedidoNumero').value =
            pedido.numero || '';

        $('pedidoFecha').value =
            convertirFechaInput(
                pedido.fecha
            );

        $('pedidoCliente').value =
            pedido.clienteId || '';

        $('pedidoOrigen').value =
            pedido.origen || 'Tienda';

        $('pedidoEstado').value =
            pedido.estado ||
            'pedido_recibido';

        $('pedidoDireccion').value =
            pedido.direccion || '';

        $('pedidoNotas').value =
            pedido.notas || '';

        if (
            Array.isArray(
                pedido.productos
            ) &&
            pedido.productos.length
        ) {

            pedido.productos.forEach(
                producto =>
                    agregarFilaProducto(
                        producto
                    )
            );

        } else {

            agregarFilaProducto();
        }
    }

    actualizarTotalesFormulario();

    panel.classList.add(
        'mostrar'
    );
}

function cerrarPanelPedido() {

    $('pedidoPanel')
        ?.classList.remove(
            'mostrar'
        );
}

function convertirFechaInput(
    fecha
) {

    if (!fecha) {
        return fechaActualInput();
    }

    const obj =
        new Date(fecha);

    if (
        Number.isNaN(
            obj.getTime()
        )
    ) {
        return fechaActualInput();
    }

    const year =
        obj.getFullYear();

    const month =
        String(
            obj.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            obj.getDate()
        ).padStart(2, '0');

    const hours =
        String(
            obj.getHours()
        ).padStart(2, '0');

    const minutes =
        String(
            obj.getMinutes()
        ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/* =========================================================
   PRODUCTOS DEL FORMULARIO
========================================================= */

function agregarFilaProducto(
    producto = null
) {

    const contenedor =
        $('productosPedido');

    if (!contenedor) {
        return;
    }

    const fila =
        document.createElement(
            'div'
        );

    fila.className =
        'producto-pedido-row';

    const select =
        document.createElement(
            'select'
        );

    select.className =
        'producto-select';

    select.innerHTML =
        '<option value="">Producto</option>';

    productos.forEach(item => {

        const option =
            document.createElement(
                'option'
            );

        option.value =
            item.id;

        option.textContent =
            item.nombre;

        if (
            producto &&
            String(item.id) ===
            String(producto.id)
        ) {
            option.selected = true;
        }

        select.appendChild(
            option
        );
    });

    const cantidad =
        document.createElement(
            'input'
        );

    cantidad.type =
        'number';

    cantidad.min =
        '1';

    cantidad.value =
        producto?.cantidad || 1;

    cantidad.className =
        'producto-cantidad';

    const precio =
        document.createElement(
            'input'
        );

    precio.type =
        'number';

    precio.min =
        '0';

    precio.step =
        '0.01';

    precio.value =
        producto?.precio || 0;

    precio.className =
        'producto-precio';

    const quitar =
        document.createElement(
            'button'
        );

    quitar.type =
        'button';

    quitar.className =
        'btn-quitar-producto';

    quitar.textContent =
        '×';

    quitar.addEventListener(
        'click',
        () => {

            fila.remove();

            actualizarTotalesFormulario();
        }
    );

    select.addEventListener(
        'change',
        () => {

            const productoSeleccionado =
                productos.find(
                    item =>
                        String(item.id) ===
                        String(select.value)
                );

            if (
                productoSeleccionado
            ) {

                precio.value =
                    productoSeleccionado.precio;
            }

            actualizarTotalesFormulario();
        }
    );

    cantidad.addEventListener(
        'input',
        actualizarTotalesFormulario
    );

    precio.addEventListener(
        'input',
        actualizarTotalesFormulario
    );

    fila.appendChild(select);
    fila.appendChild(cantidad);
    fila.appendChild(precio);
    fila.appendChild(quitar);

    contenedor.appendChild(
        fila
    );

    actualizarTotalesFormulario();
}

/* =========================================================
   TOTALES
========================================================= */

function obtenerProductosFormulario() {

    const filas =
        document.querySelectorAll(
            '#productosPedido .producto-pedido-row'
        );

    const resultado = [];

    filas.forEach(fila => {

        const select =
            fila.querySelector(
                '.producto-select'
            );

        const cantidad =
            fila.querySelector(
                '.producto-cantidad'
            );

        const precio =
            fila.querySelector(
                '.producto-precio'
            );

        const productoId =
            select?.value;

        if (!productoId) {
            return;
        }

        const productoBase =
            productos.find(
                item =>
                    String(item.id) ===
                    String(productoId)
            );

        const cantidadNumero =
            Math.max(
                1,
                Number(
                    cantidad?.value || 1
                )
            );

        const precioNumero =
            Math.max(
                0,
                Number(
                    precio?.value ||
                    productoBase?.precio ||
                    0
                )
            );

        resultado.push({
            id: productoId,
            nombre:
                productoBase?.nombre ||
                'Producto',
            precio:
                precioNumero,
            cantidad:
                cantidadNumero,
            subtotal:
                precioNumero *
                cantidadNumero
        });
    });

    return resultado;
}

function obtenerDescuentoCliente(
    clienteId
) {

    const cliente =
        cargarClientes().find(
            item =>
                String(item.id) ===
                String(clienteId)
        );

    if (!cliente) {
        return 0;
    }

    return Number(
        cliente.descuento || 0
    );
}

function actualizarTotalesFormulario() {

    const productosFormulario =
        obtenerProductosFormulario();

    const subtotal =
        productosFormulario.reduce(
            (total, producto) =>
                total +
                producto.subtotal,
            0
        );

    const porcentaje =
        obtenerDescuentoCliente(
            $('pedidoCliente')?.value
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
}

/* =========================================================
   GUARDAR PEDIDO
========================================================= */

function guardarPedido(
    evento
) {

    evento.preventDefault();

    const pedidos =
        cargarPedidos();

    const id =
        $('pedidoId').value ||
        generarId();

    const clienteId =
        $('pedidoCliente').value;

    if (!clienteId) {

        mostrarToast(
            'Seleccione un cliente.',
            'error'
        );

        return;
    }

    const cliente =
        cargarClientes().find(
            item =>
                String(item.id) ===
                String(clienteId)
        );

    const productosPedido =
        obtenerProductosFormulario();

    if (!productosPedido.length) {

        mostrarToast(
            'Agregue al menos un producto.',
            'error'
        );

        return;
    }

    const subtotal =
        productosPedido.reduce(
            (total, producto) =>
                total +
                producto.subtotal,
            0
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

    const pedidoExistente =
        pedidos.find(
            pedido =>
                String(pedido.id) ===
                String(id)
        );

    const estadoNuevo =
        normalizarEstado(
            $('pedidoEstado').value ||
            'pedido_recibido'
        );

    const ahora =
        new Date().toISOString();

    let historialEstados = [];

    if (pedidoExistente) {

        prepararHistorial(
            pedidoExistente
        );

        historialEstados = [
            ...pedidoExistente.historialEstados
        ];

        const estadoAnterior =
            normalizarEstado(
                pedidoExistente.estado
            );

        if (
            estadoAnterior !==
            estadoNuevo
        ) {

            historialEstados.push({
                estado: estadoNuevo,
                fecha: ahora
            });
        }

    } else {

        historialEstados = [
            {
                estado: estadoNuevo,
                fecha: ahora
            }
        ];
    }

    const datos = {

        id,

        numero:
            $('pedidoNumero').value.trim() ||
            generarNumeroPedido(
                pedidos
            ),

        fecha:
            $('pedidoFecha').value,

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
            estadoNuevo,

        historialEstados,

        productos:
            productosPedido,

        subtotal,

        descuento,

        total,

        direccion:
            $('pedidoDireccion').value.trim(),

        notas:
            $('pedidoNotas').value.trim(),

        actualizado:
            ahora
    };

    const indice =
        pedidos.findIndex(
            pedido =>
                String(pedido.id) ===
                String(id)
        );

    if (indice >= 0) {

        pedidos[indice] =
            datos;

    } else {

        pedidos.push(
            datos
        );
    }

    guardarPedidos(
        pedidos
    );

    cerrarPanelPedido();

    mostrarPedidos();

    actualizarEstadisticasPedidos();

    mostrarToast(
        pedidoExistente
            ? 'Pedido actualizado correctamente.'
            : 'Pedido registrado correctamente.'
    );
}

/* =========================================================
   FILTROS
========================================================= */

function obtenerPedidosFiltrados() {

    const pedidos =
        cargarPedidos();

    const busqueda =
        (
            $('searchPedidos')?.value ||
            ''
        )
        .trim()
        .toLowerCase();

    const estado =
        $('filtroEstado')?.value ||
        '';

    return pedidos
        .map(pedido =>
            prepararHistorial(pedido)
        )
        .filter(pedido => {

            const coincideBusqueda =
                !busqueda ||
                String(
                    pedido.numero || ''
                )
                .toLowerCase()
                .includes(busqueda) ||
                String(
                    pedido.clienteNombre || ''
                )
                .toLowerCase()
                .includes(busqueda) ||
                String(
                    pedido.clienteTelefono || ''
                )
                .toLowerCase()
                .includes(busqueda);

            const coincideEstado =
                !estado ||
                normalizarEstado(
                    pedido.estado
                ) === estado;

            return (
                coincideBusqueda &&
                coincideEstado
            );
        })
        .sort(
            (a, b) =>
                new Date(
                    b.fecha || 0
                ) -
                new Date(
                    a.fecha || 0
                )
        );
}

/* =========================================================
   MOSTRAR PEDIDOS
========================================================= */

function mostrarPedidos() {

    const tbody =
        $('tablaPedidos');

    const vacio =
        $('estadoVacio');

    if (!tbody) {
        return;
    }

    const pedidos =
        obtenerPedidosFiltrados();

    tbody.innerHTML =
        '';

    if (!pedidos.length) {

        if (vacio) {
            vacio.style.display =
                'block';
        }

        return;
    }

    if (vacio) {
        vacio.style.display =
            'none';
    }

    pedidos.forEach(pedido => {

        const tr =
            document.createElement(
                'tr'
            );

        const estado =
            normalizarEstado(
                pedido.estado
            );

        tr.innerHTML = `

            <td>
                <span class="pedido-numero">
                    ${escapeHTML(
                        pedido.numero ||
                        pedido.id
                    )}
                </span>
            </td>

            <td>
                <span class="cliente-nombre">
                    ${escapeHTML(
                        pedido.clienteNombre ||
                        'Cliente'
                    )}
                </span>
            </td>

            <td>
                <span class="fecha-pedido">
                    ${formatearFechaHora(
                        pedido.fecha
                    )}
                </span>
            </td>

            <td>
                ${escapeHTML(
                    pedido.origen ||
                    'Tienda'
                )}
            </td>

            <td>
                <span class="status-badge ${escapeHTML(estado)}">
                    ${iconoEstado(estado)}
                    &nbsp;
                    ${escapeHTML(
                        textoEstado(estado)
                    )}
                </span>
            </td>

            <td>
                <span class="total-pedido">
                    ${dinero(
                        pedido.total
                    )}
                </span>
            </td>

            <td>

                <div class="acciones">

                    <button
                        type="button"
                        class="btn-accion"
                        title="Ver detalle"
                        onclick="mostrarDetallePedido('${escapeHTML(String(pedido.id))}')">
                        👁️
                    </button>

                    <button
                        type="button"
                        class="btn-accion"
                        title="Editar"
                        onclick="editarPedido('${escapeHTML(String(pedido.id))}')">
                        ✏️
                    </button>

                    <button
                        type="button"
                        class="btn-accion whatsapp"
                        title="WhatsApp"
                        onclick="abrirWhatsAppPedido('${escapeHTML(String(pedido.id))}')">
                        💬
                    </button>

                    <button
                        type="button"
                        class="btn-accion eliminar"
                        title="Eliminar"
                        onclick="eliminarPedido('${escapeHTML(String(pedido.id))}')">
                        🗑️
                    </button>

                </div>

            </td>
        `;

        tbody.appendChild(tr);
    });
}

/* =========================================================
   ESTADÍSTICAS
========================================================= */

function actualizarEstadisticasPedidos() {

    const pedidos =
        cargarPedidos()
            .map(pedido =>
                prepararHistorial(pedido)
            );

    const total =
        pedidos.length;

    const pendientes =
        pedidos.filter(
            pedido =>
                pedido.estado !==
                'entregado' &&
                pedido.estado !==
                'cancelado'
        ).length;

    const entregados =
        pedidos.filter(
            pedido =>
                pedido.estado ===
                'entregado'
        ).length;

    const ventas =
        pedidos
            .filter(
                pedido =>
                    pedido.estado !==
                    'cancelado'
            )
            .reduce(
                (total, pedido) =>
                    total +
                    Number(
                        pedido.total || 0
                    ),
                0
            );

    if ($('totalPedidos')) {
        $('totalPedidos').textContent =
            total;
    }

    if ($('pedidosPendientes')) {
        $('pedidosPendientes').textContent =
            pendientes;
    }

    if ($('pedidosEntregados')) {
        $('pedidosEntregados').textContent =
            entregados;
    }

    if ($('ventasPedidos')) {
        $('ventasPedidos').textContent =
            dinero(ventas);
    }
}

/* =========================================================
   EDITAR
========================================================= */

function editarPedido(id) {

    const pedido =
        cargarPedidos().find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!pedido) {

        mostrarToast(
            'No se encontró el pedido.',
            'error'
        );

        return;
    }

    abrirPanelPedido(
        pedido
    );
}

/* =========================================================
   ELIMINAR
========================================================= */

function eliminarPedido(id) {

    const pedido =
        cargarPedidos().find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!pedido) {
        return;
    }

    const confirmar =
        confirm(
            `¿Desea eliminar el pedido ${pedido.numero || ''}?`
        );

    if (!confirmar) {
        return;
    }

    const pedidos =
        cargarPedidos().filter(
            item =>
                String(item.id) !==
                String(id)
        );

    guardarPedidos(
        pedidos
    );

    mostrarPedidos();

    actualizarEstadisticasPedidos();

    mostrarToast(
        'Pedido eliminado correctamente.'
    );
}

/* =========================================================
   WHATSAPP
========================================================= */

function abrirWhatsAppPedido(id) {

    const pedido =
        cargarPedidos().find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!pedido) {
        return;
    }

    if (!pedido.clienteTelefono) {

        mostrarToast(
            'El cliente no tiene teléfono registrado.',
            'error'
        );

        return;
    }

    const telefono =
        String(
            pedido.clienteTelefono
        )
        .replace(/\D/g, '');

    const mensaje =
        `Hola ${pedido.clienteNombre || ''}. ` +
        `Su pedido ${pedido.numero || ''} ` +
        `se encuentra en estado: ` +
        `${textoEstado(pedido.estado)}. ` +
        `Total: ${dinero(pedido.total)}.`;

    const url =
        `https://wa.me/${telefono}?text=` +
        encodeURIComponent(mensaje);

    window.open(
        url,
        '_blank'
    );
}

/* =========================================================
   DETALLE DEL PEDIDO
========================================================= */

function mostrarDetallePedido(id) {

    const pedido =
        cargarPedidos().find(
            item =>
                String(item.id) ===
                String(id)
        );

    const dialog =
        $('dialogPedidoDetalle');

    const contenido =
        $('detallePedidoContenido');

    if (!pedido || !dialog || !contenido) {
        return;
    }

    prepararHistorial(
        pedido
    );

    const historial =
        [...pedido.historialEstados]
            .sort(
                (a, b) =>
                    new Date(a.fecha) -
                    new Date(b.fecha)
            );

    const productosHTML =
        (pedido.productos || [])
            .map(
                producto => `
                    <div class="detalle-producto">

                        <span>
                            ${escapeHTML(
                                producto.cantidad
                            )}
                            ×
                            ${escapeHTML(
                                producto.nombre
                            )}
                        </span>

                        <strong>
                            ${dinero(
                                producto.subtotal ||
                                (
                                    Number(
                                        producto.precio || 0
                                    ) *
                                    Number(
                                        producto.cantidad || 0
                                    )
                                )
                            )}
                        </strong>

                    </div>
                `
            )
            .join('');

    const historialHTML =
        historial.length
            ? historial.map(
                item => `
                    <div class="detalle-timeline-item">

                        <div class="detalle-timeline-icono">
                            ${iconoEstado(
                                item.estado
                            )}
                        </div>

                        <div class="detalle-timeline-info">

                            <strong>
                                ${escapeHTML(
                                    textoEstado(
                                        item.estado
                                    )
                                )}
                            </strong>

                            <small>
                                ${formatearFechaHora(
                                    item.fecha
                                )}
                            </small>

                        </div>

                    </div>
                `
            ).join('')
            : `
                <p class="detalle-nota">
                    No hay historial de estados.
                </p>
            `;

    contenido.innerHTML = `

        <div class="detalle-grid">

            <div class="detalle-item">
                <span>Pedido</span>
                <strong>
                    ${escapeHTML(
                        pedido.numero ||
                        pedido.id
                    )}
                </strong>
            </div>

            <div class="detalle-item">
                <span>Cliente</span>
                <strong>
                    ${escapeHTML(
                        pedido.clienteNombre ||
                        'Cliente'
                    )}
                </strong>
            </div>

            <div class="detalle-item">
                <span>Teléfono</span>
                <strong>
                    ${escapeHTML(
                        pedido.clienteTelefono ||
                        'No registrado'
                    )}
                </strong>
            </div>

            <div class="detalle-item">
                <span>Fecha</span>
                <strong>
                    ${formatearFechaHora(
                        pedido.fecha
                    )}
                </strong>
            </div>

            <div class="detalle-item">
                <span>Origen</span>
                <strong>
                    ${escapeHTML(
                        pedido.origen ||
                        'Tienda'
                    )}
                </strong>
            </div>

            <div class="detalle-item">
                <span>Estado actual</span>
                <strong>
                    ${iconoEstado(
                        pedido.estado
                    )}
                    ${escapeHTML(
                        textoEstado(
                            pedido.estado
                        )
                    )}
                </strong>
            </div>

        </div>

        <div class="detalle-seccion">

            <h3>
                Seguimiento del pedido
            </h3>

            <div class="detalle-timeline">
                ${historialHTML}
            </div>

        </div>

        <div class="detalle-seccion">

            <h3>
                Productos
            </h3>

            <div class="detalle-productos">
                ${
                    productosHTML ||
                    '<p class="detalle-nota">No hay productos registrados.</p>'
                }
            </div>

        </div>

        <div class="detalle-seccion">

            <h3>
                Resumen
            </h3>

            <div class="totales">

                <div>
                    <span>Subtotal</span>
                    <strong>
                        ${dinero(
                            pedido.subtotal
                        )}
                    </strong>
                </div>

                <div>
                    <span>Descuento</span>
                    <strong>
                        ${dinero(
                            pedido.descuento
                        )}
                    </strong>
                </div>

                <div class="total-final">
                    <span>Total</span>
                    <strong>
                        ${dinero(
                            pedido.total
                        )}
                    </strong>
                </div>

            </div>

        </div>

        <div class="detalle-seccion">

            <h3>
                Dirección de entrega
            </h3>

            <div class="detalle-nota">
                ${
                    escapeHTML(
                        pedido.direccion ||
                        'No registrada'
                    )
                }
            </div>

        </div>

        <div class="detalle-seccion">

            <h3>
                Notas
            </h3>

            <div class="detalle-nota">
                ${
                    escapeHTML(
                        pedido.notas ||
                        'Sin notas'
                    )
                }
            </div>

        </div>

    `;

    if (
        typeof dialog.showModal ===
        'function'
    ) {
        dialog.showModal();
    } else {
        dialog.setAttribute(
            'open',
            ''
        );
    }
}

/* =========================================================
   CERRAR DETALLE
========================================================= */

function cerrarDetallePedido() {

    const dialog =
        $('dialogPedidoDetalle');

    if (!dialog) {
        return;
    }

    if (
        typeof dialog.close ===
        'function'
    ) {
        dialog.close();
    } else {
        dialog.removeAttribute(
            'open'
        );
    }
}

/* =========================================================
   TEMA
========================================================= */

function inicializarTema() {

    const tema =
        localStorage.getItem(
            STORAGE_TEMA
        );

    if (tema === 'oscuro') {
        document.body.classList.add(
            'dark'
        );
    } else {
        document.body.classList.remove(
            'dark'
        );
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
            ? 'oscuro'
            : 'claro'
    );
}

/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        inicializarTema();

        migrarPedidos();

        cargarClientesEnSelect();

        mostrarPedidos();

        actualizarEstadisticasPedidos();

        const btnNuevoPedido =
            $('btnNuevoPedido');

        if (btnNuevoPedido) {

            btnNuevoPedido.addEventListener(
                'click',
                () =>
                    abrirPanelPedido()
            );
        }

        const cerrarPanel =
            $('cerrarPedidoPanel');

        if (cerrarPanel) {

            cerrarPanel.addEventListener(
                'click',
                cerrarPanelPedido
            );
        }

        const cancelarPedido =
            $('cancelarPedido');

        if (cancelarPedido) {

            cancelarPedido.addEventListener(
                'click',
                cerrarPanelPedido
            );
        }

        const formulario =
            $('pedidoForm');

        if (formulario) {

            formulario.addEventListener(
                'submit',
                guardarPedido
            );
        }

        const agregarProducto =
            $('btnAgregarProducto');

        if (agregarProducto) {

            agregarProducto.addEventListener(
                'click',
                () =>
                    agregarFilaProducto()
            );
        }

        const cliente =
            $('pedidoCliente');

        if (cliente) {

            cliente.addEventListener(
                'change',
                actualizarTotalesFormulario
            );
        }

        const search =
            $('searchPedidos');

        if (search) {

            search.addEventListener(
                'input',
                mostrarPedidos
            );
        }

        const filtro =
            $('filtroEstado');

        if (filtro) {

            filtro.addEventListener(
                'change',
                mostrarPedidos
            );
        }

        const btnTema =
            $('btnTema');

        if (btnTema) {

            btnTema.addEventListener(
                'click',
                cambiarTema
            );
        }

        const cerrarDetalle =
            $('cerrarDetallePedido');

        if (cerrarDetalle) {

            cerrarDetalle.addEventListener(
                'click',
                cerrarDetallePedido
            );
        }

        const dialog =
            $('dialogPedidoDetalle');

        if (dialog) {

            dialog.addEventListener(
                'click',
                evento => {

                    const rect =
                        dialog.getBoundingClientRect();

                    const dentro =
                        evento.clientX >=
                        rect.left &&
                        evento.clientX <=
                        rect.right &&
                        evento.clientY >=
                        rect.top &&
                        evento.clientY <=
                        rect.bottom;

                    if (!dentro) {
                        cerrarDetallePedido();
                    }
                }
            );
        }

        document.addEventListener(
            'keydown',
            evento => {

                if (
                    evento.key ===
                    'Escape'
                ) {

                    cerrarPanelPedido();
                }
            }
        );

        window.addEventListener(
            'storage',
            evento => {

                if (
                    evento.key ===
                    STORAGE_PEDIDOS
                ) {

                    migrarPedidos();

                    mostrarPedidos();

                    actualizarEstadisticasPedidos();
                }

                if (
                    evento.key ===
                    STORAGE_CLIENTES
                ) {

                    cargarClientesEnSelect();

                    actualizarTotalesFormulario();
                }

                if (
                    evento.key ===
                    STORAGE_TEMA
                ) {

                    inicializarTema();
                }
            }
        );
    }
);

/* =========================================================
   FUNCIONES GLOBALES
========================================================= */

window.abrirPanelPedido =
    abrirPanelPedido;

window.editarPedido =
    editarPedido;

window.eliminarPedido =
    eliminarPedido;

window.mostrarDetallePedido =
    mostrarDetallePedido;

window.abrirWhatsAppPedido =
    abrirWhatsAppPedido;

window.cerrarDetallePedido =
    cerrarDetallePedido;