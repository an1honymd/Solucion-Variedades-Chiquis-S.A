const CLIENTES_KEY = "clientesChiquis";
const PEDIDOS_KEY = "pedidosChiquis";


let clientes =
    JSON.parse(
        localStorage.getItem(CLIENTES_KEY)
    ) || [];


let pedidos =
    JSON.parse(
        localStorage.getItem(PEDIDOS_KEY)
    ) || [];


let filtroActual = "todos";
let pedidoEliminar = null;


/* ELEMENTOS */

const tablaPedidos =
    document.getElementById("tablaPedidos");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const btnNuevoPedido =
    document.getElementById("btnNuevoPedido");

const btnNuevoVacio =
    document.getElementById("btnNuevoVacio");

const panel =
    document.getElementById("panel");

const overlay =
    document.getElementById("overlay");

const pedidoForm =
    document.getElementById("pedidoForm");

const productosContainer =
    document.getElementById("productosContainer");

const totalPedido =
    document.getElementById("totalPedido");

const clienteSelect =
    document.getElementById("cliente");

const fechaPedido =
    document.getElementById("fechaPedido");

const btnAgregarProducto =
    document.getElementById("btnAgregarProducto");

const toast =
    document.getElementById("toast");


/* INICIO */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarClientes();

        renderPedidos();

    }
);


/* GUARDAR */

function guardarPedidos() {

    localStorage.setItem(
        PEDIDOS_KEY,
        JSON.stringify(pedidos)
    );

}


/* ESCAPAR */

function escapeHTML(texto) {

    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* CARGAR CLIENTES */

function cargarClientes() {

    clienteSelect.innerHTML = `

        <option value="">
            Selecciona un cliente
        </option>

    `;


    if (clientes.length === 0) {

        document.getElementById(
            "sinClientes"
        ).textContent =
            "No hay clientes registrados. Registra uno primero.";

        return;

    }


    document.getElementById(
        "sinClientes"
    ).textContent =
        "Selecciona uno de los clientes registrados.";


    clientes.forEach(cliente => {

        const option =
            document.createElement("option");


        option.value =
            cliente.id;


        option.textContent =
            `${cliente.nombre} - ${cliente.telefono}`;


        clienteSelect.appendChild(option);

    });

}


/* GENERAR NUMERO */

function generarNumeroPedido() {

    const numero =
        pedidos.length + 1;


    return "PED-" +
        String(numero).padStart(4, "0");

}


/* ABRIR PANEL */

function abrirPanel(pedido = null) {

    pedidoForm.reset();

    productosContainer.innerHTML = "";

    document.getElementById(
        "panelTitulo"
    ).textContent =
        pedido
            ? "Editar pedido"
            : "Nuevo pedido";


    document.getElementById(
        "pedidoId"
    ).value =
        pedido
            ? pedido.id
            : "";


    fechaPedido.value =
        pedido
            ? pedido.fecha
            : obtenerFechaActual();


    if (pedido) {

        clienteSelect.value =
            pedido.clienteId;


        document.getElementById(
            "estado"
        ).value =
            pedido.estado;


        document.getElementById(
            "observaciones"
        ).value =
            pedido.observaciones || "";


        pedido.productos.forEach(producto => {

            agregarProducto(producto);

        });

    } else {

        agregarProducto();

    }


    calcularTotal();


    panel.classList.add("active");

    overlay.classList.add("active");

}


/* CERRAR */

function cerrarPanel() {

    panel.classList.remove("active");

    overlay.classList.remove("active");

}


/* FECHA */

function obtenerFechaActual() {

    const fecha =
        new Date();


    const año =
        fecha.getFullYear();


    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            fecha.getDate()
        ).padStart(2, "0");


    return `${año}-${mes}-${dia}`;

}


/* NUEVO */

btnNuevoPedido.addEventListener(
    "click",
    () => {

        cargarClientes();

        abrirPanel();

    }
);


btnNuevoVacio.addEventListener(
    "click",
    () => {

        cargarClientes();

        abrirPanel();

    }
);


/* CERRAR */

document.getElementById(
    "btnCerrarPanel"
).addEventListener(
    "click",
    cerrarPanel
);


document.getElementById(
    "btnCancelar"
).addEventListener(
    "click",
    cerrarPanel
);


overlay.addEventListener(
    "click",
    cerrarPanel
);


/* AGREGAR PRODUCTO */

btnAgregarProducto.addEventListener(
    "click",
    () => agregarProducto()
);


/* CREAR PRODUCTO */

