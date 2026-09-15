/* =========================================================
   TIENDA - VARIEDADES CHIQUIS
   Seguimiento completo de pedidos
   ========================================================= */

'use strict';

const STORAGE_CLIENTES = 'clientesChiquis';
const STORAGE_PEDIDOS = 'pedidosChiquis';
const STORAGE_TEMA = 'temaChiquis';

/* =========================================================
   ESTADOS DEL CICLO DEL PEDIDO
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
        categoria: 'Tecnología',
        precio: 5500,
        imagen: 'img/laptop.jpg',
        descripcion: 'Laptop para trabajo, estudio y entretenimiento.'
    },
    {
        id: 2,
        nombre: 'Monitor',
        categoria: 'Tecnología',
        precio: 1800,
        imagen: 'img/monitor.jpg',
        descripcion: 'Monitor ideal para oficina, estudio y gaming.'
    },
    {
        id: 3,
        nombre: 'Teclado',
        categoria: 'Tecnología',
        precio: 450,
        imagen: 'img/teclado.jpg',
        descripcion: 'Teclado cómodo para trabajo y estudio.'
    },
    {
        id: 4,
        nombre: 'Mouse',
        categoria: 'Tecnología',
        precio: 250,
        imagen: 'img/raton.jpg',
        descripcion: 'Mouse ergonómico para uso diario.'
    },
    {
        id: 5,
        nombre: 'Impresora',
        categoria: 'Tecnología',
        precio: 1200,
        imagen: 'img/impresora.jpg',
        descripcion: 'Impresora para documentos y trabajos.'
    },
    {
        id: 6,
        nombre: 'Audífonos',
        categoria: 'Audio',
        precio: 1000,
        imagen: 'img/audifonos.jpg',
        descripcion: 'Audífonos de excelente calidad de sonido.'
    },
    {
        id: 7,
        nombre: 'Bocinas',
        categoria: 'Audio',
        precio: 2000,
        imagen: 'img/bocinas.jpg',
        descripcion: 'Bocinas para disfrutar música y entretenimiento.'
    },
    {
        id: 8,
        nombre: 'Silla Gamer',
        categoria: 'Muebles',
        precio: 1000,
        imagen: 'img/silla.jpg',
        descripcion: 'Silla cómoda para largas jornadas.'
    },
    {
        id: 9,
        nombre: 'SSD',
        categoria: 'Tecnología',
        precio: 750,
        imagen: 'img/disco.jpg',
        descripcion: 'Unidad SSD para mejorar el rendimiento del equipo.'
    }
];

/* =========================================================
   VARIABLES
========================================================= */

let carrito = [];
let categoriaActual = 'Todos';

/* =========================================================
   FUNCIONES GENERALES
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function dinero(valor) {
    return Number(valor || 0).toLocaleString('es-GT', {
        style: 'currency',
        currency: 'GTQ'
    });
}

function mostrarToast(mensaje, tipo = 'success') {
    const toast = $('toast');

    if (!toast) return;

    toast.textContent = mensaje;
    toast.className = 'toast mostrar ' + tipo;

    setTimeout(() => {
        toast.classList.remove('mostrar');
    }, 3000);
}

/* =========================================================
   LOCAL STORAGE
========================================================= */

function cargarClientes() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_CLIENTES)
        ) || [];
    } catch (error) {
        console.error('Error cargando clientes:', error);
        return [];
    }
}

function cargarPedidos() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_PEDIDOS)
        ) || [];
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        return [];
    }
}

function guardarPedidos(pedidos) {
    localStorage.setItem(
        STORAGE_PEDIDOS,
        JSON.stringify(pedidos)
    );
}

/* =========================================================
   ESTADOS
========================================================= */

function obtenerEstadoPedido(idEstado) {
    return ESTADOS_PEDIDO.find(
        estado => estado.id === idEstado
    );
}

function normalizarEstadoPedido(estado) {
    if (!estado) {
        return 'pedido_recibido';
    }

    return MAPA_ESTADOS_ANTIGUOS[estado] || estado;
}

