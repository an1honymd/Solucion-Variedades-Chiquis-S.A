/* =========================================================
   TIENDA - VARIEDADES CHIQUIS
   ========================================================= */

const STORAGE_CLIENTES = "clientesChiquis";
const STORAGE_PEDIDOS = "pedidosChiquis";
const STORAGE_TEMA = "temaChiquis";


/* =========================================================
   PRODUCTOS
   ========================================================= */

const productos = [

    {
        id: 1,
        nombre: "Laptop",
        precio: 5500,
        categoria: "computadoras",
        imagen: "imagenes/laptop.jpeg"
    },

    {
        id: 2,
        nombre: "Monitor",
        precio: 1800,
        categoria: "computadoras",
        imagen: "imagenes/monitor.jpeg"
    },

    {
        id: 3,
        nombre: "Teclado",
        precio: 450,
        categoria: "accesorios",
        imagen: "imagenes/teclado.jpeg"
    },

    {
        id: 4,
        nombre: "Mouse",
        precio: 250,
        categoria: "accesorios",
        imagen: "imagenes/raton.jpeg"
    },

    {
        id: 5,
        nombre: "Impresora",
        precio: 1200,
        categoria: "oficina",
        imagen: "imagenes/impresora.jpeg"
    },

    {
        id: 6,
        nombre: "Audífonos",
        precio: 1000,
        categoria: "accesorios",
        imagen: "imagenes/audifonos.jpeg"
    },

    {
        id: 7,
        nombre: "Bocinas",
        precio: 2000,
        categoria: "accesorios",
        imagen: "imagenes/bocinas.jpeg"
    },

    {
        id: 8,
        nombre: "Silla Gamer",
        precio: 1000,
        categoria: "oficina",
        imagen: "imagenes/silla.jpeg"
    },

    {
        id: 9,
        nombre: "SSD",
        precio: 750,
        categoria: "computadoras",
        imagen: "imagenes/disco.jpeg"
    }

];


/* =========================================================
   VARIABLES
   ========================================================= */

let carrito = [];

let categoriaActual = "todos";


/* =========================================================
   ELEMENTOS
   ========================================================= */

const productosGrid =
    document.getElementById("productosGrid");

const buscarProducto =
    document.getElementById("buscarProducto");

const contadorCarrito =
    document.getElementById("contadorCarrito");

const carritoModal =
    document.getElementById("carritoModal");

const carritoItems =
    document.getElementById("carritoItems");

const emptyCarrito =
    document.getElementById("emptyCarrito");

const carritoSubtotal =
    document.getElementById("carritoSubtotal");

const clienteTienda =
    document.getElementById("clienteTienda");

const telefonoTienda =
    document.getElementById("telefonoTienda");

const direccionTienda =
    document.getElementById("direccionTienda");

const notasTienda =
    document.getElementById("notasTienda");

const nuevoClienteTienda =
    document.getElementById("nuevoClienteTienda");

const nuevoClienteForm =
    document.getElementById("nuevoClienteForm");

const formPedidoTienda =
    document.getElementById("formPedidoTienda");

const subtotalTienda =
    document.getElementById("subtotalTienda");

const descuentoTienda =
    document.getElementById("descuentoTienda");

const totalTienda =
    document.getElementById("totalTienda");

const confirmacionModal =
    document.getElementById("confirmacionModal");

const numeroPedidoCreado =
    document.getElementById("numeroPedidoCreado");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const toastIcon =
    document.getElementById("toastIcon");


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    cargarTema();

    cargarClientes();

    mostrarProductos();

    actualizarCarrito();

    configurarEventos();

});


/* =========================================================
   EVENTOS
   ========================================================= */