function agregarProducto(producto = null) {

    const fila =
        document.createElement("div");


    fila.className =
        "product-row";


    fila.innerHTML = `

        <div class="product-row-grid">


            <div>

                <label>
                    Producto
                </label>

                <input
                    type="text"
                    class="producto-nombre"
                    placeholder="Ej. Camiseta"
                    value="${escapeHTML(
                        producto?.nombre || ""
                    )}"
                    required
                >

            </div>


            <div>

                <label>
                    Cantidad
                </label>

                <input
                    type="number"
                    class="producto-cantidad"
                    min="1"
                    value="${producto?.cantidad || 1}"
                    required
                >

            </div>


            <div>

                <label>
                    Precio
                </label>

                <input
                    type="number"
                    class="producto-precio"
                    min="0"
                    step="0.01"
                    value="${producto?.precio || 0}"
                    required
                >

            </div>


            <button
                type="button"
                class="remove-product"
                title="Eliminar producto"
            >
                ×
            </button>


        </div>

    `;


    productosContainer.appendChild(fila);


    fila.querySelector(
        ".remove-product"
    ).addEventListener(
        "click",
        () => {

            fila.remove();

            calcularTotal();

        }
    );


    fila.querySelectorAll(
        "input"
    ).forEach(input => {

        input.addEventListener(
            "input",
            calcularTotal
        );

    });

}


/* CALCULAR */

function calcularTotal() {

    let total = 0;


    document.querySelectorAll(
        ".product-row"
    ).forEach(fila => {

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


        total +=
            cantidad * precio;

    });


    totalPedido.textContent =
        formatearMoneda(total);

}


/* MONEDA */

function formatearMoneda(valor) {

    return "Q" +
        Number(valor)
            .toLocaleString(
                "es-GT",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

}


/* GUARDAR PEDIDO */

pedidoForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const id =
            document.getElementById(
                "pedidoId"
            ).value;


        const clienteId =
            clienteSelect.value;


        const fecha =
            fechaPedido.value;


        const estado =
            document.getElementById(
                "estado"
            ).value;


        const observaciones =
            document.getElementById(
                "observaciones"
            ).value.trim();


        if (!clienteId) {

            mostrarToast(
                "Selecciona un cliente"
            );

            return;

        }


        if (!fecha) {

            mostrarToast(
                "Selecciona la fecha del pedido"
            );

            return;

        }


        const filas =
            document.querySelectorAll(
                ".product-row"
            );


        if (filas.length === 0) {

            mostrarToast(
                "Agrega al menos un producto"
            );

            return;

        }


        const productos = [];


        let total = 0;


        let productoInvalido = false;


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
                );


            const precio =
                Number(
                    fila.querySelector(
                        ".producto-precio"
                    ).value
                );


            if (
                !nombre ||
                cantidad <= 0 ||
                precio < 0
            ) {

                productoInvalido = true;

                return;

            }


            const subtotal =
                cantidad * precio;


            productos.push({

                nombre,

                cantidad,

                precio,

                subtotal

            });


            total += subtotal;

        });


        if (productoInvalido) {

            mostrarToast(
                "Revisa los productos y sus cantidades"
            );

            return;

        }


        const cliente =
            clientes.find(
                c => c.id === clienteId
            );


        if (!cliente) {

            mostrarToast(
                "El cliente seleccionado no existe"
            );

            return;

        }


        if (id) {

            const indice =
                pedidos.findIndex(
                    p => p.id === id
                );


            if (indice !== -1) {

                pedidos[indice] = {

                    ...pedidos[indice],

                    clienteId,

                    clienteNombre:
                        cliente.nombre,

                    fecha,

                    estado,

                    productos,

                    total,

                    observaciones

                };

            }


            mostrarToast(
                "Pedido actualizado correctamente"
            );

        } else {

            pedidos.push({

                id:
                    Date.now().toString(),

                numero:
                    generarNumeroPedido(),

                clienteId,

                clienteNombre:
                    cliente.nombre,

                fecha,

                estado,

                productos,

                total,

                observaciones,

                creado:
                    new Date().toISOString()

            });


            mostrarToast(
                "Pedido registrado correctamente"
            );

        }


        guardarPedidos();

        renderPedidos();

        cerrarPanel();

    }
);


/* RENDER */

