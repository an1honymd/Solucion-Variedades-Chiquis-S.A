/* =========================================================
   TIENDA - VARIEDADES CHIQUIS
   ========================================================= */

'use strict';

const STORAGE_CLIENTES = 'clientesChiquis';
const STORAGE_PEDIDOS = 'pedidosChiquis';
const STORAGE_TEMA = 'temaChiquis';


/* =========================================================
   PRODUCTOS
========================================================= */

const productos = [

    {
        id: 1,
        nombre: 'Laptop',
        precio: 5500,
        categoria: 'tecnologia',
        descripcion: 'Ideal para trabajo y estudio.'
    },

    {
        id: 2,
        nombre: 'Monitor',
        precio: 1800,
        categoria: 'tecnologia',
        descripcion: 'Pantalla nítida y cómoda.'
    },

    {
        id: 3,
        nombre: 'Teclado',
        precio: 450,
        categoria: 'accesorios',
        descripcion: 'Respuesta rápida y precisa.'
    },

    {
        id: 4,
        nombre: 'Mouse',
        precio: 250,
        categoria: 'accesorios',
        descripcion: 'Ergonómico y ligero.'
    },

    {
        id: 5,
        nombre: 'Impresora',
        precio: 1200,
        categoria: 'tecnologia',
        descripcion: 'Impresión rápida en casa u oficina.'
    },

    {
        id: 6,
        nombre: 'Audífonos',
        precio: 1000,
        categoria: 'accesorios',
        descripcion: 'Sonido envolvente.'
    },

    {
        id: 7,
        nombre: 'Bocinas',
        precio: 2000,
        categoria: 'accesorios',
        descripcion: 'Audio potente para tu espacio.'
    },

    {
        id: 8,
        nombre: 'Silla Gamer',
        precio: 1000,
        categoria: 'hogar',
        descripcion: 'Comodidad para largas jornadas.'
    },

    {
        id: 9,
        nombre: 'SSD',
        precio: 750,
        categoria: 'tecnologia',
        descripcion: 'Más velocidad para tu equipo.'
    }

];


/* =========================================================
   UTILIDADES
========================================================= */

const $ = id => document.getElementById(id);