function configurarEventos() {

    /* BUSCADOR */

    if (buscarProducto) {

        buscarProducto.addEventListener("input", () => {

            mostrarProductos();

        });

    }


    /* CATEGORÍAS */

    document.querySelectorAll(".category-button")
        .forEach(button => {

            button.addEventListener("click", () => {

                document
                    .querySelectorAll(".category-button")
                    .forEach(btn => {
                        btn.classList.remove("active");
                    });

                button.classList.add("active");

                categoriaActual =
                    button.dataset.categoria;

                mostrarProductos();

            });

        });


    /* CARRITO */

    document
        .getElementById("btnVerCarrito")
        ?.addEventListener("click", abrirCarrito);


    document
        .getElementById("btnVerCarrito2")
        ?.addEventListener("click", abrirCarrito);


    document
        .getElementById("btnCerrarCarrito")
        ?.addEventListener("click", cerrarCarrito);


    document
        .getElementById("btnCerrarYContinuar")
        ?.addEventListener("click", cerrarCarrito);


    /* NUEVO CLIENTE */

    nuevoClienteTienda?.addEventListener("change", () => {

        if (nuevoClienteTienda.checked) {

            nuevoClienteForm.hidden = false;

            clienteTienda.value = "";

            telefonoTienda.value = "";

        } else {

            nuevoClienteForm.hidden = true;

        }

    });


    /* CLIENTE SELECCIONADO */

    clienteTienda?.addEventListener("change", () => {

        const clientes =
            obtenerClientes();

        const cliente =
            clientes.find(
                c => String(c.id) === String(clienteTienda.value)
            );

        if (!cliente) {

            telefonoTienda.value = "";

            direccionTienda.value = "";

            actualizarTotales();

            return;

        }

        telefonoTienda.value =
            cliente.telefono || "";

        direccionTienda.value =
            cliente.direccion || "";

        actualizarTotales();

    });


    /* FORMULARIO */

    formPedidoTienda?.addEventListener(
        "submit",
        guardarPedido
    );


    /* CONFIRMACIÓN */

    document
        .getElementById("btnCerrarConfirmacion")
        ?.addEventListener("click", () => {

            confirmacionModal.hidden = true;

        });


    /* TEMA */

    document
        .getElementById("btnTema")
        ?.addEventListener("click", cambiarTema);


    /* CERRAR MODALES HACIENDO CLICK AFUERA */

    carritoModal?.addEventListener("click", evento => {

        if (evento.target === carritoModal) {

            cerrarCarrito();

        }

    });


    confirmacionModal?.addEventListener("click", evento => {

        if (evento.target === confirmacionModal) {

            confirmacionModal.hidden = true;

        }

    });


    /* ESCAPE */

    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape") {

            carritoModal.hidden = true;

            confirmacionModal.hidden = true;

        }

    });

}


/* =========================================================
   MOSTRAR PRODUCTOS
   ========================================================= */

function mostrarProductos() {

    if (!productosGrid) return;

    const texto =
        (buscarProducto?.value || "")
            .toLowerCase()
            .trim();


    const filtrados =
        productos.filter(producto => {

            const coincideCategoria =
                categoriaActual === "todos" ||
                producto.categoria === categoriaActual;

            const coincideBusqueda =
                producto.nombre
                    .toLowerCase()
                    .includes(texto);

            return coincideCategoria &&
                coincideBusqueda;

        });


    productosGrid.innerHTML = "";


    if (filtrados.length === 0) {

        document.getElementById("emptyProductos").hidden = false;

        return;

    }


    document.getElementById("emptyProductos").hidden = true;


    filtrados.forEach(producto => {

        const cantidad =
            obtenerCantidadCarrito(producto.id);


        const tarjeta =
            document.createElement("article");

        tarjeta.className = "product-card";


        tarjeta.innerHTML = `

            <div class="product-image">

                <img
                    src="${producto.imagen}"
                    alt="${escaparHTML(producto.nombre)}"
                    onerror="this.style.display='none';"
                >

            </div>


            <div class="product-info">

                <span class="product-category">
                    ${obtenerNombreCategoria(producto.categoria)}
                </span>

                <h3>
                    ${escaparHTML(producto.nombre)}
                </h3>


                <div class="product-bottom">

                    <strong class="product-price">
                        ${formatearMoneda(producto.precio)}
                    </strong>

                </div>


                <div class="product-controls">

                    <button
                        type="button"
                        class="quantity-button"
                        data-action="restar"
                        data-id="${producto.id}">
                        −
                    </button>

                    <span class="product-quantity">
                        ${cantidad}
                    </span>

                    <button
                        type="button"
                        class="quantity-button"
                        data-action="sumar"
                        data-id="${producto.id}">
                        +
                    </button>

                </div>

            </div>

        `;


        productosGrid.appendChild(tarjeta);

    });


    productosGrid
        .querySelectorAll(".quantity-button")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id =
                    Number(button.dataset.id);

                const accion =
                    button.dataset.action;

                if (accion === "sumar") {

                    agregarAlCarrito(id);

                } else {

                    quitarDelCarrito(id);

                }

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

}