function nombreEstadoPedido(estado) {
    estado = normalizarEstadoPedido(estado);

    const encontrado = obtenerEstadoPedido(estado);

    if (encontrado) {
        return encontrado.nombre;
    }

    if (estado === 'cancelado') {
        return 'Cancelado';
    }

    return 'Pedido recibido';
}

function indiceEstadoPedido(estado) {
    estado = normalizarEstadoPedido(estado);

    return ESTADOS_PEDIDO.findIndex(
        item => item.id === estado
    );
}

function prepararHistorialPedido(pedido) {
    if (!Array.isArray(pedido.historialEstados)) {
        pedido.historialEstados = [];
    }

    if (pedido.historialEstados.length === 0) {
        const estadoActual = normalizarEstadoPedido(
            pedido.estado
        );

        pedido.historialEstados.push({
            estado: estadoActual,
            fecha: pedido.actualizado || pedido.fecha || new Date().toISOString()
        });
    }

    pedido.historialEstados = pedido.historialEstados.map(item => ({
        estado: normalizarEstadoPedido(item.estado),
        fecha: item.fecha || new Date().toISOString()
    }));

    pedido.estado = normalizarEstadoPedido(pedido.estado);

    return pedido;
}

function migrarPedidosSeguimiento() {
    const pedidos = cargarPedidos();

    if (!pedidos.length) {
        return;
    }

    let cambios = false;

    pedidos.forEach(pedido => {
        const estadoAnterior = pedido.estado;

        prepararHistorialPedido(pedido);

        if (estadoAnterior !== pedido.estado) {
            cambios = true;
        }
    });

    if (cambios) {
        guardarPedidos(pedidos);
    }
}

/* =========================================================
   FECHAS
========================================================= */