function escaparHTML(texto) {

    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function formatearMoneda(valor) {

    return 'Q' + Number(valor || 0).toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


function generarId() {

    return Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8);

}


function generarNumeroPedido(pedidos) {

    let mayor = 0;

    pedidos.forEach(pedido => {

        const coincidencia =
            String(pedido.numero || '').match(/PED-(\d+)/i);

        if (coincidencia) {

            const valor = Number(coincidencia[1]);

            if (valor > mayor) {
                mayor = valor;
            }

        }

    });

    return 'PED-' + String(mayor + 1).padStart(4, '0');

}


/* =========================================================
   VARIABLES DE ESTADO
========================================================= */

let carrito = [];
let categoriaActual = 'todos';
let toastTimer = null;


/* =========================================================
   CLIENTES
========================================================= */

function obtenerClientes() {

    try {

        const datos = localStorage.getItem(STORAGE_CLIENTES);

        if (!datos) return [];

        const clientes = JSON.parse(datos);

        return Array.isArray(clientes) ? clientes : [];

    } catch (error) {

        console.error('Error cargando clientes:', error);

        return [];

    }

}


function clienteSeleccionado() {

    const id = $('clienteTienda')?.value;

    if (!id) return null;

    return obtenerClientes().find(
        c => String(c.id) === String(id)
    ) || null;

}


function cargarClientesSelect() {

    const select = $('clienteTienda');

    if (!select) return;

    const valorAnterior = select.value;

    select.innerHTML =
        '<option value="">Selecciona un cliente</option>';

    obtenerClientes().forEach(cliente => {

        const option = document.createElement('option');

        option.value = cliente.id;

        option.textContent =
            cliente.nombre +
            (cliente.telefono
                ? ' - ' + cliente.telefono
                : '');

        select.appendChild(option);

    });

    if (valorAnterior) {
        select.value = valorAnterior;
    }

    mostrarInfoCliente();

}


function mostrarInfoCliente() {

    const contenedor = $('clienteInfo');

    if (!contenedor) return;

    const cliente = clienteSeleccionado();

    if (!cliente) {

        contenedor.innerHTML =
            '<span>👤 Selecciona un cliente</span>';

        return;

    }

    const tipo =
        cliente.tipo === 'mayorista'
            ? 'Mayorista'
            : 'Minorista';

    const descuento =
        Number(cliente.descuento) || 0;

    contenedor.innerHTML = `

        <span>
            <strong>
                ${escaparHTML(cliente.nombre)}
            </strong>
        </span>

        <span>
            ${escaparHTML(
                cliente.telefono || 'Sin teléfono'
            )}
        </span>

        <span>
            ${tipo}
            ${
                descuento > 0
                    ? ' · ' + descuento + '% descuento'
                    : ''
            }
        </span>

    `;

    actualizarTotales();

}


/* =========================================================
   CATÁLOGO
========================================================= */

function obtenerCantidadEnCarrito(id) {

    const item = carrito.find(p => p.id === id);

    return item ? item.cantidad : 0;

}


function obtenerImagenProducto(id) {

    const imagen =
        document.querySelector(
            `.imagen-producto[data-producto-id="${id}"]`
        );

    if (!imagen) return '';

    return imagen.outerHTML;

}


function mostrarProductos() {

    const contenedor = $('catalogo');

    if (!contenedor) return;

    const texto =
        ($('buscarProductos')?.value || '')
        .toLowerCase()
        .trim();

    const filtrados = productos.filter(producto => {

        const coincideCategoria =
            categoriaActual === 'todos' ||
            producto.categoria === categoriaActual;

        const coincideBusqueda =
            !texto ||
            producto.nombre
                .toLowerCase()
                .includes(texto);

        return coincideCategoria &&
            coincideBusqueda;

    });

    /*
       Guardamos las imágenes que están en el HTML
       antes de reconstruir las tarjetas.
    */

    const imagenesHTML = {};

    contenedor
        .querySelectorAll('.imagen-producto')
        .forEach(imagen => {

            const id = imagen.dataset.productoId;

            if (id) {
                imagenesHTML[id] = imagen.outerHTML;
            }

        });

    contenedor.innerHTML = '';

    if (!filtrados.length) {

        contenedor.innerHTML = `

            <div class="vacio">

                <div>🔎</div>

                <p>
                    No encontramos productos con ese criterio.
                </p>

            </div>

        `;

        return;

    }

    filtrados.forEach(producto => {

        const cantidad =
            obtenerCantidadEnCarrito(producto.id);

        const tarjeta =
            document.createElement('div');

        tarjeta.className = 'producto';

        const imagen =
            imagenesHTML[producto.id]
                ? imagenesHTML[producto.id]
                : `
                    <div
                        class="imagen-producto"
                        data-producto-id="${producto.id}"
                    >
                    </div>
                `;

        tarjeta.innerHTML = `

            <div class="producto-imagen">

                ${imagen}

            </div>

            <h3>
                ${escaparHTML(producto.nombre)}
            </h3>

            <p>
                ${escaparHTML(
                    producto.descripcion || ''
                )}
            </p>

            <div class="precio">
                ${formatearMoneda(producto.precio)}
            </div>

            <button
                type="button"
                class="btn-agregar-producto"
                data-id="${producto.id}"
            >
                ${
                    cantidad > 0
                        ? `🛒 En tu pedido (${cantidad})`
                        : '+ Agregar al carrito'
                }
            </button>

        `;

        contenedor.appendChild(tarjeta);

    });

    contenedor
        .querySelectorAll('.btn-agregar-producto')
        .forEach(boton => {

            boton.addEventListener('click', () => {

                agregarAlCarrito(
                    Number(boton.dataset.id)
                );

            });

        });

}


/* =========================================================
   CARRITO
========================================================= */

function agregarAlCarrito(id) {

    const producto =
        productos.find(p => p.id === id);

    if (!producto) return;

    const existente =
        carrito.find(item => item.id === id);

    if (existente) {

        existente.cantidad++;

    } else {

        carrito.push({

            id: producto.id,

            nombre: producto.nombre,

            precio: producto.precio,

            cantidad: 1

        });

    }

    actualizarCarrito();

    mostrarProductos();

    mostrarToast(
        'Producto agregado al carrito.'
    );

}


function cambiarCantidadCarrito(id, delta) {

    const item =
        carrito.find(p => p.id === id);

    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {

        carrito =
            carrito.filter(p => p.id !== id);

    }

    actualizarCarrito();

    mostrarProductos();

}


function eliminarDelCarrito(id) {

    carrito =
        carrito.filter(item => item.id !== id);

    actualizarCarrito();

    mostrarProductos();

}


function calcularSubtotal() {

    return carrito.reduce(
        (total, item) =>
            total + item.precio * item.cantidad,
        0
    );

}


function calcularDescuento() {

    const cliente =
        clienteSeleccionado();

    if (!cliente) return 0;

    const porcentaje =
        Number(cliente.descuento) || 0;

    return calcularSubtotal() *
        (porcentaje / 100);

}


function actualizarTotales() {

    const subtotal =
        calcularSubtotal();

    const descuento =
        calcularDescuento();

    const total =
        subtotal - descuento;

    if ($('subtotalCarrito')) {

        $('subtotalCarrito').textContent =
            formatearMoneda(subtotal);

    }

    if ($('descuentoCarrito')) {

        $('descuentoCarrito').textContent =
            formatearMoneda(descuento);

    }

    if ($('totalCarrito')) {

        $('totalCarrito').textContent =
            formatearMoneda(total);

    }

}


function actualizarBadgeCarrito() {

    const cantidadTotal =
        carrito.reduce(
            (total, item) =>
                total + item.cantidad,
            0
        );

    if ($('contadorCarrito')) {

        $('contadorCarrito').textContent =
            cantidadTotal;

    }

    if ($('cantidadCarrito')) {

        $('cantidadCarrito').textContent =
            cantidadTotal === 1
                ? '1 producto'
                : `${cantidadTotal} productos`;

    }

}


function renderizarCarrito() {

    const contenedor =
        $('carritoContenido');

    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (!carrito.length) {

        contenedor.innerHTML = `

            <div class="vacio">

                <div>🛒</div>

                <p>
                    Tu carrito está vacío.
                </p>

            </div>

        `;

        return;

    }

    carrito.forEach(item => {

        const fila =
            document.createElement('div');

        fila.className =
            'carrito-item';

        fila.innerHTML = `

            <div>

                <h4>
                    ${escaparHTML(item.nombre)}
                </h4>

                <small>
                    ${formatearMoneda(item.precio)} c/u
                </small>

                <div class="cantidad">

                    <button
                        type="button"
                        class="btn-restar"
                        data-id="${item.id}"
                    >
                        −
                    </button>

                    <span>
                        ${item.cantidad}
                    </span>

                    <button
                        type="button"
                        class="btn-sumar"
                        data-id="${item.id}"
                    >
                        +
                    </button>

                </div>

            </div>

            <div>

                <strong>
                    ${
                        formatearMoneda(
                            item.precio *
                            item.cantidad
                        )
                    }
                </strong>

                <br>

                <button
                    type="button"
                    class="eliminar"
                    data-id="${item.id}"
                >
                    Quitar
                </button>

            </div>

        `;

        contenedor.appendChild(fila);

    });

    contenedor
        .querySelectorAll('.btn-restar')
        .forEach(boton => {

            boton.addEventListener(
                'click',
                () => {

                    cambiarCantidadCarrito(
                        Number(boton.dataset.id),
                        -1
                    );

                }
            );

        });

    contenedor
        .querySelectorAll('.btn-sumar')
        .forEach(boton => {

            boton.addEventListener(
                'click',
                () => {

                    cambiarCantidadCarrito(
                        Number(boton.dataset.id),
                        1
                    );

                }
            );

        });

    contenedor
        .querySelectorAll('.eliminar')
        .forEach(boton => {

            boton.addEventListener(
                'click',
                () => {

                    eliminarDelCarrito(
                        Number(boton.dataset.id)
                    );

                }
            );

        });

}


function actualizarCarrito() {

    actualizarBadgeCarrito();

    renderizarCarrito();

    actualizarTotales();

}


function abrirCarritoPanel() {

    renderizarCarrito();

    $('carritoPanel')
        ?.classList.add('show');

}


function cerrarCarritoPanel() {

    $('carritoPanel')
        ?.classList.remove('show');

}


/* =========================================================
   MODAL DE CONFIRMACIÓN DE PEDIDO
========================================================= */

function abrirModalPedido() {

    if (!carrito.length) {

        mostrarToast(
            'Agrega al menos un producto.',
            'warning'
        );

        abrirCarritoPanel();

        return;

    }

    const cliente =
        clienteSeleccionado();

    if (!cliente) {

        mostrarToast(
            'Selecciona un cliente para continuar.',
            'warning'
        );

        $('clienteTienda')?.focus();

        return;

    }

    const subtotal =
        calcularSubtotal();

    const descuento =
        calcularDescuento();

    const total =
        subtotal - descuento;

    const resumen =
        $('resumenPedido');

    if (resumen) {

        resumen.innerHTML = `

            <div class="resumen-linea">

                <span>Cliente</span>

                <strong>
                    ${escaparHTML(cliente.nombre)}
                </strong>

            </div>

            <div class="resumen-linea">

                <span>Teléfono</span>

                <strong>
                    ${
                        escaparHTML(
                            cliente.telefono ||
                            'Sin teléfono'
                        )
                    }
                </strong>

            </div>

            <div class="resumen-linea">

                <span>Productos</span>

                <strong>
                    ${
                        carrito.reduce(
                            (t, i) =>
                                t + i.cantidad,
                            0
                        )
                    }
                </strong>

            </div>

            <div class="resumen-linea">

                <span>Subtotal</span>

                <strong>
                    ${formatearMoneda(subtotal)}
                </strong>

            </div>

            <div class="resumen-linea">

                <span>Descuento</span>

                <strong>
                    ${formatearMoneda(descuento)}
                </strong>

            </div>

            <div class="resumen-linea">

                <span>Total</span>

                <strong>
                    ${formatearMoneda(total)}
                </strong>

            </div>

        `;

    }

    if (
        $('direccionPedido') &&
        !$('direccionPedido').value
    ) {

        $('direccionPedido').value =
            cliente.direccion || '';

    }

    $('modalPedido')
        ?.classList.add('show');

}


function cerrarModalPedido() {

    $('modalPedido')
        ?.classList.remove('show');

}


function confirmarPedido() {

    const cliente =
        clienteSeleccionado();

    if (!cliente || !carrito.length) {

        cerrarModalPedido();

        return;

    }

    const pedidos =
        obtenerPedidos();

    const numero =
        generarNumeroPedido(pedidos);

    const ahora =
        new Date().toISOString();

    const productosPedido =
        carrito.map(item => ({

            nombre: item.nombre,

            cantidad: item.cantidad,

            precio: item.precio,

            subtotal:
                item.precio *
                item.cantidad

        }));

    const subtotal =
        calcularSubtotal();

    const descuento =
        calcularDescuento();

    const total =
        subtotal - descuento;

    const pedido = {

        id: generarId(),

        numero,

        fecha: ahora,

        clienteId: cliente.id,

        clienteNombre:
            cliente.nombre,

        clienteTelefono:
            cliente.telefono || '',

        origen:
            'Tienda / Autoservicio',

        estado:
            'pendiente',

        productos:
            productosPedido,

        subtotal,

        descuento,

        total,

        direccion:
            $('direccionPedido')
                ?.value
                .trim() ||
            cliente.direccion ||
            '',

        notas:
            $('notasPedido')
                ?.value
                .trim() ||
            '',

        actualizado:
            ahora

    };

    pedidos.push(pedido);

    localStorage.setItem(
        STORAGE_PEDIDOS,
        JSON.stringify(pedidos)
    );

    carrito = [];

    if ($('direccionPedido')) {

        $('direccionPedido').value = '';

    }

    if ($('notasPedido')) {

        $('notasPedido').value = '';

    }

    cerrarModalPedido();

    cerrarCarritoPanel();

    actualizarCarrito();

    mostrarProductos();

    mostrarToast(
        '¡Pedido enviado correctamente!'
    );

}


function obtenerPedidos() {

    try {

        const datos =
            localStorage.getItem(
                STORAGE_PEDIDOS
            );

        if (!datos) return [];

        const pedidos =
            JSON.parse(datos);

        return Array.isArray(pedidos)
            ? pedidos
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
   TEMA
========================================================= */

function cargarTema() {

    let tema =
        localStorage.getItem(
            STORAGE_TEMA
        );

    if (tema === 'oscuro')
        tema = 'dark';

    if (tema === 'claro')
        tema = 'light';

    if (tema === 'dark') {

        document.body.classList.add(
            'dark'
        );

    } else {

        document.body.classList.remove(
            'dark'
        );

    }

    actualizarIconoTema();

}


function cambiarTema() {

    const oscuro =
        document.body.classList.toggle(
            'dark'
        );

    localStorage.setItem(
        STORAGE_TEMA,
        oscuro ? 'dark' : 'light'
    );

    actualizarIconoTema();

}


function actualizarIconoTema() {

    const boton =
        $('btnTema');

    if (!boton) return;

    boton.textContent =
        document.body.classList.contains('dark')
            ? '☀️'
            : '🌙';

}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(mensaje) {

    const toast =
        $('toast');

    if (!toast) return;

    toast.querySelector('span')
        ? (
            toast.querySelector('span')
                .textContent = mensaje
        )
        : (
            toast.textContent = mensaje
        );

    toast.classList.add('show');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove('show');

    }, 3000);

}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        cargarTema();

        cargarClientesSelect();

        mostrarProductos();

        actualizarCarrito();


        $('buscarProductos')
            ?.addEventListener(
                'input',
                mostrarProductos
            );


        document
            .querySelectorAll('.categoria')
            .forEach(boton => {

                boton.addEventListener(
                    'click',
                    () => {

                        document
                            .querySelectorAll(
                                '.categoria'
                            )
                            .forEach(b => {

                                b.classList.remove(
                                    'activo'
                                );

                            });

                        boton.classList.add(
                            'activo'
                        );

                        categoriaActual =
                            boton.dataset.categoria;

                        mostrarProductos();

                    }
                );

            });


        $('clienteTienda')
            ?.addEventListener(
                'change',
                mostrarInfoCliente
            );


        $('abrirCarrito')
            ?.addEventListener(
                'click',
                abrirCarritoPanel
            );


        $('cerrarCarrito')
            ?.addEventListener(
                'click',
                cerrarCarritoPanel
            );


        $('btnFinalizar')
            ?.addEventListener(
                'click',
                abrirModalPedido
            );


        $('cerrarModal')
            ?.addEventListener(
                'click',
                cerrarModalPedido
            );


        $('cancelarPedido')
            ?.addEventListener(
                'click',
                cerrarModalPedido
            );


        $('confirmarPedido')
            ?.addEventListener(
                'click',
                confirmarPedido
            );


        $('modalPedido')
            ?.addEventListener(
                'click',
                evento => {

                    if (
                        evento.target ===
                        $('modalPedido')
                    ) {

                        cerrarModalPedido();

                    }

                }
            );


        $('btnTema')
            ?.addEventListener(
                'click',
                cambiarTema
            );


        document.addEventListener(
            'keydown',
            evento => {

                if (
                    evento.key !==
                    'Escape'
                ) return;

                if (
                    $('modalPedido')
                        ?.classList
                        .contains('show')
                ) {

                    cerrarModalPedido();

                    return;

                }

                if (
                    $('carritoPanel')
                        ?.classList
                        .contains('show')
                ) {

                    cerrarCarritoPanel();

                }

            }
        );


        window.addEventListener(
            'storage',
            evento => {

                if (
                    evento.key ===
                    STORAGE_CLIENTES
                ) {

                    cargarClientesSelect();

                }

                if (
                    evento.key ===
                    STORAGE_TEMA
                ) {

                    cargarTema();

                }

            }
        );

    }
);