function quitarDelCarrito(id) {

    const existente =
        carrito.find(item => item.id === id);

    if (!existente) return;


    existente.cantidad--;


    if (existente.cantidad <= 0) {

        carrito =
            carrito.filter(item => item.id !== id);

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


function obtenerCantidadCarrito(id) {

    const producto =
        carrito.find(item => item.id === id);

    return producto
        ? producto.cantidad
        : 0;

}


function actualizarCarrito() {

    const cantidadTotal =
        carrito.reduce(
            (total, item) =>
                total + item.cantidad,
            0
        );


    if (contadorCarrito) {

        contadorCarrito.textContent =
            cantidadTotal;

    }


    renderizarCarrito();

    actualizarTotales();

}


function renderizarCarrito() {

    if (!carritoItems) return;

    carritoItems.innerHTML = "";


    if (carrito.length === 0) {

        emptyCarrito.hidden = false;

        carritoSubtotal.textContent =
            "Q0.00";

        return;

    }


    emptyCarrito.hidden = true;


    carrito.forEach(item => {

        const fila =
            document.createElement("div");

        fila.className = "cart-item";


        fila.innerHTML = `

            <div class="cart-item-info">

                <h4>
                    ${escaparHTML(item.nombre)}
                </h4>

                <span>
                    ${formatearMoneda(item.precio)}
                    × ${item.cantidad}
                </span>

            </div>


            <strong>
                ${formatearMoneda(
                    item.precio * item.cantidad
                )}
            </strong>


            <button
                type="button"
                class="delete-cart-button"
                data-id="${item.id}">
                🗑️
            </button>

        `;


        carritoItems.appendChild(fila);

    });


    carritoItems
        .querySelectorAll(".delete-cart-button")
        .forEach(button => {

            button.addEventListener("click", () => {

                eliminarDelCarrito(
                    Number(button.dataset.id)
                );

            });

        });


    const subtotal =
        calcularSubtotal();

    carritoSubtotal.textContent =
        formatearMoneda(subtotal);

}


function abrirCarrito() {

    renderizarCarrito();

    carritoModal.hidden = false;

}


function cerrarCarrito() {

    carritoModal.hidden = true;

}


/* =========================================================
   TOTALES
   ========================================================= */

function calcularSubtotal() {

    return carrito.reduce(
        (total, item) =>
            total + item.precio * item.cantidad,
        0
    );

}


function obtenerDescuentoCliente() {

    if (nuevoClienteTienda?.checked) {

        return 0;

    }


    const id =
        clienteTienda?.value;

    if (!id) return 0;


    const cliente =
        obtenerClientes().find(
            c => String(c.id) === String(id)
        );


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
        obtenerDescuentoCliente();

    const total =
        subtotal - descuento;


    if (subtotalTienda) {

        subtotalTienda.textContent =
            formatearMoneda(subtotal);

    }


    if (descuentoTienda) {

        descuentoTienda.textContent =
            formatearMoneda(descuento);

    }


    if (totalTienda) {

        totalTienda.textContent =
            formatearMoneda(total);

    }

}


/* =========================================================
   CLIENTES
   ========================================================= */

function obtenerClientes() {

    try {

        const datos =
            localStorage.getItem(STORAGE_CLIENTES);

        if (!datos) return [];

        const clientes =
            JSON.parse(datos);

        return Array.isArray(clientes)
            ? clientes
            : [];

    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        return [];

    }

}


function cargarClientes() {

    if (!clienteTienda) return;


    const clientes =
        obtenerClientes();


    clienteTienda.innerHTML = `

        <option value="">
            Selecciona un cliente
        </option>

    `;


    clientes.forEach(cliente => {

        const option =
            document.createElement("option");

        option.value =
            cliente.id;

        option.textContent =
            cliente.nombre +
            (
                cliente.telefono
                    ? " - " + cliente.telefono
                    : ""
            );

        clienteTienda.appendChild(option);

    });

}


/* =========================================================
   GUARDAR PEDIDO
   ========================================================= */

function guardarPedido(evento) {

    evento.preventDefault();


    if (carrito.length === 0) {

        mostrarToast(
            "Debes agregar al menos un producto.",
            "⚠️"
        );

        abrirCarrito();

        return;

    }


    let clienteId = "";

    let clienteNombre = "";

    let clienteTelefono = "";

    let direccion = "";


    /* ==========================================
       CLIENTE NUEVO
    ========================================== */

    if (nuevoClienteTienda.checked) {

        const nombre =
            document.getElementById(
                "nombreNuevoCliente"
            ).value.trim();


        const telefono =
            document.getElementById(
                "telefonoNuevoCliente"
            ).value.trim();


        const email =
            document.getElementById(
                "emailNuevoCliente"
            ).value.trim();


        const direccionNueva =
            document.getElementById(
                "direccionNuevoCliente"
            ).value.trim();


        if (!nombre) {

            mostrarToast(
                "Ingresa el nombre del cliente.",
                "⚠️"
            );

            return;

        }


        if (!telefono) {

            mostrarToast(
                "Ingresa el teléfono del cliente.",
                "⚠️"
            );

            return;

        }


        clienteId =
            generarId();


        clienteNombre =
            nombre;

        clienteTelefono =
            telefono;

        direccion =
            direccionNueva;


        const clientes =
            obtenerClientes();


        clientes.push({

            id: clienteId,

            nombre: nombre,

            telefono: telefono,

            email: email,

            dpi: "",

            nit: "",

            direccion: direccionNueva,

            tipo: "regular",

            descuento: 0,

            limiteCredito: 0,

            fechaRegistro:
                new Date().toISOString()

        });


        localStorage.setItem(
            STORAGE_CLIENTES,
            JSON.stringify(clientes)
        );


    } else {

        /* ======================================
           CLIENTE REGISTRADO
        ====================================== */

        if (!clienteTienda.value) {

            mostrarToast(
                "Selecciona un cliente.",
                "⚠️"
            );

            return;

        }


        const cliente =
            obtenerClientes().find(
                c =>
                    String(c.id) ===
                    String(clienteTienda.value)
            );


        if (!cliente) {

            mostrarToast(
                "No se encontró el cliente seleccionado.",
                "⚠️"
            );

            return;

        }


        clienteId =
            cliente.id;

        clienteNombre =
            cliente.nombre;

        clienteTelefono =
            telefonoTienda.value.trim() ||
            cliente.telefono ||
            "";

        direccion =
            direccionTienda.value.trim() ||
            cliente.direccion ||
            "";

    }


    const notas =
        notasTienda.value.trim();


    const subtotal =
        calcularSubtotal();


    const descuento =
        nuevoClienteTienda.checked
            ? 0
            : obtenerDescuentoCliente();


    const total =
        subtotal - descuento;


    /* ==========================================
       GENERAR PEDIDO
    ========================================== */

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
                item.precio * item.cantidad

        }));


    const pedido = {

        id: generarId(),

        numero: numero,

        fecha: ahora,

        clienteId: clienteId,

        clienteNombre: clienteNombre,

        clienteTelefono: clienteTelefono,

        origen: "Tienda / Autoservicio",

        estado: "pendiente",

        productos: productosPedido,

        subtotal: subtotal,

        descuento: descuento,

        total: total,

        direccion: direccion,

        notas: notas,

        actualizado: ahora

    };


    pedidos.push(pedido);


    localStorage.setItem(
        STORAGE_PEDIDOS,
        JSON.stringify(pedidos)
    );


    /* ==========================================
       MOSTRAR CONFIRMACIÓN
    ========================================== */

    numeroPedidoCreado.textContent =
        numero;


    confirmacionModal.hidden =
        false;


    /* LIMPIAR */

    carrito = [];


    formPedidoTienda.reset();


    nuevoClienteForm.hidden =
        true;


    actualizarCarrito();

    cargarClientes();

    mostrarProductos();


    mostrarToast(
        "Pedido registrado correctamente.",
        "✓"
    );

}