function formatearFechaSeguimiento(fecha) {
    if (!fecha) {
        return '';
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
        return fecha;
    }

    return fechaObj.toLocaleString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/* =========================================================
   CLIENTES
========================================================= */

function cargarClientesTienda() {
    const select = $('clienteTienda');

    if (!select) {
        return;
    }

    const clientes = cargarClientes();

    const valorAnterior = select.value;

    select.innerHTML =
        '<option value="">Seleccione un cliente</option>';

    clientes.forEach(cliente => {
        const option = document.createElement('option');

        option.value = cliente.id;
        option.textContent =
            cliente.nombre || 'Cliente sin nombre';

        select.appendChild(option);
    });

    if (
        valorAnterior &&
        clientes.some(cliente => String(cliente.id) === String(valorAnterior))
    ) {
        select.value = valorAnterior;
    }

    mostrarInfoCliente();
}

function mostrarInfoCliente() {
    const select = $('clienteTienda');
    const info = $('clienteInfo');

    if (!select || !info) {
        return;
    }

    const clienteId = select.value;

    if (!clienteId) {
        info.innerHTML = '';
        renderizarSeguimientoPedidos('');
        return;
    }

    const clientes = cargarClientes();

    const cliente = clientes.find(
        item => String(item.id) === String(clienteId)
    );

    if (!cliente) {
        info.innerHTML = '';
        renderizarSeguimientoPedidos(clienteId);
        return;
    }

    info.innerHTML = `
        <div class="cliente-info-card">
            <div>
                <strong>${escapeHTML(cliente.nombre || 'Cliente')}</strong>
            </div>

            ${
                cliente.telefono
                    ? `<span>📱 ${escapeHTML(cliente.telefono)}</span>`
                    : ''
            }

            ${
                cliente.email
                    ? `<span>✉️ ${escapeHTML(cliente.email)}</span>`
                    : ''
            }

            ${
                cliente.direccion
                    ? `<span>📍 ${escapeHTML(cliente.direccion)}</span>`
                    : ''
            }
        </div>
    `;

    renderizarSeguimientoPedidos(clienteId);
}

/* =========================================================
   SEGUIMIENTO DE PEDIDOS DEL CLIENTE
========================================================= */

function crearSeccionSeguimiento() {
    let seccion = document.getElementById(
        'seguimientoPedidos'
    );

    if (seccion) {
        return seccion;
    }

    const clienteSection =
        document.querySelector('.cliente-section');

    if (!clienteSection) {
        return null;
    }

    seccion = document.createElement('section');

    seccion.id = 'seguimientoPedidos';
    seccion.className = 'seguimiento-section';

    seccion.innerHTML = `
        <div class="seguimiento-header">
            <div>
                <h2>📦 Seguimiento de pedidos</h2>
                <p>
                    Consulta el avance de tus pedidos durante todo
                    su ciclo de atención.
                </p>
            </div>
        </div>

        <div
            id="seguimientoLista"
            class="seguimiento-lista">
        </div>
    `;

    clienteSection.insertAdjacentElement(
        'afterend',
        seccion
    );

    return seccion;
}

function renderizarSeguimientoPedidos(clienteId) {
    const seccion = crearSeccionSeguimiento();

    if (!seccion) {
        return;
    }

    const lista = document.getElementById(
        'seguimientoLista'
    );

    if (!lista) {
        return;
    }

    if (!clienteId) {
        lista.innerHTML = `
            <div class="seguimiento-vacio">
                <span>📋</span>
                <p>
                    Selecciona un cliente para consultar
                    sus pedidos.
                </p>
            </div>
        `;

        return;
    }

    const pedidos = cargarPedidos()
        .filter(pedido =>
            String(pedido.clienteId) === String(clienteId)
        )
        .map(pedido => prepararHistorialPedido(pedido))
        .sort((a, b) => {
            const fechaA =
                new Date(a.fecha || 0).getTime();

            const fechaB =
                new Date(b.fecha || 0).getTime();

            return fechaB - fechaA;
        });

    if (!pedidos.length) {
        lista.innerHTML = `
            <div class="seguimiento-vacio">
                <span>📦</span>
                <p>
                    Este cliente todavía no tiene pedidos
                    registrados.
                </p>
            </div>
        `;

        return;
    }

    lista.innerHTML = pedidos.map(
        pedido => crearTarjetaSeguimiento(pedido)
    ).join('');
}

function crearTarjetaSeguimiento(pedido) {
    const estadoActual =
        normalizarEstadoPedido(pedido.estado);

    const indiceActual =
        indiceEstadoPedido(estadoActual);

    const historial =
        Array.isArray(pedido.historialEstados)
            ? pedido.historialEstados
            : [];

    const historialMapa = {};

    historial.forEach(item => {
        historialMapa[
            normalizarEstadoPedido(item.estado)
        ] = item.fecha;
    });

    const pasos = ESTADOS_PEDIDO.map(
        (estado, indice) => {

            let clase = 'pendiente';

            if (indice < indiceActual) {
                clase = 'completado';
            }

            if (indice === indiceActual) {
                clase = 'actual';
            }

            const fecha =
                historialMapa[estado.id] || '';

            return `
                <div class="seguimiento-paso ${clase}">
                    <div class="seguimiento-icono">
                        ${estado.icono}
                    </div>

                    <div class="seguimiento-paso-info">
                        <strong>
                            ${estado.nombre}
                        </strong>

                        ${
                            fecha
                                ? `<small>
                                    ${formatearFechaSeguimiento(fecha)}
                                   </small>`
                                : '<small>Pendiente</small>'
                        }
                    </div>
                </div>
            `;
        }
    ).join('');

    return `
        <article class="seguimiento-card">

            <div class="seguimiento-card-header">

                <div>
                    <span class="seguimiento-numero">
                        Pedido #${escapeHTML(
                            String(pedido.numero || pedido.id || '')
                        )}
                    </span>

                    <small>
                        Registrado:
                        ${formatearFechaSeguimiento(
                            pedido.fecha
                        )}
                    </small>
                </div>

                <span class="seguimiento-estado">
                    ${nombreEstadoPedido(estadoActual)}
                </span>

            </div>

            <div class="seguimiento-timeline">
                ${pasos}
            </div>

            ${
                pedido.direccion
                    ? `
                    <div class="seguimiento-dato">
                        📍
                        <strong>Dirección:</strong>
                        ${escapeHTML(pedido.direccion)}
                    </div>
                    `
                    : ''
            }

        </article>
    `;
}

/* =========================================================
   PRODUCTOS
========================================================= */

function renderizarProductos() {
    const catalogo = $('catalogo');

    if (!catalogo) {
        return;
    }

    const busqueda =
        ($('buscarProductos')?.value || '')
            .trim()
            .toLowerCase();

    let productosMostrar = productos.filter(producto => {

        const coincideCategoria =
            categoriaActual === 'Todos' ||
            producto.categoria === categoriaActual;

        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.descripcion.toLowerCase().includes(busqueda);

        return coincideCategoria && coincideBusqueda;
    });

    if (!productosMostrar.length) {
        catalogo.innerHTML = `
            <div class="sin-productos">
                <p>No se encontraron productos.</p>
            </div>
        `;

        return;
    }

    catalogo.innerHTML = productosMostrar.map(
        producto => `
            <article class="producto-card">

                <div class="producto-imagen">
                    <img
                        src="${producto.imagen}"
                        alt="${escapeHTML(producto.nombre)}"
                        onerror="this.style.display='none';"
                    >
                </div>

                <div class="producto-info">

                    <span class="producto-categoria">
                        ${escapeHTML(producto.categoria)}
                    </span>

                    <h3>
                        ${escapeHTML(producto.nombre)}
                    </h3>

                    <p>
                        ${escapeHTML(producto.descripcion)}
                    </p>

                    <div class="producto-footer">

                        <strong class="producto-precio">
                            ${dinero(producto.precio)}
                        </strong>

                        <button
                            type="button"
                            class="btn-agregar"
                            onclick="agregarAlCarrito(${producto.id})">
                            Agregar
                        </button>

                    </div>

                </div>

            </article>
        `
    ).join('');
}

/* =========================================================
   CARRITO
========================================================= */

function agregarAlCarrito(productoId) {
    const producto = productos.find(
        item => item.id === productoId
    );

    if (!producto) {
        return;
    }

    const existente = carrito.find(
        item => item.id === productoId
    );

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    renderizarCarrito();

    mostrarToast(
        `${producto.nombre} agregado al carrito`
    );
}

function cambiarCantidad(productoId, cantidad) {
    const producto = carrito.find(
        item => item.id === productoId
    );

    if (!producto) {
        return;
    }

    producto.cantidad += cantidad;

    if (producto.cantidad <= 0) {
        carrito = carrito.filter(
            item => item.id !== productoId
        );
    }

    renderizarCarrito();
}

function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(
        item => item.id !== productoId
    );

    renderizarCarrito();
}

