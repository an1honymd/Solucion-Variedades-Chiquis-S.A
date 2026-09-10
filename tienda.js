/* =========================================
   VARIEDADES CHIQUIS
   TIENDA / AUTOSERVICIO
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       CONFIGURACIÓN
    ===================================== */

    const STORAGE_PEDIDOS = "pedidosChiquis";
    const STORAGE_TEMA = "temaChiquis";
    const STORAGE_CARRITO = "carritoTiendaChiquis";


    /*
       Número de WhatsApp de la empresa.

       CAMBIA ESTE NÚMERO POR EL DE
       VARIEDADES CHIQUIS.

       Debe llevar código de Guatemala:
       502 + número
    */

    const WHATSAPP_EMPRESA = "50200000000";


    /* =====================================
       PRODUCTOS
    ===================================== */

    const productos = [

        {
            id: 1,
            nombre: "Laptop",
            categoria: "tecnologia",
            descripcion: "Laptop para estudio, trabajo y uso diario.",
            precio: 5500,
            stock: 10,
            icono: "💻"
        },

        {
            id: 2,
            nombre: "Monitor",
            categoria: "tecnologia",
            descripcion: "Monitor de excelente calidad para computadora.",
            precio: 1800,
            stock: 8,
            icono: "🖥️"
        },

        {
            id: 3,
            nombre: "Teclado",
            categoria: "accesorios",
            descripcion: "Teclado cómodo para trabajo y estudio.",
            precio: 450,
            stock: 15,
            icono: "⌨️"
        },

        {
            id: 4,
            nombre: "Mouse",
            categoria: "accesorios",
            descripcion: "Mouse ergonómico para computadora.",
            precio: 250,
            stock: 20,
            icono: "🖱️"
        },

        {
            id: 5,
            nombre: "Impresora",
            categoria: "tecnologia",
            descripcion: "Impresora para hogar, oficina y estudiantes.",
            precio: 1200,
            stock: 7,
            icono: "🖨️"
        },

        {
            id: 6,
            nombre: "Audífonos",
            categoria: "accesorios",
            descripcion: "Audífonos para música, llamadas y entretenimiento.",
            precio: 1000,
            stock: 12,
            icono: "🎧"
        },

        {
            id: 7,
            nombre: "Bocinas",
            categoria: "accesorios",
            descripcion: "Bocinas para disfrutar de tu música favorita.",
            precio: 2000,
            stock: 6,
            icono: "🔊"
        },

        {
            id: 8,
            nombre: "Silla Gamer",
            categoria: "hogar",
            descripcion: "Silla cómoda para largas sesiones de trabajo o juego.",
            precio: 1000,
            stock: 5,
            icono: "🪑"
        },

        {
            id: 9,
            nombre: "Disco SSD",
            categoria: "tecnologia",
            descripcion: "Unidad SSD para mejorar el almacenamiento y rendimiento.",
            precio: 750,
            stock: 0,
            icono: "💾"
        }

    ];


    /* =====================================
       VARIABLES
    ===================================== */

    let carrito = cargarCarrito();

    let categoriaActual = "todos";

    let textoBusqueda = "";

    let pedidoActual = null;


    /* =====================================
       ELEMENTOS
    ===================================== */

    const productosGrid =
        document.getElementById("productosGrid");

    const productosVacios =
        document.getElementById("productosVacios");

    const buscarProducto =
        document.getElementById("buscarProducto");

    const cantidadProductos =
        document.getElementById("cantidadProductos");

    const contadorCarrito =
        document.getElementById("contadorCarrito");

    const cartPanel =
        document.getElementById("cartPanel");

    const cartBody =
        document.getElementById("cartBody");

    const overlay =
        document.getElementById("overlay");

    const subtotalCarrito =
        document.getElementById("subtotalCarrito");

    const totalCarrito =
        document.getElementById("totalCarrito");

    const modalPedido =
        document.getElementById("modalPedido");

    const modalExito =
        document.getElementById("modalExito");

    const pedidoForm =
        document.getElementById("pedidoForm");

    const resumenPedido =
        document.getElementById("resumenPedido");

    const resumenTotal =
        document.getElementById("resumenTotal");

    const numeroPedidoGenerado =
        document.getElementById("numeroPedidoGenerado");

    const toast =
        document.getElementById("toast");

    const toastMensaje =
        document.getElementById("toastMensaje");


    /* =====================================
       INICIALIZACIÓN
    ===================================== */

    cargarTema();

    renderProductos();

    renderCarrito();

    configurarEventos();


    /* =====================================
       PRODUCTOS
    ===================================== */

    function renderProductos() {

        const filtrados =
            productos.filter(producto => {

                const coincideCategoria =
                    categoriaActual === "todos" ||
                    producto.categoria === categoriaActual;

                const texto =
                    textoBusqueda.toLowerCase().trim();

                const coincideBusqueda =
                    producto.nombre
                        .toLowerCase()
                        .includes(texto) ||

                    producto.descripcion
                        .toLowerCase()
                        .includes(texto);

                return coincideCategoria &&
                       coincideBusqueda;

            });


        productosGrid.innerHTML = "";

        cantidadProductos.textContent =
            `${filtrados.length} producto${filtrados.length !== 1 ? "s" : ""}`;


        if (filtrados.length === 0) {

            productosVacios.style.display = "block";

            return;

        }

        productosVacios.style.display = "none";


        filtrados.forEach(producto => {

            const card =
                document.createElement("article");

            card.className = "product-card";


            const agotado =
                producto.stock <= 0;


            card.innerHTML = `

                <div class="product-image">

                    ${producto.icono}

                </div>

                <div class="product-info">

                    <span class="product-category">

                        ${capitalizar(producto.categoria)}

                    </span>

                    <h3 class="product-name">

                        ${producto.nombre}

                    </h3>

                    <p class="product-description">

                        ${producto.descripcion}

                    </p>

                    <div class="product-bottom">

                        <span class="product-price">

                            Q${formatearNumero(producto.precio)}

                        </span>

                        <span class="product-stock">

                            ${
                                agotado
                                ? "Agotado"
                                : `${producto.stock} disponibles`
                            }

                        </span>

                    </div>

                    <div class="product-actions">

                        <div class="quantity-control">

                            <button
                                type="button"
                                class="btn-menos"
                                data-id="${producto.id}">

                                −

                            </button>

                            <span id="cantidad-${producto.id}">
                                1
                            </span>

                            <button
                                type="button"
                                class="btn-mas"
                                data-id="${producto.id}">

                                +

                            </button>

                        </div>

                        <button
                            type="button"
                            class="add-btn"
                            data-id="${producto.id}"
                            ${agotado ? "disabled" : ""}>

                            ${
                                agotado
                                ? "Agotado"
                                : "Agregar"
                            }

                        </button>

                    </div>

                </div>

            `;


            productosGrid.appendChild(card);

        });

    }


    /* =====================================
       EVENTOS
    ===================================== */

    function configurarEventos() {


        /* BUSCAR */

        buscarProducto.addEventListener(
            "input",
            () => {

                textoBusqueda =
                    buscarProducto.value;

                renderProductos();

            }
        );


        /* CATEGORÍAS */

        document
            .querySelectorAll(".category-btn")
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(".category-btn")
                            .forEach(b =>
                                b.classList.remove("active")
                            );

                        btn.classList.add("active");

                        categoriaActual =
                            btn.dataset.categoria;

                        renderProductos();

                    }
                );

            });


        /* AGREGAR PRODUCTO */

        productosGrid.addEventListener(
            "click",
            evento => {

                const boton =
                    evento.target.closest(
                        ".add-btn"
                    );

                if (!boton) return;

                const id =
                    Number(boton.dataset.id);

                const cantidadElemento =
                    document.getElementById(
                        `cantidad-${id}`
                    );

                const cantidad =
                    Number(
                        cantidadElemento.textContent
                    );

                agregarAlCarrito(
                    id,
                    cantidad
                );

            }
        );


        /* MÁS / MENOS */

        productosGrid.addEventListener(
            "click",
            evento => {

                const botonMas =
                    evento.target.closest(".btn-mas");

                const botonMenos =
                    evento.target.closest(".btn-menos");


                if (!botonMas && !botonMenos) {
                    return;
                }


                const boton =
                    botonMas || botonMenos;

                const id =
                    Number(boton.dataset.id);

                const elemento =
                    document.getElementById(
                        `cantidad-${id}`
                    );

                let cantidad =
                    Number(elemento.textContent);


                const producto =
                    buscarProductoPorId(id);


                if (botonMas) {

                    if (
                        cantidad <
                        producto.stock
                    ) {

                        cantidad++;

                    }

                }


                if (botonMenos) {

                    if (cantidad > 1) {

                        cantidad--;

                    }

                }


                elemento.textContent =
                    cantidad;

            }
        );


        /* ABRIR CARRITO */

        document
            .getElementById("btnAbrirCarrito")
            .addEventListener(
                "click",
                abrirCarrito
            );


        /* CERRAR CARRITO */

        document
            .getElementById("btnCerrarCarrito")
            .addEventListener(
                "click",
                cerrarCarrito
            );


        overlay.addEventListener(
            "click",
            cerrarCarrito
        );


        /* CONTINUAR PEDIDO */

        document
            .getElementById("btnContinuarPedido")
            .addEventListener(
                "click",
                abrirFormularioPedido
            );


        /* CERRAR MODAL */

        document
            .getElementById("btnCerrarPedido")
            .addEventListener(
                "click",
                cerrarFormularioPedido
            );


        document
            .getElementById("btnCancelarPedido")
            .addEventListener(
                "click",
                cerrarFormularioPedido
            );


        /* FORMULARIO */

        pedidoForm.addEventListener(
            "submit",
            enviarPedido
        );


        /* WHATSAPP */

        document
            .getElementById("btnWhatsApp")
            .addEventListener(
                "click",
                enviarWhatsApp
            );


        /* FINALIZAR */

        document
            .getElementById("btnFinalizar")
            .addEventListener(
                "click",
                finalizarPedido
            );


        /* TEMA */

        document
            .getElementById("btnTema")
            .addEventListener(
                "click",
                cambiarTema
            );


        /* TECLA ESCAPE */

        document.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key === "Escape"
                ) {

                    cerrarCarrito();

                    cerrarFormularioPedido();

                }

            }
        );

    }


    /* =====================================
       CARRITO
    ===================================== */

    function agregarAlCarrito(
        id,
        cantidad
    ) {

        const producto =
            buscarProductoPorId(id);

        if (!producto) return;


        if (producto.stock <= 0) {

            mostrarToast(
                "Producto agotado"
            );

            return;

        }


        const existente =
            carrito.find(
                item => item.id === id
            );


        if (existente) {

            const nuevaCantidad =
                existente.cantidad +
                cantidad;


            if (
                nuevaCantidad >
                producto.stock
            ) {

                existente.cantidad =
                    producto.stock;

            } else {

                existente.cantidad =
                    nuevaCantidad;

            }

        } else {

            carrito.push({

                id: producto.id,

                nombre: producto.nombre,

                precio: producto.precio,

                cantidad: cantidad,

                icono: producto.icono

            });

        }


        guardarCarrito();

        renderCarrito();

        mostrarToast(
            `${producto.nombre} agregado al carrito`
        );

    }


    function renderCarrito() {

        const totalCantidad =
            carrito.reduce(
                (total, item) =>
                    total + item.cantidad,
                0
            );


        contadorCarrito.textContent =
            totalCantidad;


        if (carrito.length === 0) {

            cartBody.innerHTML = `

                <div class="empty-cart">

                    <div class="empty-cart-icon">
                        🛒
                    </div>

                    <h3>
                        Tu carrito está vacío
                    </h3>

                    <p>
                        Agrega productos del catálogo
                        para comenzar tu pedido.
                    </p>

                </div>

            `;

            subtotalCarrito.textContent =
                "Q0.00";

            totalCarrito.textContent =
                "Q0.00";

            return;

        }


        cartBody.innerHTML = "";


        carrito.forEach(item => {

            const elemento =
                document.createElement("div");

            elemento.className =
                "cart-item";


            elemento.innerHTML = `

                <div class="cart-item-icon">

                    ${item.icono}

                </div>

                <div class="cart-item-info">

                    <h4>
                        ${item.nombre}
                    </h4>

                    <small>
                        Q${formatearNumero(item.precio)}
                        c/u
                    </small>

                    <div class="cart-item-actions">

                        <div class="cart-quantity">

                            <button
                                type="button"
                                class="cart-menos"
                                data-id="${item.id}">

                                −

                            </button>

                            <span>
                                ${item.cantidad}
                            </span>

                            <button
                                type="button"
                                class="cart-mas"
                                data-id="${item.id}">

                                +

                            </button>

                        </div>

                        <strong>

                            Q${formatearNumero(
                                item.precio *
                                item.cantidad
                            )}

                        </strong>

                        <button
                            type="button"
                            class="remove-cart"
                            data-id="${item.id}">

                            🗑️

                        </button>

                    </div>

                </div>

            `;


            cartBody.appendChild(elemento);

        });


        const subtotal =
            calcularTotal();


        subtotalCarrito.textContent =
            `Q${formatearNumero(subtotal)}`;

        totalCarrito.textContent =
            `Q${formatearNumero(subtotal)}`;


        configurarEventosCarrito();

    }


    function configurarEventosCarrito() {


        document
            .querySelectorAll(".cart-mas")
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        cambiarCantidadCarrito(
                            Number(btn.dataset.id),
                            1
                        );

                    }
                );

            });


        document
            .querySelectorAll(".cart-menos")
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        cambiarCantidadCarrito(
                            Number(btn.dataset.id),
                            -1
                        );

                    }
                );

            });


        document
            .querySelectorAll(".remove-cart")
            .forEach(btn => {

                btn.addEventListener(
                    "click",
                    () => {

                        eliminarDelCarrito(
                            Number(btn.dataset.id)
                        );

                    }
                );

            });

    }


    function cambiarCantidadCarrito(
        id,
        cambio
    ) {

        const item =
            carrito.find(
                producto => producto.id === id
            );

        if (!item) return;


        const producto =
            buscarProductoPorId(id);


        let nuevaCantidad =
            item.cantidad + cambio;


        if (nuevaCantidad < 1) {

            nuevaCantidad = 1;

        }


        if (
            nuevaCantidad >
            producto.stock
        ) {

            nuevaCantidad =
                producto.stock;

            mostrarToast(
                "No hay más unidades disponibles"
            );

        }


        item.cantidad =
            nuevaCantidad;


        guardarCarrito();

        renderCarrito();

    }


    function eliminarDelCarrito(id) {

        carrito =
            carrito.filter(
                item => item.id !== id
            );


        guardarCarrito();

        renderCarrito();

        mostrarToast(
            "Producto eliminado del carrito"
        );

    }


    function calcularTotal() {

        return carrito.reduce(
            (total, item) =>
                total +
                (
                    item.precio *
                    item.cantidad
                ),
            0
        );

    }


    /* =====================================
       ABRIR / CERRAR CARRITO
    ===================================== */

    function abrirCarrito() {

        cartPanel.classList.add("show");

        overlay.classList.add("show");

    }


    function cerrarCarrito() {

        cartPanel.classList.remove("show");

        overlay.classList.remove("show");

    }


    /* =====================================
       FORMULARIO PEDIDO
    ===================================== */

    function abrirFormularioPedido() {

        if (carrito.length === 0) {

            mostrarToast(
                "Primero agrega productos al carrito"
            );

            return;

        }


        cerrarCarrito();

        renderResumenPedido();

        modalPedido.classList.add("show");

    }


    function cerrarFormularioPedido() {

        modalPedido.classList.remove("show");

    }


    function renderResumenPedido() {

        resumenPedido.innerHTML = "";


        carrito.forEach(item => {

            const fila =
                document.createElement("div");

            fila.className =
                "summary-product";


            fila.innerHTML = `

                <span>
                    ${item.cantidad} ×
                    ${item.nombre}
                </span>

                <strong>
                    Q${formatearNumero(
                        item.precio *
                        item.cantidad
                    )}
                </strong>

            `;


            resumenPedido.appendChild(fila);

        });


        resumenTotal.textContent =
            `Q${formatearNumero(
                calcularTotal()
            )}`;

    }


    /* =====================================
       ENVIAR PEDIDO
    ===================================== */

    function enviarPedido(evento) {

        evento.preventDefault();


        if (carrito.length === 0) {

            mostrarToast(
                "El carrito está vacío"
            );

            return;

        }


        const nombre =
            document
                .getElementById("clienteNombre")
                .value
                .trim();

        const telefono =
            document
                .getElementById("clienteTelefono")
                .value
                .trim();

        const correo =
            document
                .getElementById("clienteCorreo")
                .value
                .trim();

        const direccion =
            document
                .getElementById("clienteDireccion")
                .value
                .trim();

        const notas =
            document
                .getElementById("clienteNotas")
                .value
                .trim();


        if (!nombre || !telefono || !direccion) {

            mostrarToast(
                "Completa los campos obligatorios"
            );

            return;

        }


        const pedidos =
            cargarPedidos();


        const numero =
            generarNumeroPedido(
                pedidos
            );


        const fecha =
            new Date().toISOString();


        const subtotal =
            calcularTotal();


        /*
           Estructura compatible con
           el módulo PEDIDOS.
        */

        const nuevoPedido = {

            id:
                Date.now(),

            numero:
                numero,

            fecha:
                fecha,

            cliente:
                nombre,

            telefono:
                telefono,

            correo:
                correo,

            direccion:
                direccion,

            origen:
                "Tienda / Autoservicio",

            estado:
                "Pendiente",

            productos:
                carrito.map(item => ({

                    producto:
                        item.nombre,

                    nombre:
                        item.nombre,

                    cantidad:
                        item.cantidad,

                    precio:
                        item.precio,

                    subtotal:
                        item.precio *
                        item.cantidad

                })),

            subtotal:
                subtotal,

            descuento:
                0,

            total:
                subtotal,

            notas:
                notas

        };


        pedidos.push(nuevoPedido);


        localStorage.setItem(
            STORAGE_PEDIDOS,
            JSON.stringify(pedidos)
        );


        pedidoActual =
            nuevoPedido;


        numeroPedidoGenerado.textContent =
            numero;


        cerrarFormularioPedido();


        modalExito.classList.add("show");


        /* Limpiar carrito */

        carrito = [];

        guardarCarrito();

        renderCarrito();


        pedidoForm.reset();


        mostrarToast(
            "Pedido registrado correctamente"
        );

    }


    /* =====================================
       GENERAR NÚMERO PEDIDO
    ===================================== */

    function generarNumeroPedido(
        pedidos
    ) {

        let mayor = 0;


        pedidos.forEach(pedido => {

            const numero =
                String(
                    pedido.numero || ""
                );


            const coincidencia =
                numero.match(
                    /PED-(\d+)/
                );


            if (coincidencia) {

                const valor =
                    Number(
                        coincidencia[1]
                    );


                if (valor > mayor) {

                    mayor = valor;

                }

            }

        });


        return (
            "PED-" +
            String(mayor + 1)
                .padStart(4, "0")
        );

    }


    /* =====================================
       WHATSAPP
    ===================================== */

    function enviarWhatsApp() {

        if (!pedidoActual) {

            return;

        }


        let mensaje =
            `*NUEVO PEDIDO - VARIEDADES CHIQUIS*\n\n`;


        mensaje +=
            `📦 *Pedido:* ${pedidoActual.numero}\n`;

        mensaje +=
            `👤 *Cliente:* ${pedidoActual.cliente}\n`;

        mensaje +=
            `📱 *Teléfono:* ${pedidoActual.telefono}\n`;

        mensaje +=
            `📍 *Dirección:* ${pedidoActual.direccion}\n`;

        mensaje +=
            `🛍️ *Origen:* Tienda / Autoservicio\n\n`;


        mensaje +=
            `*PRODUCTOS:*\n`;


        pedidoActual.productos.forEach(
            item => {

                mensaje +=
                    `• ${item.cantidad} x ` +
                    `${item.producto} - ` +
                    `Q${formatearNumero(
                        item.subtotal
                    )}\n`;

            }
        );


        mensaje +=
            `\n💰 *TOTAL: Q${formatearNumero(
                pedidoActual.total
            )}*\n`;


        if (pedidoActual.notas) {

            mensaje +=
                `\n📝 *Observaciones:* ` +
                `${pedidoActual.notas}`;

        }


        const url =
            `https://wa.me/${WHATSAPP_EMPRESA}` +
            `?text=${encodeURIComponent(
                mensaje
            )}`;


        window.open(
            url,
            "_blank"
        );

    }


    /* =====================================
       FINALIZAR
    ===================================== */

    function finalizarPedido() {

        modalExito.classList.remove(
            "show"
        );

        pedidoActual = null;

    }


    /* =====================================
       LOCAL STORAGE
    ===================================== */

    function cargarCarrito() {

        try {

            const datos =
                localStorage.getItem(
                    STORAGE_CARRITO
                );


            if (!datos) {

                return [];

            }


            const carritoGuardado =
                JSON.parse(datos);


            return Array.isArray(
                carritoGuardado
            )
                ? carritoGuardado
                : [];

        } catch (error) {

            console.error(
                "Error cargando carrito:",
                error
            );

            return [];

        }

    }


    function guardarCarrito() {

        localStorage.setItem(
            STORAGE_CARRITO,
            JSON.stringify(carrito)
        );

    }


    function cargarPedidos() {

        try {

            const datos =
                localStorage.getItem(
                    STORAGE_PEDIDOS
                );


            if (!datos) {

                return [];

            }


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


    /* =====================================
       TEMA
    ===================================== */

    function cargarTema() {

        const tema =
            localStorage.getItem(
                STORAGE_TEMA
            );


        if (tema === "dark") {

            document.body.classList.add(
                "dark"
            );

        }

    }


    function cambiarTema() {

        document.body.classList.toggle(
            "dark"
        );


        const oscuro =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            STORAGE_TEMA,
            oscuro
                ? "dark"
                : "light"
        );


        const boton =
            document.getElementById(
                "btnTema"
            );


        if (boton) {

            boton.querySelector(
                "span"
            ).textContent =
                oscuro
                    ? "☀️"
                    : "🌙";

        }

    }


    /* =====================================
       FUNCIONES AUXILIARES
    ===================================== */

    function buscarProductoPorId(id) {

        return productos.find(
            producto =>
                producto.id === id
        );

    }


    function formatearNumero(numero) {

        return Number(numero).toLocaleString(
            "es-GT",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    function capitalizar(texto) {

        return texto.charAt(0).toUpperCase() +
               texto.slice(1);

    }


    /* =====================================
       TOAST
    ===================================== */

    let toastTimer;


    function mostrarToast(mensaje) {

        toastMensaje.textContent =
            mensaje;


        toast.classList.add("show");


        clearTimeout(toastTimer);


        toastTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 3000);

    }

});