/* =========================================================
   PEDIDOS
   ========================================================= */

function obtenerPedidos() {

    try {

        const datos =
            localStorage.getItem(STORAGE_PEDIDOS);

        if (!datos) return [];

        const pedidos =
            JSON.parse(datos);

        return Array.isArray(pedidos)
            ? pedidos
            : [];

    } catch (error) {

        console.error(
            "Error cargando pedidos:",
            error
        );

        return [];

    }

}


function generarNumeroPedido(pedidos) {

    let mayor = 0;


    pedidos.forEach(pedido => {

        const numero =
            String(pedido.numero || "");


        const coincidencia =
            numero.match(/PED-(\d+)/i);


        if (coincidencia) {

            const valor =
                Number(coincidencia[1]);


            if (valor > mayor) {

                mayor = valor;

            }

        }

    });


    return "PED-" +
        String(mayor + 1)
            .padStart(4, "0");

}


/* =========================================================
   GENERAR ID
   ========================================================= */

function generarId() {

    return Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8);

}


/* =========================================================
   TEMA
   ========================================================= */

function cargarTema() {

    let tema =
        localStorage.getItem(STORAGE_TEMA);


    /* Compatibilidad con versiones anteriores */

    if (tema === "oscuro") {

        tema = "dark";

    }

    if (tema === "claro") {

        tema = "light";

    }


    if (tema === "dark") {

        document.body.classList.add("dark");

    } else {

        document.body.classList.remove("dark");

    }


    actualizarTextoTema();

}