function calcularSubtotal() {
    return carrito.reduce(
        (total, producto) =>
            total +
            Number(producto.precio) *
            Number(producto.cantidad),
        0
    );
}

function obtenerClienteSeleccionado() {
    const clienteId =
        $('clienteTienda')?.value;

    if (!clienteId) {
        return null;
    }

    return cargarClientes().find(
        cliente =>
            String(cliente.id) === String(clienteId)
    ) || null;
}

function calcularDescuento() {
    const cliente =
        obtenerClienteSeleccionado();

    if (!cliente) {
        return 0;
    }

    const subtotal =
        calcularSubtotal();

    const porcentaje =
        Number(cliente.descuento || 0);

    return subtotal * (porcentaje / 100);
}

function renderizarCarrito() {
    const contenido =
        $('carritoContenido');

    if (!contenido) {
        return;
    }

    if (!carrito.length) {
        contenido.innerHTML = `
            <div class="carrito-vacio">
                <span>🛒</span>
                <p>Tu carrito está vacío.</p>
            </div>
        `;
    } else {
        contenido.innerHTML =
            carrito.map(producto => `
                <div class="carrito-item">

                    <div class="carrito-item-imagen">
                        <img
                            src="${producto.imagen}"
                            alt="${escapeHTML(producto.nombre)}"
                            onerror="this.style.display='none';"
                        >
                    </div>

                    <div class="carrito-item-info">

                        <h4>
                            ${escapeHTML(producto.nombre)}
                        </h4>

                        <strong>
                            ${dinero(producto.precio)}
                        </strong>

                        <div class="cantidad-control">

                            <button
                                type="button"
                                onclick="cambiarCantidad(${producto.id}, -1)">
                                −
                            </button>

                            <span>
                                ${producto.cantidad}
                            </span>

                            <button
                                type="button"
                                onclick="cambiarCantidad(${producto.id}, 1)">
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        type="button"
                        class="btn-eliminar-carrito"
                        onclick="eliminarDelCarrito(${producto.id})">
                        ×
                    </button>

                </div>
            `).join('');
    }

    const subtotal =
        calcularSubtotal();

    const descuento =
        calcularDescuento();

    const total =
        Math.max(0, subtotal - descuento);

    if ($('subtotalCarrito')) {
        $('subtotalCarrito').textContent =
            dinero(subtotal);
    }

    if ($('descuentoCarrito')) {
        $('descuentoCarrito').textContent =
            dinero(descuento);
    }

    if ($('totalCarrito')) {
        $('totalCarrito').textContent =
            dinero(total);
    }

    if ($('contadorCarrito')) {
        const cantidad =
            carrito.reduce(
                (total, item) =>
                    total + item.cantidad,
                0
            );

        $('contadorCarrito').textContent =
            cantidad;
    }
}