function renderPedidos() {

    const texto =
        searchInput.value
            .toLowerCase()
            .trim();


    const filtrados =
        pedidos.filter(pedido => {

            const coincideEstado =
                filtroActual === "todos" ||
                pedido.estado === filtroActual;


            const coincideBusqueda =
                pedido.numero
                    .toLowerCase()
                    .includes(texto) ||

                pedido.clienteNombre
                    .toLowerCase()
                    .includes(texto);


            return (
                coincideEstado &&
                coincideBusqueda
            );

        });


    tablaPedidos.innerHTML = "";


    if (filtrados.length === 0) {

        document.querySelector(
            ".table-wrapper"
        ).style.display = "none";


        emptyState.style.display =
            "block";

    } else {

        document.querySelector(
            ".table-wrapper"
        ).style.display = "block";


        emptyState.style.display =
            "none";


        filtrados.forEach(pedido => {

            const fila =
                document.createElement("tr");


            const estadoTexto =
                obtenerEstadoTexto(
                    pedido.estado
                );


            fila.innerHTML = `

                <td>

                    <span class="order-number">
                        ${escapeHTML(
                            pedido.numero
                        )}
                    </span>

                </td>


                <td>

                    <span class="order-client">
                        ${escapeHTML(
                            pedido.clienteNombre
                        )}
                    </span>

                </td>


                <td>

                    <span class="product-count">
                        ${pedido.productos.length}
                        producto(s)
                    </span>

                </td>


                <td>

                    ${formatearFecha(
                        pedido.fecha
                    )}

                </td>


                <td>

                    <span class="status status-${pedido.estado}">
                        ${estadoTexto}
                    </span>

                </td>


                <td>

                    <span class="total">
                        ${formatearMoneda(
                            pedido.total
                        )}
                    </span>

                </td>


                <td>

                    <div class="actions">

                        <button
                            class="action-btn"
                            onclick="editarPedido('${pedido.id}')"
                            title="Editar"
                        >
                            ✏️
                        </button>


                        <button
                            class="action-btn"
                            onclick="eliminarPedido('${pedido.id}')"
                            title="Eliminar"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            `;


            tablaPedidos.appendChild(fila);

        });

    }


    actualizarEstadisticas(
        filtrados.length
    );

}


/* ESTADO */

function obtenerEstadoTexto(estado) {

    const estados = {

        pendiente: "Pendiente",

        proceso: "En proceso",

        entregado: "Entregado",

        cancelado: "Cancelado"

    };


    return estados[estado] || estado;

}


/* FECHA FORMATEADA */

function formatearFecha(fecha) {

    if (!fecha) return "";


    const partes =
        fecha.split("-");


    if (partes.length !== 3) {

        return fecha;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* ESTADÍSTICAS */

function actualizarEstadisticas(
    cantidadVisible
) {

    const total =
        pedidos.length;


    const pendientes =
        pedidos.filter(
            p => p.estado === "pendiente"
        ).length;


    const entregados =
        pedidos.filter(
            p => p.estado === "entregado"
        ).length;


    const ventas =
        pedidos
            .filter(
                p => p.estado !== "cancelado"
            )
            .reduce(
                (suma, p) =>
                    suma + Number(p.total),
                0
            );


    document.getElementById(
        "statPedidos"
    ).textContent =
        total;


    document.getElementById(
        "statPendientes"
    ).textContent =
        pendientes;


    document.getElementById(
        "statEntregados"
    ).textContent =
        entregados;


    document.getElementById(
        "statVentas"
    ).textContent =
        formatearMoneda(ventas);


    document.getElementById(
        "contadorPedidos"
    ).textContent =

        `${cantidadVisible} pedido${
            cantidadVisible === 1
                ? ""
                : "s"
        }`;

}


/* EDITAR */

window.editarPedido =
    function(id) {

        const pedido =
            pedidos.find(
                p => p.id === id
            );


        if (!pedido) return;


        cargarClientes();

        abrirPanel(pedido);

    };


/* ELIMINAR */

window.eliminarPedido =
    function(id) {

        pedidoEliminar = id;


        const pedido =
            pedidos.find(
                p => p.id === id
            );


        if (!pedido) return;


        document.getElementById(
            "dialogNumeroPedido"
        ).textContent =
            pedido.numero;


        document.getElementById(
            "dialogEliminar"
        ).showModal();

    };


/* CONFIRMAR */

document.getElementById(
    "btnConfirmarEliminar"
).addEventListener(
    "click",
    () => {

        if (!pedidoEliminar) return;


        pedidos =
            pedidos.filter(
                p =>
                    p.id !== pedidoEliminar
            );


        guardarPedidos();

        renderPedidos();


        document.getElementById(
            "dialogEliminar"
        ).close();


        mostrarToast(
            "Pedido eliminado correctamente"
        );


        pedidoEliminar = null;

    }
);


/* CANCELAR ELIMINACIÓN */

document.getElementById(
    "btnCancelarEliminar"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "dialogEliminar"
        ).close();


        pedidoEliminar = null;

    }
);


/* BUSCAR */

searchInput.addEventListener(
    "input",
    renderPedidos
);


/* FILTROS */

document.querySelectorAll(
    ".filter"
).forEach(boton => {

    boton.addEventListener(
        "click",
        () => {

            document.querySelectorAll(
                ".filter"
            ).forEach(
                b =>
                    b.classList.remove(
                        "is-active"
                    )
            );


            boton.classList.add(
                "is-active"
            );


            filtroActual =
                boton.dataset.filter;


            renderPedidos();

        }
    );

});


/* TOAST */

function mostrarToast(mensaje) {

    toast.textContent =
        mensaje;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* ESCAPE */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            panel.classList.contains(
                "active"
            )
        ) {

            cerrarPanel();

        }

    }
);