function cambiarTema() {

    const oscuro =
        document.body.classList.toggle("dark");


    const tema =
        oscuro
            ? "dark"
            : "light";


    localStorage.setItem(
        STORAGE_TEMA,
        tema
    );


    actualizarTextoTema();

}


function actualizarTextoTema() {

    const icon =
        document.getElementById("themeIcon");

    const text =
        document.getElementById("themeText");


    const oscuro =
        document.body.classList.contains("dark");


    if (icon) {

        icon.textContent =
            oscuro ? "☀️" : "🌙";

    }


    if (text) {

        text.textContent =
            oscuro
                ? "Modo claro"
                : "Modo oscuro";

    }

}


/* =========================================================
   STORAGE
   ========================================================= */

window.addEventListener("storage", evento => {

    if (evento.key === STORAGE_CLIENTES) {

        cargarClientes();

    }


    if (evento.key === STORAGE_TEMA) {

        cargarTema();

    }

});


/* =========================================================
   TOAST
   ========================================================= */

function mostrarToast(mensaje, icono = "✓") {

    if (!toast) return;


    toastMessage.textContent =
        mensaje;

    toastIcon.textContent =
        icono;


    toast.hidden =
        false;


    clearTimeout(
        mostrarToast.timer
    );


    mostrarToast.timer =
        setTimeout(() => {

            toast.hidden =
                true;

        }, 3500);

}


/* =========================================================
   UTILIDADES
   ========================================================= */

function formatearMoneda(valor) {

    return "Q" +
        Number(valor || 0)
            .toLocaleString(
                "es-GT",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

}


function obtenerNombreCategoria(categoria) {

    const nombres = {

        computadoras: "Computadoras",

        accesorios: "Accesorios",

        oficina: "Oficina"

    };


    return nombres[categoria] ||
        "Producto";

}


function escaparHTML(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}