/* =========================================================
   MODAL DE PEDIDO
========================================================= */

function abrirModalPedido() {
    if (!carrito.length) {
        mostrarToast(
            'Agrega productos al carrito primero',
            'error'
        );

        return;
    }

    const cliente =
        obtenerClienteSeleccionado();

    if (!cliente) {
        mostrarToast(
            'Selecciona un cliente antes de finalizar',
            'error'
        );

        return;
    }

    const resumen =
        $('resumenPedido');

    if (resumen) {
        resumen.innerHTML =
            carrito.map(producto => `
                <div class="resumen-linea">
                    <span>
                        ${producto.cantidad} ×
                        ${escapeHTML(producto.nombre)}
                    </span>

                    <strong>
                        ${dinero(
                            producto.precio *
                            producto.cantidad
                        )}
                    </strong>
                </div>
            `).join('');
    }

    if ($('direccionPedido')) {
        $('direccionPedido').value =
            cliente.direccion || '';
    }

    if ($('notasPedido')) {
        $('notasPedido').value = '';
    }

    const modal = $('modalPedido');

    if (modal) {
        modal.classList.add('mostrar');
    }
}

function cerrarModalPedido() {
    const modal = $('modalPedido');

    if (modal) {
        modal.classList.remove('mostrar');
    }
}

/* =========================================================
   GENERAR PEDIDO
========================================================= */

function generarIdPedido() {
    return Date.now().toString() +
        Math.floor(
            Math.random() * 1000
        ).toString();
}

function generarNumeroPedido(pedidos) {
    const numeros = pedidos
        .map(pedido => {
            const numero =
                String(pedido.numero || '');

            const coincidencia =
                numero.match(/\d+/);

            return coincidencia
                ? Number(coincidencia[0])
                : 0;
        });

    const mayor =
        numeros.length
            ? Math.max(...numeros)
            : 0;

    return `CHQ-${String(
        mayor + 1
    ).padStart(4, '0')}`;
}

function confirmarPedido() {
    const cliente =
        obtenerClienteSeleccionado();

    if (!cliente) {
        mostrarToast(
            'Selecciona un cliente',
            'error'
        );

        return;
    }

    if (!carrito.length) {
        mostrarToast(
            'El carrito está vacío',
            'error'
        );

        return;
    }

    const pedidos =
        cargarPedidos();

    const ahora =
        new Date().toISOString();

    const subtotal =
        calcularSubtotal();

    const descuento =
        calcularDescuento();

    const total =
        Math.max(
            0,
            subtotal - descuento
        );

    const pedido = {
        id: generarIdPedido(),

        numero:
            generarNumeroPedido(pedidos),

        fecha: ahora,

        clienteId:
            cliente.id,

        clienteNombre:
            cliente.nombre || 'Cliente',

        clienteTelefono:
            cliente.telefono || '',

        origen: 'Tienda',

        estado: 'pedido_recibido',

        historialEstados: [
            {
                estado: 'pedido_recibido',
                fecha: ahora
            }
        ],

        productos:
            carrito.map(producto => ({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: producto.cantidad,
                subtotal:
                    producto.precio *
                    producto.cantidad
            })),

        subtotal,

        descuento,

        total,

        direccion:
            $('direccionPedido')?.value.trim() || '',

        notas:
            $('notasPedido')?.value.trim() || '',

        actualizado: ahora
    };

    pedidos.push(pedido);

    guardarPedidos(pedidos);

    carrito = [];

    renderizarCarrito();

    cerrarModalPedido();

    renderizarSeguimientoPedidos(
        cliente.id
    );

    mostrarToast(
        `Pedido ${pedido.numero} registrado correctamente`
    );
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
    }
}

