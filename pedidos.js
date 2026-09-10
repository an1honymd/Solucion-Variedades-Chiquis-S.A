const PEDIDOS_KEY = "pedidosChiquis";
const CLIENTES_KEY = "clientesChiquis";
const THEME_KEY = "temaChiquis";

let pedidos = [];
let clientes = [];
let pedidoDetalleActual = null;
let toastTimer = null;

const $ = id => document.getElementById(id);


/* =========================================================
   UTILIDADES
   ========================================================= */

function escaparHTML(texto) {

    const div = document.createElement("div");

    div.textContent = texto ?? "";

    return div.innerHTML;
}

function dinero(valor) {

    return Number(valor || 0).toLocaleString(
        "es-GT",
        {
            style: "currency",
            currency: "GTQ"
        }
    );
}

function generarId() {

    return Date.now().toString() +
        Math.random().toString(36).substring(2, 8);
}

function mostrarToast(mensaje) {

    const toast = $("toast");

    toast.textContent = mensaje;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* =========================================================
   STORAGE
   ========================================================= */

function cargarPedidos() {

    try {
        pedidos =
            JSON.parse(
                localStorage.getItem(PEDIDOS_KEY)
            ) || [];
    } catch {
        pedidos = [];
    }
}

function guardarPedidos() {

    localStorage.setItem(
        PEDIDOS_KEY,
        JSON.stringify(pedidos)
    );
}

function cargarClientes() {

    try {
        clientes =
            JSON.parse(
                localStorage.getItem(CLIENTES_KEY)
            ) || [];
    } catch {
        clientes = [];
    }
}


/* =========================================================
   TEMA
   ========================================================= */

function aplicarTema() {

    if (
        localStorage.getItem(THEME_KEY) === "dark"
    ) {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }
}

function cambiarTema() {

    const oscuro =
        document.body.classList.toggle("dark-theme");

    localStorage.setItem(
        THEME_KEY,
        oscuro ? "dark" : "light"
    );
}


/* =========================================================
   PEDIDOS
   ========================================================= */

function generarNumeroPedido() {

    const numero = pedidos.length + 1;

    return "PED-" +
        String(numero).padStart(4, "0");
}

function fechaActualInput() {

    const fecha = new Date();

    const año = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
}

function formatearFecha(fecha) {

    if (!fecha) return "—";

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function cargarClientesEnSelect() {

    const select = $("pedidoCliente");

    select.innerHTML =
        `<option value="">Selecciona un cliente</option>`;

    clientes.forEach(cliente => {

        const option =
            document.createElement("option");

        option.value = cliente.id;

        option.textContent =
            `${cliente.nombre} - ${cliente.telefono || "Sin teléfono"}`;

        select.appendChild(option);
    });
}


/* =========================================================
   PRODUCTOS
   ========================================================= */

function agregarFilaProducto(producto = {}) {

    const contenedor = $("productosPedido");

    const fila =
        document.createElement("div");

    fila.className = "producto-row";

    fila.innerHTML = `

        <div>
            <label>Producto</label>

            <input
                type="text"
                class="producto-nombre"
                placeholder="Nombre del producto"
                value="${escaparHTML(producto.nombre || "")}"
            >
        </div>

        <div>
            <label>Cantidad</label>

            <input
                type="number"
                class="producto-cantidad"
                min="1"
                value="${producto.cantidad || 1}"
            >
        </div>

        <div>
            <label>Precio</label>

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
            title="Eliminar producto"
        >
            ×
        </button>

    `;

    fila
        .querySelector(".btn-eliminar-producto")
        .addEventListener(
            "click",
            () => {

                fila.remove();

                if (
                    !$("productosPedido")
                        .children.length
                ) {
                    agregarFilaProducto();
                }

                calcularTotales();
            }
        );

    fila
        .querySelector(".producto-cantidad")
        .addEventListener(
            "input",
            calcularTotales
        );

    fila
        .querySelector(".producto-precio")
        .addEventListener(
            "input",
            calcularTotales
        );

    contenedor.appendChild(fila);
}

function obtenerProductos() {

    const filas =
        document.querySelectorAll(
            ".producto-row"
        );

    const productos = [];

    filas.forEach(fila => {

        const nombre =
            fila.querySelector(
                ".producto-nombre"
            ).value.trim();

        const cantidad =
            Number(
                fila.querySelector(
                    ".producto-cantidad"
                ).value
            ) || 0;

        const precio =
            Number(
                fila.querySelector(
                    ".producto-precio"
                ).value
            ) || 0;

        if (nombre || cantidad || precio) {

            productos.push({
                nombre,
                cantidad,
                precio,
                subtotal: cantidad * precio
            });
        }
    });

    return productos;
}


/* =========================================================
   TOTALES
   ========================================================= */

function calcularTotales() {

    const productos = obtenerProductos();

    const subtotal =
        productos.reduce(
            (total, producto) =>
                total + producto.subtotal,
            0
        );

    const cliente =
        clientes.find(
            c => c.id === $("pedidoCliente").value
        );

    const porcentaje =
        Number(cliente?.descuento || 0);

    const descuento =
        subtotal * (porcentaje / 100);

    const total =
        subtotal - descuento;

    $("pedidoSubtotal").textContent =
        dinero(subtotal);

    $("pedidoDescuento").textContent =
        dinero(descuento);

    $("pedidoTotal").textContent =
        dinero(total);
}


/* =========================================================
   ABRIR PANEL
   ========================================================= */

function abrirPanelPedido(pedido = null) {

    cargarClientesEnSelect();

    if (pedido) {

        $("tituloPanelPedido").textContent =
            "Editar pedido";

        $("pedidoId").value =
            pedido.id;

        $("pedidoNumero").value =
            pedido.numero;

        $("pedidoFecha").value =
            pedido.fecha;

        $("pedidoCliente").value =
            pedido.clienteId || "";

        $("pedidoOrigen").value =
            pedido.origen || "Tienda";

        $("pedidoEstado").value =
            pedido.estado || "pendiente";

        $("pedidoDireccion").value =
            pedido.direccion || "";

        $("pedidoNotas").value =
            pedido.notas || "";

        $("productosPedido").innerHTML = "";

        if (
            pedido.productos &&
            pedido.productos.length
        ) {

            pedido.productos.forEach(
                producto =>
                    agregarFilaProducto(producto)
            );

        } else {

            agregarFilaProducto();
        }

    } else {

        $("tituloPanelPedido").textContent =
            "Nuevo pedido";

        $("pedidoForm").reset();

        $("pedidoId").value = "";

        $("pedidoNumero").value =
            generarNumeroPedido();

        $("pedidoFecha").value =
            fechaActualInput();

        $("pedidoOrigen").value =
            "Tienda";

        $("pedidoEstado").value =
            "pendiente";

        $("pedidoDireccion").value = "";
        $("pedidoNotas").value = "";

        $("productosPedido").innerHTML = "";

        agregarFilaProducto();
    }

    calcularTotales();

    $("overlay").classList.add("show");

    $("pedidoPanel").classList.add("show");

    document.body.classList.add("modal-open");
}

function cerrarPanelPedido() {

    $("pedidoPanel").classList.remove("show");

    $("overlay").classList.remove("show");

    document.body.classList.remove("modal-open");
}


/* =========================================================
   VALIDACIÓN
   ========================================================= */

function validarPedido() {

    if (!$("pedidoFecha").value) {

        mostrarToast("Selecciona una fecha.");

        return false;
    }

    if (!$("pedidoCliente").value) {

        mostrarToast(
            "Selecciona un cliente."
        );

        return false;
    }

    const productos =
        obtenerProductos();

    if (!productos.length) {

        mostrarToast(
            "Agrega al menos un producto."
        );

        return false;
    }

    for (const producto of productos) {

        if (!producto.nombre) {

            mostrarToast(
                "Todos los productos necesitan nombre."
            );

            return false;
        }

        if (producto.cantidad <= 0) {

            mostrarToast(
                "La cantidad debe ser mayor que cero."
            );

            return false;
        }

        if (producto.precio < 0) {

            mostrarToast(
                "El precio no puede ser negativo."
            );

            return false;
        }
    }

    return true;
}


/* =========================================================
   GUARDAR
   ========================================================= */

function guardarPedido(evento) {

    evento.preventDefault();

    if (!validarPedido()) {
        return;
    }

    const cliente =
        clientes.find(
            c => c.id === $("pedidoCliente").value
        );

    const productos =
        obtenerProductos();

    const subtotal =
        productos.reduce(
            (total, producto) =>
                total + producto.subtotal,
            0
        );

    const descuentoPorcentaje =
        Number(cliente?.descuento || 0);

    const descuento =
        subtotal *
        descuentoPorcentaje /
        100;

    const total =
        subtotal - descuento;

    const id =
        $("pedidoId").value ||
        generarId();

    const pedido = {

        id,

        numero:
            $("pedidoNumero").value,

        fecha:
            $("pedidoFecha").value,

        clienteId:
            $("pedidoCliente").value,

        origen:
            $("pedidoOrigen").value,

        estado:
            $("pedidoEstado").value,

        productos,

        subtotal,

        descuento,

        total,

        direccion:
            $("pedidoDireccion").value.trim(),

        notas:
            $("pedidoNotas").value.trim(),

        fechaCreacion:
            new Date().toISOString()

    };

    const indice =
        pedidos.findIndex(
            p => p.id === id
        );

    if (indice !== -1) {

        pedidos[indice] = {
            ...pedidos[indice],
            ...pedido
        };

        mostrarToast(
            "Pedido actualizado correctamente."
        );

    } else {

        pedidos.push(pedido);

        mostrarToast(
            "Pedido guardado correctamente."
        );
    }

    guardarPedidos();

    mostrarPedidos();

    actualizarEstadisticasPedidos();

    cerrarPanelPedido();
}


/* =========================================================
   TABLA
   ========================================================= */

function obtenerNombreCliente(id) {

    const cliente =
        clientes.find(c => c.id === id);

    return cliente
        ? cliente.nombre
        : "Cliente eliminado";
}

function textoEstado(estado) {

    const estados = {

        pendiente: "Pendiente",
        preparando: "Preparando",
        enviado: "Enviado",
        entregado: "Entregado",
        cancelado: "Cancelado"

    };

    return estados[estado] || estado;
}

function obtenerPedidosFiltrados() {

    const texto =
        $("searchPedidos")
            .value
            .trim()
            .toLowerCase();

    const estado =
        $("filtroEstado").value;

    return pedidos.filter(pedido => {

        const nombreCliente =
            obtenerNombreCliente(
                pedido.clienteId
            ).toLowerCase();

        const coincideTexto =
            !texto ||
            (pedido.numero || "")
                .toLowerCase()
                .includes(texto) ||
            nombreCliente.includes(texto);

        const coincideEstado =
            !estado ||
            pedido.estado === estado;

        return coincideTexto &&
            coincideEstado;
    });
}

function mostrarPedidos() {

    const body =
        $("pedidosBody");

    const empty =
        $("emptyPedidos");

    const lista =
        obtenerPedidosFiltrados();

    body.innerHTML = "";

    if (!lista.length) {

        empty.style.display = "block";

        return;
    }

    empty.style.display = "none";

    lista
        .slice()
        .reverse()
        .forEach(pedido => {

            const fila =
                document.createElement("tr");

            const estado =
                pedido.estado || "pendiente";

            fila.innerHTML = `

                <td>

                    <div class="order-number">
                        ${escaparHTML(pedido.numero)}
                    </div>

                    <div class="order-date">
                        ${formatearFecha(pedido.fecha)}
                    </div>

                </td>

                <td>
                    ${escaparHTML(
                        obtenerNombreCliente(
                            pedido.clienteId
                        )
                    )}
                </td>

                <td>
                    ${formatearFecha(pedido.fecha)}
                </td>

                <td>
                    ${escaparHTML(
                        pedido.origen || "—"
                    )}
                </td>

                <td>

                    <span class="badge badge-${estado}">
                        ${textoEstado(estado)}
                    </span>

                </td>

                <td>
                    <strong>
                        ${dinero(pedido.total)}
                    </strong>
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="action-btn"
                            title="Ver"
                            onclick="mostrarDetallePedido('${pedido.id}')"
                        >
                            👁
                        </button>

                        <button
                            class="action-btn"
                            title="Editar"
                            onclick="editarPedido('${pedido.id}')"
                        >
                            ✎
                        </button>

                        <button
                            class="action-btn"
                            title="WhatsApp"
                            onclick="enviarPedidoWhatsApp('${pedido.id}')"
                        >
                            ☎
                        </button>

                        <button
                            class="action-btn"
                            title="Eliminar"
                            onclick="eliminarPedido('${pedido.id}')"
                        >
                            🗑
                        </button>

                    </div>

                </td>
            `;

            body.appendChild(fila);
        });
}


/* =========================================================
   ESTADÍSTICAS
   ========================================================= */

function actualizarEstadisticasPedidos() {

    $("totalPedidos").textContent =
        pedidos.length;

    $("pedidosPendientes").textContent =
        pedidos.filter(
            p =>
                p.estado === "pendiente"
        ).length;

    $("pedidosEntregados").textContent =
        pedidos.filter(
            p =>
                p.estado === "entregado"
        ).length;

    const ventas =
        pedidos
            .filter(
                p =>
                    p.estado !== "cancelado"
            )
            .reduce(
                (total, p) =>
                    total +
                    Number(p.total || 0),
                0
            );

    $("ventasPedidos").textContent =
        dinero(ventas);
}


/* =========================================================
   DETALLE
   ========================================================= */

function mostrarDetallePedido(id) {

    const pedido =
        pedidos.find(
            p => p.id === id
        );

    if (!pedido) return;

    pedidoDetalleActual = pedido;

    $("detallePedidoNumero").textContent =
        pedido.numero;

    const cliente =
        clientes.find(
            c => c.id === pedido.clienteId
        );

    let productosHTML = "";

    (pedido.productos || [])
        .forEach(producto => {

            productosHTML += `

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:10px 0;
                    border-bottom:1px solid #e5e7eb;
                ">

                    <span>
                        ${escaparHTML(producto.nombre)}
                        × ${producto.cantidad}
                    </span>

                    <strong>
                        ${dinero(producto.subtotal)}
                    </strong>

                </div>

            `;
        });

    $("detallePedidoContenido").innerHTML = `

        <p>
            <strong>Cliente:</strong>
            ${escaparHTML(
                cliente?.nombre ||
                "Cliente eliminado"
            )}
        </p>

        <p>
            <strong>Fecha:</strong>
            ${formatearFecha(pedido.fecha)}
        </p>

        <p>
            <strong>Estado:</strong>
            ${textoEstado(pedido.estado)}
        </p>

        <p>
            <strong>Origen:</strong>
            ${escaparHTML(pedido.origen)}
        </p>

        <hr style="margin:15px 0;">

        <h3 style="margin-bottom:10px;">
            Productos
        </h3>

        ${productosHTML}

        <div style="
            margin-top:15px;
            text-align:right;
        ">

            <p>
                Subtotal:
                <strong>${dinero(pedido.subtotal)}</strong>
            </p>

            <p>
                Descuento:
                <strong>${dinero(pedido.descuento)}</strong>
            </p>

            <h2 style="margin-top:8px;">
                Total:
                ${dinero(pedido.total)}
            </h2>

        </div>

        <hr style="margin:15px 0;">

        <p>
            <strong>Dirección:</strong><br>
            ${escaparHTML(
                pedido.direccion || "Sin dirección"
            )}
        </p>

        <p style="margin-top:12px;">
            <strong>Notas:</strong><br>
            ${escaparHTML(
                pedido.notas || "Sin notas"
            )}
        </p>
    `;

    $("dialogPedidoDetalle").showModal();
}

function cerrarDetallePedido() {

    const dialog =
        $("dialogPedidoDetalle");

    if (dialog.open) {
        dialog.close();
    }
}

function editarPedido(id) {

    const pedido =
        pedidos.find(
            p => p.id === id
        );

    if (pedido) {
        abrirPanelPedido(pedido);
    }
}

function eliminarPedido(id) {

    const pedido =
        pedidos.find(
            p => p.id === id
        );

    if (!pedido) return;

    const confirmar =
        confirm(
            `¿Deseas eliminar el pedido ${pedido.numero}?`
        );

    if (!confirmar) return;

    pedidos =
        pedidos.filter(
            p => p.id !== id
        );

    guardarPedidos();

    mostrarPedidos();

    actualizarEstadisticasPedidos();

    mostrarToast(
        "Pedido eliminado correctamente."
    );
}


/* =========================================================
   WHATSAPP
   ========================================================= */

function enviarPedidoWhatsApp(id) {

    const pedido =
        pedidos.find(
            p => p.id === id
        );

    if (!pedido) return;

    const cliente =
        clientes.find(
            c => c.id === pedido.clienteId
        );

    if (!cliente?.telefono) {

        mostrarToast(
            "El cliente no tiene teléfono."
        );

        return;
    }

    let telefono =
        cliente.telefono.replace(/\D/g, "");

    if (telefono.length === 8) {
        telefono = "502" + telefono;
    }

    let mensaje =
        `Hola ${cliente.nombre}, le escribimos de Variedades Chiquis.%0A%0A`;

    mensaje +=
        `Pedido: ${pedido.numero}%0A`;

    mensaje +=
        `Total: ${dinero(pedido.total)}%0A`;

    mensaje +=
        `Estado: ${textoEstado(pedido.estado)}`;

    window.open(
        `https://wa.me/${telefono}?text=${mensaje}`,
        "_blank"
    );
}


/* =========================================================
   EXPORTAR
   ========================================================= */

function exportarPedidos() {

    const archivo =
        new Blob(
            [JSON.stringify(
                pedidos,
                null,
                2
            )],
            {
                type: "application/json"
            }
        );

    const url =
        URL.createObjectURL(archivo);

    const enlace =
        document.createElement("a");

    enlace.href = url;

    enlace.download =
        "pedidosChiquis.json";

    enlace.click();

    URL.revokeObjectURL(url);

    mostrarToast(
        "Pedidos exportados correctamente."
    );
}


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarPedidos();

        cargarClientes();

        aplicarTema();

        mostrarPedidos();

        actualizarEstadisticasPedidos();


        $("btnNuevoPedido")
            .addEventListener(
                "click",
                () => abrirPanelPedido()
            );


        $("btnNuevoPedidoVacio")
            .addEventListener(
                "click",
                () => abrirPanelPedido()
            );


        $("btnCerrarPedido")
            .addEventListener(
                "click",
                cerrarPanelPedido
            );


        $("btnCancelarPedido")
            .addEventListener(
                "click",
                cerrarPanelPedido
            );


        $("overlay")
            .addEventListener(
                "click",
                cerrarPanelPedido
            );


        $("pedidoForm")
            .addEventListener(
                "submit",
                guardarPedido
            );


        $("btnAgregarProducto")
            .addEventListener(
                "click",
                () => {
                    agregarFilaProducto();
                    calcularTotales();
                }
            );


        $("pedidoCliente")
            .addEventListener(
                "change",
                calcularTotales
            );


        $("searchPedidos")
            .addEventListener(
                "input",
                mostrarPedidos
            );


        $("filtroEstado")
            .addEventListener(
                "change",
                mostrarPedidos
            );


        $("btnLimpiarPedidos")
            .addEventListener(
                "click",
                () => {

                    $("searchPedidos").value = "";

                    $("filtroEstado").value = "";

                    mostrarPedidos();
                }
            );


        $("btnExportarPedidos")
            .addEventListener(
                "click",
                exportarPedidos
            );


        $("btnTema")
            .addEventListener(
                "click",
                cambiarTema
            );


        $("btnCerrarDetalle")
            .addEventListener(
                "click",
                cerrarDetallePedido
            );


        document.addEventListener(
            "keydown",
            evento => {

                if (evento.key === "Escape") {

                    cerrarPanelPedido();

                    cerrarDetallePedido();
                }

                if (
                    evento.ctrlKey &&
                    evento.key.toLowerCase() === "n"
                ) {

                    evento.preventDefault();

                    abrirPanelPedido();
                }

            }
        );

    }
);