function cambiarTema() {
    const oscuro =
        document.body.classList.toggle(
            'dark'
        );

    localStorage.setItem(
        STORAGE_TEMA,
        oscuro ? 'oscuro' : 'claro'
    );
}

/* =========================================================
   CATEGORÍAS
========================================================= */

function configurarCategorias() {
    const botones =
        document.querySelectorAll(
            '[data-categoria]'
        );

    botones.forEach(boton => {

        boton.addEventListener(
            'click',
            () => {

                botones.forEach(
                    item =>
                        item.classList.remove(
                            'activo'
                        )
                );

                boton.classList.add(
                    'activo'
                );

                categoriaActual =
                    boton.dataset.categoria ||
                    'Todos';

                renderizarProductos();
            }
        );
    });
}

/* =========================================================
   UTILIDAD SEGURA
========================================================= */

function escapeHTML(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        inicializarTema();

        migrarPedidosSeguimiento();

        cargarClientesTienda();

        renderizarProductos();

        renderizarCarrito();

        renderizarSeguimientoPedidos(
            $('clienteTienda')?.value || ''
        );

        configurarCategorias();

        const clienteTienda =
            $('clienteTienda');

        if (clienteTienda) {
            clienteTienda.addEventListener(
                'change',
                mostrarInfoCliente
            );
        }

        const buscarProductos =
            $('buscarProductos');

        if (buscarProductos) {
            buscarProductos.addEventListener(
                'input',
                renderizarProductos
            );
        }

        const abrirCarrito =
            $('abrirCarrito');

        if (abrirCarrito) {
            abrirCarrito.addEventListener(
                'click',
                () => {
                    $('carritoPanel')
                        ?.classList.add(
                            'mostrar'
                        );
                }
            );
        }

        const cerrarCarrito =
            $('cerrarCarrito');

        if (cerrarCarrito) {
            cerrarCarrito.addEventListener(
                'click',
                () => {
                    $('carritoPanel')
                        ?.classList.remove(
                            'mostrar'
                        );
                }
            );
        }

        const btnFinalizar =
            $('btnFinalizar');

        if (btnFinalizar) {
            btnFinalizar.addEventListener(
                'click',
                abrirModalPedido
            );
        }

        const cancelarPedido =
            $('cancelarPedido');

        if (cancelarPedido) {
            cancelarPedido.addEventListener(
                'click',
                cerrarModalPedido
            );
        }

        const confirmar =
            $('confirmarPedido');

        if (confirmar) {
            confirmar.addEventListener(
                'click',
                confirmarPedido
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

        document.addEventListener(
            'keydown',
            evento => {

                if (
                    evento.key === 'Escape'
                ) {
                    cerrarModalPedido();

                    $('carritoPanel')
                        ?.classList.remove(
                            'mostrar'
                        );
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
                    migrarPedidosSeguimiento();

                    renderizarSeguimientoPedidos(
                        $('clienteTienda')
                            ?.value || ''
                    );
                }

                if (
                    evento.key ===
                    STORAGE_CLIENTES
                ) {
                    cargarClientesTienda();
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

window.agregarAlCarrito =
    agregarAlCarrito;

window.cambiarCantidad =
    cambiarCantidad;

window.eliminarDelCarrito =
    eliminarDelCarrito;