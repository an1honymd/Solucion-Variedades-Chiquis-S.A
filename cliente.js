document.addEventListener("DOMContentLoaded", function () {

    /* ==================== PEDIDOS ==================== */
    const btnNavClientes = document.getElementById("btnNavClientes");
    const btnNavPedidos = document.getElementById("btnNavPedidos");
    const clientesToolbar = document.getElementById("clientesToolbar");
    const clientesTableSection = document.getElementById("clientesTableSection");
    const pedidosView = document.getElementById("pedidosView");
    const pedidosStats = document.getElementById("pedidosStats");
    const tituloPrincipal = document.getElementById("tituloPrincipal");
    const descripcionPrincipal = document.getElementById("descripcionPrincipal");
    const textoBtnNuevo = document.getElementById("textoBtnNuevo");

    const btnNuevoPedido = document.getElementById("btnNuevoPedido");
    const btnNuevoPedidoVacio = document.getElementById("btnNuevoPedidoVacio");
    const pedidoPanel = document.getElementById("pedidoPanel");
    const pedidoForm = document.getElementById("pedidoForm");
    const btnCerrarPedidoPanel = document.getElementById("btnCerrarPedidoPanel");
    const btnCancelarPedido = document.getElementById("btnCancelarPedido");
    const pedidoPanelTitulo = document.getElementById("pedidoPanelTitulo");
    const pedidoId = document.getElementById("pedidoId");
    const pedidoNumero = document.getElementById("pedidoNumero");
    const pedidoFecha = document.getElementById("pedidoFecha");
    const pedidoCliente = document.getElementById("pedidoCliente");
    const pedidoOrigen = document.getElementById("pedidoOrigen");
    const pedidoEstado = document.getElementById("pedidoEstado");
    const productosPedido = document.getElementById("productosPedido");
    const btnAgregarProducto = document.getElementById("btnAgregarProducto");
    const pedidoSubtotal = document.getElementById("pedidoSubtotal");
    const pedidoDescuento = document.getElementById("pedidoDescuento");
    const pedidoTotal = document.getElementById("pedidoTotal");
    const pedidoDireccion = document.getElementById("pedidoDireccion");
    const pedidoNotas = document.getElementById("pedidoNotas");

    const pedidosBody = document.getElementById("pedidosBody");
    const emptyPedidos = document.getElementById("emptyPedidos");
    const searchPedidos = document.getElementById("searchPedidos");
    const btnLimpiarPedidos = document.getElementById("btnLimpiarPedidos");
    const resultadoPedidos = document.getElementById("resultadoPedidos");
    const footerPedidos = document.getElementById("footerPedidos");

    const statPedidos = document.getElementById("statPedidos");
    const statPedidosPendientes = document.getElementById("statPedidosPendientes");
    const statPedidosEntregados = document.getElementById("statPedidosEntregados");
    const statVentas = document.getElementById("statVentas");

    const countPedidosTodos = document.getElementById("countPedidosTodos");
    const countPedidosPendientes = document.getElementById("countPedidosPendientes");
    const countPedidosPreparando = document.getElementById("countPedidosPreparando");
    const countPedidosEntregados = document.getElementById("countPedidosEntregados");

    const dialogPedidoDetalle = document.getElementById("dialogPedidoDetalle");
    const btnCerrarPedidoDetalle = document.getElementById("btnCerrarPedidoDetalle");
    const detallePedidoNumero = document.getElementById("detallePedidoNumero");
    const detallePedidoEstado = document.getElementById("detallePedidoEstado");
    const detallePedidoCliente = document.getElementById("detallePedidoCliente");
    const detallePedidoTelefono = document.getElementById("detallePedidoTelefono");
    const detallePedidoFecha = document.getElementById("detallePedidoFecha");
    const detallePedidoOrigen = document.getElementById("detallePedidoOrigen");
    const detallePedidoDireccion = document.getElementById("detallePedidoDireccion");
    const detallePedidoTotal = document.getElementById("detallePedidoTotal");
    const detallePedidoProductos = document.getElementById("detallePedidoProductos");
    const detallePedidoNotas = document.getElementById("detallePedidoNotas");
    const btnEditarPedidoDetalle = document.getElementById("btnEditarPedidoDetalle");
    const btnWhatsAppPedido = document.getElementById("btnWhatsAppPedido");
    const btnEliminarPedidoDetalle = document.getElementById("btnEliminarPedidoDetalle");

    let pedidos = cargarPedidos();
    let pedidoDetalleActual = null;
    let filtroPedidoActual = "todos";

    function cargarPedidos() {
        try {
            const datos = localStorage.getItem("pedidosChiquis");
            return datos
                ? (Array.isArray(JSON.parse(datos))
                    ? JSON.parse(datos)
                    : [])
                : [];
        } catch (e) {
            console.error("Error cargando pedidos:", e);
            return [];
        }
    }

    function guardarPedidos() {
        localStorage.setItem(
            "pedidosChiquis",
            JSON.stringify(pedidos)
        );
    }

    function generarNumeroPedido() {
        const siguiente = pedidos.length + 1;

        return "PED-" +
            String(siguiente).padStart(4, "0");
    }

    function dinero(valor) {
        return "Q" +
            Number(valor || 0).toFixed(2);
    }

    function fechaInputActual() {

        const ahora = new Date();

        const local =
            new Date(
                ahora.getTime() -
                ahora.getTimezoneOffset() * 60000
            );

        return local
            .toISOString()
            .slice(0, 16);
    }

    function cargarClientesEnSelect(
        clienteSeleccionado = ""
    ) {

        pedidoCliente.innerHTML =
            '<option value="">Seleccione un cliente</option>';

        clientes.forEach(c => {

            const option =
                document.createElement("option");

            option.value = c.id;

            option.textContent =
                c.nombre +
                " — " +
                c.telefono;

            if (c.id === clienteSeleccionado) {
                option.selected = true;
            }

            pedidoCliente.appendChild(option);

        });

    }

    function calcularTotalesPedido() {

        let subtotal = 0;

        productosPedido
            .querySelectorAll(
                ".producto-pedido-row"
            )
            .forEach(row => {

                const cantidad =
                    Number(
                        row.querySelector(
                            ".producto-cantidad"
                        )?.value || 0
                    );

                const precio =
                    Number(
                        row.querySelector(
                            ".producto-precio"
                        )?.value || 0
                    );

                subtotal +=
                    cantidad * precio;

                const subtotalEl =
                    row.querySelector(
                        ".producto-subtotal"
                    );

                if (subtotalEl) {

                    subtotalEl.value =
                        dinero(
                            cantidad * precio
                        );

                }

            });

        const cliente =
            clientes.find(
                c =>
                    c.id ===
                    pedidoCliente.value
            );

        const porcentaje =
            cliente?.tipo === "mayorista"
                ? Number(
                    cliente.descuento || 0
                )
                : 0;

        const descuentoMonto =
            subtotal * porcentaje / 100;

        const total =
            subtotal -
            descuentoMonto;

        pedidoSubtotal.textContent =
            dinero(subtotal);

        pedidoDescuento.textContent =
            dinero(descuentoMonto);

        pedidoTotal.textContent =
            dinero(total);

        return {
            subtotal,
            descuento: descuentoMonto,
            total,
            porcentaje
        };
    }

    function agregarFilaProducto(
        producto = {}
    ) {

        const row =
            document.createElement("div");

        row.className =
            "producto-pedido-row";

        row.innerHTML = `
            <div>
                <label>Producto</label>
                <input
                    type="text"
                    class="producto-nombre"
                    maxlength="100"
                    placeholder="Ej. Camisa"
                    value="${escaparHTML(
                        producto.nombre || ""
                    )}"
                >
            </div>

            <div>
                <label>Cantidad</label>
                <input
                    type="number"
                    class="producto-cantidad"
                    min="1"
                    step="1"
                    value="${Number(
                        producto.cantidad || 1
                    )}"
                >
            </div>

            <div>
                <label>Precio unitario</label>
                <input
                    type="number"
                    class="producto-precio"
                    min="0"
                    step="0.01"
                    value="${Number(
                        producto.precio || 0
                    )}"
                >
            </div>

            <div>
                <label>Subtotal</label>
                <input
                    type="text"
                    class="producto-subtotal"
                    readonly
                    value="${dinero(
                        Number(
                            producto.cantidad || 1
                        ) *
                        Number(
                            producto.precio || 0
                        )
                    )}"
                >
            </div>

            <div>
                <button
                    type="button"
                    class="btn-quitar-producto"
                    title="Quitar producto"
                >
                    ×
                </button>
            </div>
        `;

        productosPedido.appendChild(row);

        row
            .querySelectorAll("input")
            .forEach(input => {

                input.addEventListener(
                    "input",
                    calcularTotalesPedido
                );

            });

        row
            .querySelector(
                ".btn-quitar-producto"
            )
            .addEventListener(
                "click",
                () => {

                    row.remove();

                    calcularTotalesPedido();

                }
            );

        calcularTotalesPedido();
    }

    function abrirPanelPedido(
        modo = "nuevo",
        pedido = null
    ) {

        overlay.hidden = false;

        pedidoPanel.classList.add(
            "is-open"
        );

        pedidoPanel.setAttribute(
            "aria-hidden",
            "false"
        );

        if (modo === "nuevo") {

            pedidoPanelTitulo.textContent =
                "Nuevo pedido";

            pedidoId.value = "";

            pedidoNumero.value =
                generarNumeroPedido();

            pedidoFecha.value =
                fechaInputActual();

            pedidoEstado.value =
                "pendiente";

            pedidoOrigen.value =
                "WhatsApp";

            cargarClientesEnSelect("");

            pedidoDireccion.value =
                "";

            pedidoNotas.value =
                "";

            productosPedido.innerHTML =
                "";

            agregarFilaProducto();

        } else if (pedido) {

            pedidoPanelTitulo.textContent =
                "Editar pedido";

            pedidoId.value =
                pedido.id;

            pedidoNumero.value =
                pedido.numero;

            pedidoFecha.value =
                pedido.fecha
                    ? new Date(
                        pedido.fecha
                    )
                        .toISOString()
                        .slice(0, 16)
                    : fechaInputActual();

            pedidoEstado.value =
                pedido.estado ||
                "pendiente";

            pedidoOrigen.value =
                pedido.origen ||
                "WhatsApp";

            cargarClientesEnSelect(
                pedido.clienteId
            );

            pedidoDireccion.value =
                pedido.direccion || "";

            pedidoNotas.value =
                pedido.notas || "";

            productosPedido.innerHTML =
                "";

            (pedido.productos || [])
                .forEach(
                    p =>
                        agregarFilaProducto(p)
                );

            if (
                !pedido.productos ||
                pedido.productos.length === 0
            ) {

                agregarFilaProducto();

            }

        }

        calcularTotalesPedido();
    }

    function cerrarPanelPedido() {

        pedidoPanel.classList.remove(
            "is-open"
        );

        pedidoPanel.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            !panel.classList.contains(
                "is-open"
            )
        ) {

            overlay.hidden = true;

        }

    }

    function obtenerPedidoFormulario() {

        const clienteId =
            pedidoCliente.value;

        const cliente =
            clientes.find(
                c =>
                    c.id === clienteId
            );

        if (!cliente) {

            mostrarToast(
                "Seleccione un cliente.",
                "error"
            );

            return null;

        }

        const productos = [];

        productosPedido
            .querySelectorAll(
                ".producto-pedido-row"
            )
            .forEach(row => {

                const nombre =
                    row.querySelector(
                        ".producto-nombre"
                    )?.value.trim();

                const cantidad =
                    Number(
                        row.querySelector(
                            ".producto-cantidad"
                        )?.value || 0
                    );

                const precio =
                    Number(
                        row.querySelector(
                            ".producto-precio"
                        )?.value || 0
                    );

                if (
                    nombre &&
                    cantidad > 0
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

        if (
            productos.length === 0
        ) {

            mostrarToast(
                "Agregue al menos un producto.",
                "error"
            );

            return null;

        }

        const totales =
            calcularTotalesPedido();

        return {

            id:
                pedidoId.value ||
                "pedido-" +
                Date.now(),

            numero:
                pedidoNumero.value,

            fecha:
                pedidoFecha.value
                    ? new Date(
                        pedidoFecha.value
                    ).toISOString()
                    : new Date().toISOString(),

            clienteId:
                cliente.id,

            clienteNombre:
                cliente.nombre,

            clienteTelefono:
                cliente.telefono,

            origen:
                pedidoOrigen.value,

            estado:
                pedidoEstado.value,

            productos,

            subtotal:
                totales.subtotal,

            descuento:
                totales.descuento,

            porcentajeDescuento:
                totales.porcentaje,

            total:
                totales.total,

            direccion:
                pedidoDireccion.value.trim(),

            notas:
                pedidoNotas.value.trim()

        };
    }

    pedidoCliente.addEventListener(
        "change",
        calcularTotalesPedido
    );

    btnAgregarProducto.addEventListener(
        "click",
        function () {

            agregarFilaProducto();

        }
    );

    btnNuevoPedido.addEventListener(
        "click",
        function () {

            abrirPanelPedido(
                "nuevo"
            );

        }
    );

    btnNuevoPedidoVacio.addEventListener(
        "click",
        function () {

            abrirPanelPedido(
                "nuevo"
            );

        }
    );

    btnCerrarPedidoPanel.addEventListener(
        "click",
        cerrarPanelPedido
    );

    btnCancelarPedido.addEventListener(
        "click",
        cerrarPanelPedido
    );

    pedidoForm.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            const pedido =
                obtenerPedidoFormulario();

            if (!pedido) {
                return;
            }

            const indice =
                pedidos.findIndex(
                    p =>
                        p.id ===
                        pedido.id
                );

            if (indice >= 0) {

                pedidos[indice] =
                    pedido;

                mostrarToast(
                    "Pedido actualizado correctamente."
                );

            } else {

                pedidos.push(
                    pedido
                );

                mostrarToast(
                    "Pedido registrado correctamente."
                );

            }

            guardarPedidos();

            cerrarPanelPedido();

            mostrarPedidos();

            actualizarEstadisticasPedidos();

        }
    );

    function obtenerNombreEstado(
        estado
    ) {

        const nombres = {

            pendiente:
                "Pendiente",

            preparando:
                "Preparando",

            entregado:
                "Entregado",

            cancelado:
                "Cancelado"

        };

        return nombres[estado] ||
            estado;

    }

    function claseEstado(
        estado
    ) {

        return (
            "estado-pedido estado-" +
            estado
        );

    }

    function formatearFechaPedido(
        fecha
    ) {

        if (!fecha) {
            return "—";
        }

        const date =
            new Date(fecha);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }

        return date.toLocaleString(
            "es-GT",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }

    function mostrarPedidos() {

        if (!pedidosBody) {
            return;
        }

        const texto =
            searchPedidos?.value
                .trim()
                .toLowerCase() || "";

        let lista =
            pedidos.filter(
                pedido => {

                    const coincideEstado =
                        filtroPedidoActual ===
                        "todos" ||
                        pedido.estado ===
                        filtroPedidoActual;

                    const contenido =
                        (
                            pedido.numero +
                            " " +
                            pedido.clienteNombre +
                            " " +
                            pedido.clienteTelefono +
                            " " +
                            pedido.origen
                        )
                            .toLowerCase();

                    const coincideBusqueda =
                        !texto ||
                        contenido.includes(
                            texto
                        );

                    return (
                        coincideEstado &&
                        coincideBusqueda
                    );

                }
            );

        lista.sort(
            (a, b) =>
                new Date(b.fecha) -
                new Date(a.fecha)
        );

        pedidosBody.innerHTML =
            "";

        if (
            lista.length === 0
        ) {

            if (emptyPedidos) {
                emptyPedidos.hidden =
                    false;
            }

        } else {

            if (emptyPedidos) {
                emptyPedidos.hidden =
                    true;
            }

            lista.forEach(
                pedido => {

                    const tr =
                        document.createElement(
                            "tr"
                        );

                    tr.innerHTML = `
                        <td>
                            <strong>
                                ${escaparHTML(
                                    pedido.numero
                                )}
                            </strong>
                        </td>

                        <td>
                            <div class="pedido-cliente">
                                <strong>
                                    ${escaparHTML(
                                        pedido.clienteNombre ||
                                        "Sin cliente"
                                    )}
                                </strong>
                                <small>
                                    ${escaparHTML(
                                        pedido.clienteTelefono ||
                                        ""
                                    )}
                                </small>
                            </div>
                        </td>

                        <td>
                            ${formatearFechaPedido(
                                pedido.fecha
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                pedido.origen ||
                                "—"
                            )}
                        </td>

                        <td>
                            <span class="${claseEstado(
                                pedido.estado
                            )}">
                                ${obtenerNombreEstado(
                                    pedido.estado
                                )}
                            </span>
                        </td>

                        <td>
                            <strong>
                                ${dinero(
                                    pedido.total
                                )}
                            </strong>
                        </td>

                        <td>
                            <div class="acciones-pedido">

                                <button
                                    type="button"
                                    class="btn-accion btn-ver-pedido"
                                    data-id="${pedido.id}"
                                    title="Ver pedido"
                                >
                                    👁
                                </button>

                                <button
                                    type="button"
                                    class="btn-accion btn-editar-pedido"
                                    data-id="${pedido.id}"
                                    title="Editar pedido"
                                >
                                    ✏
                                </button>

                                <button
                                    type="button"
                                    class="btn-accion btn-eliminar-pedido"
                                    data-id="${pedido.id}"
                                    title="Eliminar pedido"
                                >
                                    🗑
                                </button>

                            </div>
                        </td>
                    `;

                    pedidosBody.appendChild(
                        tr
                    );

                }
            );

        }

        if (resultadoPedidos) {

            resultadoPedidos.textContent =
                lista.length +
                (
                    lista.length === 1
                        ? " pedido"
                        : " pedidos"
                );

        }

        if (footerPedidos) {

            footerPedidos.textContent =
                lista.length +
                " de " +
                pedidos.length +
                " pedidos";

        }

    }

    pedidosBody.addEventListener(
        "click",
        function (evento) {

            const boton =
                evento.target.closest(
                    "button[data-id]"
                );

            if (!boton) {
                return;
            }

            const id =
                boton.dataset.id;

            const pedido =
                pedidos.find(
                    p =>
                        p.id === id
                );

            if (!pedido) {
                return;
            }

            if (
                boton.classList.contains(
                    "btn-ver-pedido"
                )
            ) {

                mostrarDetallePedido(
                    pedido
                );

            }

            if (
                boton.classList.contains(
                    "btn-editar-pedido"
                )
            ) {

                abrirPanelPedido(
                    "editar",
                    pedido
                );

            }

            if (
                boton.classList.contains(
                    "btn-eliminar-pedido"
                )
            ) {

                eliminarPedido(
                    pedido
                );

            }

        }
    );

    function eliminarPedido(
        pedido
    ) {

        const confirmar =
            confirm(
                `¿Desea eliminar el pedido ${pedido.numero}?`
            );

        if (!confirmar) {
            return;
        }

        pedidos =
            pedidos.filter(
                p =>
                    p.id !==
                    pedido.id
            );

        guardarPedidos();

        mostrarPedidos();

        actualizarEstadisticasPedidos();

        if (
            pedidoDetalleActual?.id ===
            pedido.id &&
            dialogPedidoDetalle.open
        ) {

            dialogPedidoDetalle.close();

        }

        mostrarToast(
            "Pedido eliminado correctamente."
        );

    }

    function mostrarDetallePedido(
        pedido
    ) {

        pedidoDetalleActual =
            pedido;

        const cliente =
            clientes.find(
                c =>
                    c.id ===
                    pedido.clienteId
            );

        detallePedidoNumero.textContent =
            pedido.numero;

        detallePedidoEstado.textContent =
            obtenerNombreEstado(
                pedido.estado
            );

        detallePedidoEstado.className =
            claseEstado(
                pedido.estado
            );

        detallePedidoCliente.textContent =
            pedido.clienteNombre ||
            cliente?.nombre ||
            "Sin cliente";

        detallePedidoTelefono.textContent =
            pedido.clienteTelefono ||
            cliente?.telefono ||
            "—";

        detallePedidoFecha.textContent =
            formatearFechaPedido(
                pedido.fecha
            );

        detallePedidoOrigen.textContent =
            pedido.origen ||
            "—";

        detallePedidoDireccion.textContent =
            pedido.direccion ||
            "No especificada";

        detallePedidoTotal.textContent =
            dinero(
                pedido.total
            );

        detallePedidoNotas.textContent =
            pedido.notas ||
            "Sin notas";

        detallePedidoProductos.innerHTML =
            "";

        (pedido.productos || [])
            .forEach(
                producto => {

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.className =
                        "detalle-producto";

                    item.innerHTML = `
                        <div>
                            <strong>
                                ${escaparHTML(
                                    producto.nombre
                                )}
                            </strong>

                            <small>
                                ${producto.cantidad}
                                ×
                                ${dinero(
                                    producto.precio
                                )}
                            </small>
                        </div>

                        <strong>
                            ${dinero(
                                producto.subtotal
                            )}
                        </strong>
                    `;

                    detallePedidoProductos
                        .appendChild(item);

                }
            );

        dialogPedidoDetalle.showModal();

    }

    btnCerrarPedidoDetalle.addEventListener(
        "click",
        function () {

            dialogPedidoDetalle.close();

        }
    );

    btnEditarPedidoDetalle.addEventListener(
        "click",
        function () {

            if (
                !pedidoDetalleActual
            ) {

                return;

            }

            dialogPedidoDetalle.close();

            abrirPanelPedido(
                "editar",
                pedidoDetalleActual
            );

        }
    );

    btnEliminarPedidoDetalle.addEventListener(
        "click",
        function () {

            if (
                !pedidoDetalleActual
            ) {

                return;

            }

            const pedido =
                pedidoDetalleActual;

            dialogPedidoDetalle.close();

            eliminarPedido(
                pedido
            );

        }
    );

    btnWhatsAppPedido.addEventListener(
        "click",
        function () {

            if (
                !pedidoDetalleActual
            ) {

                return;

            }

            const pedido =
                pedidoDetalleActual;

            const telefono =
                (
                    pedido.clienteTelefono ||
                    ""
                ).replace(
                    /\D/g,
                    ""
                );

            if (!telefono) {

                mostrarToast(
                    "El cliente no tiene teléfono registrado.",
                    "error"
                );

                return;

            }

            let mensaje =
                `Hola ${pedido.clienteNombre || ""},%0A%0A`;

            mensaje +=
                `Le compartimos el detalle de su pedido ${pedido.numero}:%0A%0A`;

            (pedido.productos || [])
                .forEach(
                    producto => {

                        mensaje +=
                            `• ${producto.nombre} — ` +
                            `${producto.cantidad} x ` +
                            `${dinero(
                                producto.precio
                            )} = ` +
                            `${dinero(
                                producto.subtotal
                            )}%0A`;

                    }
                );

            mensaje +=
                `%0ASubtotal: ${dinero(
                    pedido.subtotal
                )}`;

            if (
                Number(
                    pedido.descuento || 0
                ) > 0
            ) {

                mensaje +=
                    `%0ADescuento: ${dinero(
                        pedido.descuento
                    )}`;

            }

            mensaje +=
                `%0ATotal: ${dinero(
                    pedido.total
                )}`;

            if (
                pedido.direccion
            ) {

                mensaje +=
                    `%0ADirección: ${encodeURIComponent(
                        pedido.direccion
                    )}`;

            }

            mensaje +=
                `%0A%0AGracias por su compra.`;

            window.open(
                `https://wa.me/502${telefono}?text=${mensaje}`,
                "_blank"
            );

        }
    );

    function actualizarEstadisticasPedidos() {

        const total =
            pedidos.length;

        const pendientes =
            pedidos.filter(
                p =>
                    p.estado ===
                    "pendiente"
            ).length;

        const preparando =
            pedidos.filter(
                p =>
                    p.estado ===
                    "preparando"
            ).length;

        const entregados =
            pedidos.filter(
                p =>
                    p.estado ===
                    "entregado"
            ).length;

        const ventas =
            pedidos
                .filter(
                    p =>
                        p.estado !==
                        "cancelado"
                )
                .reduce(
                    (
                        acumulado,
                        p
                    ) =>
                        acumulado +
                        Number(
                            p.total || 0
                        ),
                    0
                );

        if (statPedidos) {
            statPedidos.textContent =
                total;
        }

        if (
            statPedidosPendientes
        ) {

            statPedidosPendientes.textContent =
                pendientes;

        }

        if (
            statPedidosEntregados
        ) {

            statPedidosEntregados.textContent =
                entregados;

        }

        if (statVentas) {

            statVentas.textContent =
                dinero(ventas);

        }

        if (countPedidosTodos) {

            countPedidosTodos.textContent =
                total;

        }

        if (
            countPedidosPendientes
        ) {

            countPedidosPendientes.textContent =
                pendientes;

        }

        if (
            countPedidosPreparando
        ) {

            countPedidosPreparando.textContent =
                preparando;

        }

        if (
            countPedidosEntregados
        ) {

            countPedidosEntregados.textContent =
                entregados;

        }

    }

    function cambiarVista(
        vista
    ) {

        if (
            vista ===
            "pedidos"
        ) {

            clientesToolbar.hidden =
                true;

            clientesTableSection.hidden =
                true;

            pedidosView.hidden =
                false;

            if (pedidosStats) {
                pedidosStats.hidden =
                    false;
            }

            tituloPrincipal.textContent =
                "Pedidos";

            descripcionPrincipal.textContent =
                "Centraliza y administra todos los pedidos de Variedades Chiquis.";

            textoBtnNuevo.textContent =
                "Nuevo pedido";

            mostrarPedidos();

            actualizarEstadisticasPedidos();

        } else {

            clientesToolbar.hidden =
                false;

            clientesTableSection.hidden =
                false;

            pedidosView.hidden =
                true;

            if (pedidosStats) {
                pedidosStats.hidden =
                    true;
            }

            tituloPrincipal.textContent =
                "Clientes";

            descripcionPrincipal.textContent =
                "Administra la información de los clientes de Variedades Chiquis.";

            textoBtnNuevo.textContent =
                "Nuevo cliente";

        }

    }

    btnNavClientes.addEventListener(
        "click",
        function () {

            cambiarVista(
                "clientes"
            );

        }
    );

    btnNavPedidos.addEventListener(
        "click",
        function () {

            cambiarVista(
                "pedidos"
            );

        }
    );

    searchPedidos.addEventListener(
        "input",
        mostrarPedidos
    );

    btnLimpiarPedidos.addEventListener(
        "click",
        function () {

            searchPedidos.value =
                "";

            filtroPedidoActual =
                "todos";

            document
                .querySelectorAll(
                    ".filtro-pedido"
                )
                .forEach(
                    boton =>
                        boton.classList.remove(
                            "active"
                        )
                );

            const primero =
                document.querySelector(
                    '.filtro-pedido[data-filtro="todos"]'
                );

            if (primero) {
                primero.classList.add(
                    "active"
                );
            }

            mostrarPedidos();

        }
    );

    document
        .querySelectorAll(
            ".filtro-pedido"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function () {

                        filtroPedidoActual =
                            this.dataset.filtro ||
                            "todos";

                        document
                            .querySelectorAll(
                                ".filtro-pedido"
                            )
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        "active"
                                    )
                            );

                        this.classList.add(
                            "active"
                        );

                        mostrarPedidos();

                    }
                );

            }
        );

    const btnExportarPedidos =
        document.getElementById(
            "btnExportarPedidos"
        );

    if (
        btnExportarPedidos
    ) {

        btnExportarPedidos.addEventListener(
            "click",
            function () {

                if (
                    pedidos.length ===
                    0
                ) {

                    mostrarToast(
                        "No hay pedidos para exportar.",
                        "error"
                    );

                    return;

                }

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
                                "application/json"
                        }
                    );

                const url =
                    URL.createObjectURL(
                        blob
                    );

                const enlace =
                    document.createElement(
                        "a"
                    );

                enlace.href =
                    url;

                enlace.download =
                    "pedidos-variedades-chiquis.json";

                enlace.click();

                URL.revokeObjectURL(
                    url
                );

                mostrarToast(
                    "Pedidos exportados correctamente."
                );

            }
        );

    }


    /* ==================== CLIENTES ==================== */

    let clientes =
        cargarClientes();

    let clienteDetalle =
        null;

    let clienteAEliminar =
        null;


    function cargarClientes() {

        try {

            const datos =
                localStorage.getItem(
                    "clientesChiquis"
                );

            return datos
                ? (
                    Array.isArray(
                        JSON.parse(
                            datos
                        )
                    )
                        ? JSON.parse(
                            datos
                        )
                        : []
                )
                : [];

        } catch (error) {

            console.error(
                "Error cargando clientes:",
                error
            );

            return [];

        }

    }


    function guardarClientes() {

        localStorage.setItem(
            "clientesChiquis",
            JSON.stringify(
                clientes
            )
        );

    }


    function escaparHTML(
        texto
    ) {

        return String(
            texto ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function formatearFecha(
        fecha
    ) {

        if (!fecha) {
            return "—";
        }

        const date =
            new Date(
                fecha
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }

        return date.toLocaleDateString(
            "es-GT",
            {
                day:
                    "2-digit",
                month:
                    "2-digit",
                year:
                    "numeric"
            }
        );

    }


    function mostrarClientes(
        lista = clientes
    ) {

        const tbody =
            document.getElementById(
                "clientesBody"
            );

        const empty =
            document.getElementById(
                "emptyClientes"
            );

        const resultado =
            document.getElementById(
                "resultado"
            );

        const footer =
            document.getElementById(
                "footer"
            );


        if (!tbody) {
            return;
        }


        tbody.innerHTML =
            "";


        if (
            lista.length ===
            0
        ) {

            if (empty) {
                empty.hidden =
                    false;
            }

        } else {

            if (empty) {
                empty.hidden =
                    true;
            }


            lista.forEach(
                cliente => {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    const tipoTexto =
                        cliente.tipo ===
                        "mayorista"
                            ? "Mayorista"
                            : "Minorista";


                    tr.innerHTML = `

                        <td>

                            <div class="cliente-nombre">

                                <strong>
                                    ${escaparHTML(
                                        cliente.nombre
                                    )}
                                </strong>

                                <small>
                                    ${escaparHTML(
                                        cliente.telefono ||
                                        ""
                                    )}
                                </small>

                            </div>

                        </td>


                        <td>

                            <span class="tipo-cliente ${cliente.tipo === "mayorista"
                                ? "tipo-mayorista"
                                : "tipo-minorista"}">

                                ${tipoTexto}

                            </span>

                        </td>


                        <td>
                            ${escaparHTML(
                                cliente.email ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${escaparHTML(
                                cliente.nit ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${cliente.descuento
                                ? cliente.descuento + "%"
                                : "0%"}
                        </td>


                        <td>
                            ${formatearFecha(
                                cliente.fecha
                            )}
                        </td>


                        <td>

                            <div class="acciones">

                                <button
                                    type="button"
                                    class="btn-accion btn-ver"
                                    data-id="${cliente.id}"
                                    title="Ver cliente"
                                >
                                    👁
                                </button>


                                <button
                                    type="button"
                                    class="btn-accion btn-editar"
                                    data-id="${cliente.id}"
                                    title="Editar cliente"
                                >
                                    ✏
                                </button>


                                <button
                                    type="button"
                                    class="btn-accion btn-eliminar"
                                    data-id="${cliente.id}"
                                    title="Eliminar cliente"
                                >
                                    🗑
                                </button>

                            </div>

                        </td>

                    `;


                    tbody.appendChild(
                        tr
                    );

                }
            );

        }


        if (resultado) {

            resultado.textContent =
                lista.length +
                (
                    lista.length === 1
                        ? " cliente"
                        : " clientes"
                );

        }


        if (footer) {

            footer.textContent =
                lista.length +
                " de " +
                clientes.length +
                " clientes";

        }


        actualizarEstadisticas();

    }


    function actualizarEstadisticas() {

        const total =
            clientes.length;

        const mayoristas =
            clientes.filter(
                cliente =>
                    cliente.tipo ===
                    "mayorista"
            ).length;

        const minoristas =
            clientes.filter(
                cliente =>
                    cliente.tipo !==
                    "mayorista"
            ).length;


        const statTotal =
            document.getElementById(
                "statTotal"
            );

        const statMayoristas =
            document.getElementById(
                "statMayoristas"
            );

        const statMinoristas =
            document.getElementById(
                "statMinoristas"
            );


        if (statTotal) {
            statTotal.textContent =
                total;
        }

        if (
            statMayoristas
        ) {

            statMayoristas.textContent =
                mayoristas;

        }

        if (
            statMinoristas
        ) {

            statMinoristas.textContent =
                minoristas;

        }

    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                const texto =
                    this.value
                        .trim()
                        .toLowerCase();


                const filtrados =
                    clientes.filter(
                        cliente => {

                            const contenido =
                                (
                                    cliente.nombre +
                                    " " +
                                    cliente.telefono +
                                    " " +
                                    (
                                        cliente.email ||
                                        ""
                                    ) +
                                    " " +
                                    (
                                        cliente.nit ||
                                        ""
                                    ) +
                                    " " +
                                    (
                                        cliente.dpi ||
                                        ""
                                    )
                                )
                                    .toLowerCase();


                            return contenido.includes(
                                texto
                            );

                        }
                    );


                mostrarClientes(
                    filtrados
                );

            }
        );

    }


    const btnNuevo =
        document.getElementById(
            "btnNuevo"
        );

    const btnNuevoVacio =
        document.getElementById(
            "btnNuevoVacio"
        );

    const btnFloating =
        document.getElementById(
            "btnFloating"
        );

    const panel =
        document.getElementById(
            "panel"
        );

    const overlay =
        document.getElementById(
            "overlay"
        );

    const clienteForm =
        document.getElementById(
            "clienteForm"
        );

    const panelTitulo =
        document.getElementById(
            "panelTitulo"
        );

    const clienteId =
        document.getElementById(
            "clienteId"
        );

    const nombre =
        document.getElementById(
            "nombre"
        );

    const tipo =
        document.getElementById(
            "tipo"
        );

    const telefono =
        document.getElementById(
            "telefono"
        );

    const email =
        document.getElementById(
            "email"
        );

    const dpi =
        document.getElementById(
            "dpi"
        );

    const nit =
        document.getElementById(
            "nit"
        );

    const direccion =
        document.getElementById(
            "direccion"
        );

    const descuento =
        document.getElementById(
            "descuento"
        );

    const limiteCredito =
        document.getElementById(
            "limiteCredito"
        );

    const notas =
        document.getElementById(
            "notas"
        );

    const notasCounter =
        document.getElementById(
            "notasCounter"
        );

    const btnCerrarPanel =
        document.getElementById(
            "btnCerrarPanel"
        );

    const btnCancelar =
        document.getElementById(
            "btnCancelar"
        );

    const btnGuardar =
        document.getElementById(
            "btnGuardar"
        );

    const btnTema =
        document.getElementById(
            "btnTema"
        );

    const btnTemaDesktop =
        document.getElementById(
            "btnTemaDesktop"
        );

    const themeIcon =
        document.getElementById(
            "themeIcon"
        );

    const btnMenu =
        document.getElementById(
            "btnMenu"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const btnExportar =
        document.getElementById(
            "btnExportar"
        );

    const btnExportarNav =
        document.getElementById(
            "btnExportarNav"
        );

    const btnImportar =
        document.getElementById(
            "btnImportar"
        );

    const btnImportarNav =
        document.getElementById(
            "btnImportarNav"
        );

    const inputImportar =
        document.getElementById(
            "inputImportar"
        );

    const dialogDetalle =
        document.getElementById(
            "dialogDetalle"
        );

    const btnCerrarDetalle =
        document.getElementById(
            "btnCerrarDetalle"
        );

    const btnEditarDetalle =
        document.getElementById(
            "btnEditarDetalle"
        );

    const btnLlamar =
        document.getElementById(
            "btnLlamar"
        );

    const btnWhatsApp =
        document.getElementById(
            "btnWhatsApp"
        );

    const detalleNombre =
        document.getElementById(
            "detalleNombre"
        );

    const detalleTipo =
        document.getElementById(
            "detalleTipo"
        );

    const detalleTelefono =
        document.getElementById(
            "detalleTelefono"
        );

    const detalleEmail =
        document.getElementById(
            "detalleEmail"
        );

    const detalleDpi =
        document.getElementById(
            "detalleDpi"
        );

    const detalleNit =
        document.getElementById(
            "detalleNit"
        );

    const detalleDireccion =
        document.getElementById(
            "detalleDireccion"
        );

    const detalleDescuento =
        document.getElementById(
            "detalleDescuento"
        );

    const detalleLimiteCredito =
        document.getElementById(
            "detalleLimiteCredito"
        );

    const detalleNotas =
        document.getElementById(
            "detalleNotas"
        );

    const dialogEliminar =
        document.getElementById(
            "dialogEliminar"
        );

    const dialogNombreCliente =
        document.getElementById(
            "dialogNombreCliente"
        );

    const btnCancelarEliminar =
        document.getElementById(
            "btnCancelarEliminar"
        );

    const btnConfirmarEliminar =
        document.getElementById(
            "btnConfirmarEliminar"
        );


    function mostrarToast(
        mensaje,
        tipoMensaje = "success"
    ) {

        const toast =
            document.createElement(
                "div"
            );

        toast.className =
            "toast " +
            tipoMensaje;

        toast.textContent =
            mensaje;

        document.body.appendChild(
            toast
        );

        setTimeout(
            function () {

                toast.classList.add(
                    "show"
                );

            },
            10
        );

        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

                setTimeout(
                    () =>
                        toast.remove(),
                    300
                );

            },
            3000
        );

    }


    function abrirPanel(
        modo = "nuevo",
        cliente = null
    ) {

        overlay.hidden =
            false;

        panel.classList.add(
            "is-open"
        );

        panel.setAttribute(
            "aria-hidden",
            "false"
        );


        if (
            modo ===
            "nuevo"
        ) {

            panelTitulo.textContent =
                "Nuevo cliente";

            clienteForm.reset();

            clienteId.value =
                "";

            tipo.value =
                "minorista";

            descuento.value =
                "0";

            limiteCredito.value =
                "0";

        } else if (
            cliente
        ) {

            panelTitulo.textContent =
                "Editar cliente";

            clienteId.value =
                cliente.id;

            nombre.value =
                cliente.nombre ||
                "";

            tipo.value =
                cliente.tipo ||
                "minorista";

            telefono.value =
                cliente.telefono ||
                "";

            email.value =
                cliente.email ||
                "";

            dpi.value =
                cliente.dpi ||
                "";

            nit.value =
                cliente.nit ||
                "";

            direccion.value =
                cliente.direccion ||
                "";

            descuento.value =
                cliente.descuento ||
                "0";

            limiteCredito.value =
                cliente.limiteCredito ||
                "0";

            notas.value =
                cliente.notas ||
                "";

        }

        actualizarCamposTipo();

        actualizarContadorNotas();

        setTimeout(
            () => nombre.focus(),
            100
        );

    }


    function cerrarPanel() {

        panel.classList.remove(
            "is-open"
        );

        panel.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            !pedidoPanel.classList.contains(
                "is-open"
            )
        ) {

            overlay.hidden =
                true;

        }

    }


    /*
     * IMPORTANTE:
     * Esta es la parte corregida.
     * btnNuevo ya fue declarado antes
     * de crear este listener.
     */

    btnNuevo.addEventListener(
        "click",
        function () {

            if (
                pedidosView &&
                !pedidosView.hidden
            ) {

                abrirPanelPedido(
                    "nuevo"
                );

            } else {

                abrirPanel(
                    "nuevo"
                );

            }

        }
    );


    if (btnNuevoVacio) {

        btnNuevoVacio.addEventListener(
            "click",
            function () {

                abrirPanel(
                    "nuevo"
                );

            }
        );

    }


    if (btnFloating) {

        btnFloating.addEventListener(
            "click",
            function () {

                if (
                    pedidosView &&
                    !pedidosView.hidden
                ) {

                    abrirPanelPedido(
                        "nuevo"
                    );

                } else {

                    abrirPanel(
                        "nuevo"
                    );

                }

            }
        );

    }


    btnCerrarPanel.addEventListener(
        "click",
        cerrarPanel
    );


    btnCancelar.addEventListener(
        "click",
        cerrarPanel
    );


    /*
     * Overlay corregido.
     * Primero revisa si está abierto
     * el panel de pedidos.
     */

    overlay.addEventListener(
        "click",
        function () {

            if (
                pedidoPanel.classList.contains(
                    "is-open"
                )
            ) {

                cerrarPanelPedido();

            } else {

                cerrarPanel();

            }

        }
    );


    clienteForm.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const nombreValor =
                nombre.value.trim();

            const telefonoValor =
                telefono.value.trim();


            if (
                !nombreValor
            ) {

                mostrarToast(
                    "Ingrese el nombre del cliente.",
                    "error"
                );

                nombre.focus();

                return;

            }


            if (
                !telefonoValor
            ) {

                mostrarToast(
                    "Ingrese el número de teléfono.",
                    "error"
                );

                telefono.focus();

                return;

            }


            const cliente = {

                id:
                    clienteId.value ||
                    "cliente-" +
                    Date.now(),

                nombre:
                    nombreValor,

                tipo:
                    tipo.value,

                telefono:
                    telefonoValor,

                email:
                    email.value.trim(),

                dpi:
                    dpi.value.trim(),

                nit:
                    nit.value.trim(),

                direccion:
                    direccion.value.trim(),

                descuento:
                    Number(
                        descuento.value ||
                        0
                    ),

                limiteCredito:
                    Number(
                        limiteCredito.value ||
                        0
                    ),

                notas:
                    notas.value.trim(),

                fecha:
                    clienteId.value
                        ? (
                            clientes.find(
                                c =>
                                    c.id ===
                                    clienteId.value
                            )?.fecha ||
                            new Date().toISOString()
                        )
                        : new Date().toISOString()

            };


            const indice =
                clientes.findIndex(
                    c =>
                        c.id ===
                        cliente.id
                );


            if (
                indice >=
                0
            ) {

                clientes[indice] =
                    cliente;

                mostrarToast(
                    "Cliente actualizado correctamente."
                );

            } else {

                clientes.push(
                    cliente
                );

                mostrarToast(
                    "Cliente agregado correctamente."
                );

            }


            guardarClientes();

            mostrarClientes();

            cerrarPanel();

            if (
                pedidosView &&
                !pedidosView.hidden
            ) {

                cargarClientesEnSelect();

            }

        }
    );


    function actualizarCamposTipo() {

        if (
            !tipo ||
            !descuento
        ) {

            return;

        }

        if (
            tipo.value ===
            "mayorista"
        ) {

            descuento.disabled =
                false;

        } else {

            descuento.value =
                "0";

            descuento.disabled =
                true;

        }

    }


    tipo.addEventListener(
        "change",
        actualizarCamposTipo
    );


    const tbodyClientes =
        document.getElementById(
            "clientesBody"
        );


    if (tbodyClientes) {

        tbodyClientes.addEventListener(
            "click",
            function (evento) {

                const boton =
                    evento.target.closest(
                        "button[data-id]"
                    );

                if (!boton) {
                    return;
                }


                const id =
                    boton.dataset.id;


                const cliente =
                    clientes.find(
                        c =>
                            c.id ===
                            id
                    );


                if (!cliente) {
                    return;
                }


                if (
                    boton.classList.contains(
                        "btn-ver"
                    )
                ) {

                    mostrarDetalleCliente(
                        cliente
                    );

                }


                if (
                    boton.classList.contains(
                        "btn-editar"
                    )
                ) {

                    abrirPanel(
                        "editar",
                        cliente
                    );

                }


                if (
                    boton.classList.contains(
                        "btn-eliminar"
                    )
                ) {

                    abrirDialogoEliminar(
                        cliente
                    );

                }

            }
        );

    }


    function mostrarDetalleCliente(
        cliente
    ) {

        clienteDetalle =
            cliente;


        detalleNombre.textContent =
            cliente.nombre ||
            "—";

        detalleTipo.textContent =
            cliente.tipo ===
            "mayorista"
                ? "Mayorista"
                : "Minorista";

        detalleTelefono.textContent =
            cliente.telefono ||
            "—";

        detalleEmail.textContent =
            cliente.email ||
            "—";

        detalleDpi.textContent =
            cliente.dpi ||
            "—";

        detalleNit.textContent =
            cliente.nit ||
            "—";

        detalleDireccion.textContent =
            cliente.direccion ||
            "—";

        detalleDescuento.textContent =
            (
                cliente.descuento ||
                0
            ) +
            "%";

        detalleLimiteCredito.textContent =
            dinero(
                cliente.limiteCredito ||
                0
            );

        detalleNotas.textContent =
            cliente.notas ||
            "Sin notas";


        dialogDetalle.showModal();

    }


    btnCerrarDetalle.addEventListener(
        "click",
        function () {

            dialogDetalle.close();

        }
    );


    btnEditarDetalle.addEventListener(
        "click",
        function () {

            if (
                !clienteDetalle
            ) {

                return;

            }


            dialogDetalle.close();


            abrirPanel(
                "editar",
                clienteDetalle
            );

        }
    );


    btnLlamar.addEventListener(
        "click",
        function () {

            if (
                clienteDetalle &&
                clienteDetalle.telefono
            ) {

                window.location.href =
                    `tel:${clienteDetalle.telefono}`;

            }

        }
    );


    btnWhatsApp.addEventListener(
        "click",
        function () {

            if (
                clienteDetalle &&
                clienteDetalle.telefono
            ) {

                const numero =
                    clienteDetalle.telefono
                        .replace(
                            /\D/g,
                            ""
                        );


                window.open(
                    `https://wa.me/502${numero}`,
                    "_blank"
                );

            }

        }
    );


    function abrirDialogoEliminar(
        cliente
    ) {

        clienteAEliminar =
            cliente;

        dialogNombreCliente.textContent =
            cliente.nombre;

        dialogEliminar.showModal();

    }


    btnCancelarEliminar.addEventListener(
        "click",
        function () {

            dialogEliminar.close();

            clienteAEliminar =
                null;

        }
    );


    btnConfirmarEliminar.addEventListener(
        "click",
        function () {

            if (
                !clienteAEliminar
            ) {

                return;

            }


            const nombreEliminado =
                clienteAEliminar.nombre;


            clientes =
                clientes.filter(
                    cliente =>
                        cliente.id !==
                        clienteAEliminar.id
                );


            guardarClientes();

            mostrarClientes();

            dialogEliminar.close();


            mostrarToast(
                `${nombreEliminado} fue eliminado.`
            );


            clienteAEliminar =
                null;

        }
    );


    function actualizarContadorNotas() {

        notasCounter.textContent =
            notas.value.length;

    }


    notas.addEventListener(
        "input",
        actualizarContadorNotas
    );


    function actualizarTemaIconos() {

        const oscuro =
            document.body.classList.contains(
                "dark"
            );


        if (themeIcon) {

            themeIcon.textContent =
                oscuro
                    ? "☀"
                    : "☾";

        }


        if (
            btnTemaDesktop
        ) {

            btnTemaDesktop.textContent =
                oscuro
                    ? "☀"
                    : "☾";

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
            "temaChiquis",
            oscuro
                ? "dark"
                : "light"
        );


        actualizarTemaIconos();

    }


    if (
        localStorage.getItem(
            "temaChiquis"
        ) ===
        "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

    }


    actualizarTemaIconos();


    btnTema.addEventListener(
        "click",
        cambiarTema
    );


    btnTemaDesktop.addEventListener(
        "click",
        cambiarTema
    );


    btnMenu.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    function exportarCSV() {

        if (
            clientes.length ===
            0
        ) {

            mostrarToast(
                "No hay clientes para exportar.",
                "error"
            );

            return;

        }


        const encabezados = [

            "Nombre",
            "Tipo",
            "Telefono",
            "Correo",
            "DPI",
            "NIT",
            "Direccion",
            "Descuento",
            "LimiteCredito",
            "Notas",
            "Fecha"

        ];


        const filas =
            clientes.map(
                cliente => [

                    cliente.nombre,
                    cliente.tipo,
                    cliente.telefono,
                    cliente.email ||
                        "",
                    cliente.dpi ||
                        "",
                    cliente.nit ||
                        "",
                    cliente.direccion ||
                        "",
                    cliente.descuento ||
                        0,
                    cliente.limiteCredito ||
                        0,
                    cliente.notas ||
                        "",
                    formatearFecha(
                        cliente.fecha
                    )

                ]
            );


        const csv = [

            encabezados,
            ...filas

        ]
            .map(
                fila =>
                    fila
                        .map(
                            dato =>
                                `"${String(
                                    dato
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");


        const blob =
            new Blob(
                [
                    "\ufeff" +
                    csv
                ],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const enlace =
            document.createElement(
                "a"
            );


        enlace.href =
            url;

        enlace.download =
            "clientes-variedades-chiquis.csv";


        enlace.click();


        URL.revokeObjectURL(
            url
        );


        mostrarToast(
            "Clientes exportados correctamente."
        );

    }


    btnExportar.addEventListener(
        "click",
        exportarCSV
    );


    btnExportarNav.addEventListener(
        "click",
        exportarCSV
    );


    function abrirImportador() {

        inputImportar.click();

    }


    btnImportar.addEventListener(
        "click",
        abrirImportador
    );


    btnImportarNav.addEventListener(
        "click",
        abrirImportador
    );


    inputImportar.addEventListener(
        "change",
        function () {

            const archivo =
                inputImportar.files[0];


            if (!archivo) {
                return;
            }


            const lector =
                new FileReader();


            lector.onload =
                function (evento) {

                    try {

                        const datos =
                            JSON.parse(
                                evento.target.result
                            );


                        if (
                            !Array.isArray(
                                datos
                            )
                        ) {

                            throw new Error(
                                "Formato incorrecto"
                            );

                        }


                        const clientesValidos =
                            datos.filter(
                                cliente =>
                                    cliente.nombre &&
                                    cliente.telefono
                            );


                        clientes =
                            clientesValidos;


                        guardarClientes();

                        mostrarClientes();


                        mostrarToast(
                            `${clientesValidos.length} clientes importados.`
                        );


                    } catch (
                        error
                    ) {

                        console.error(
                            error
                        );


                        mostrarToast(
                            "No se pudo importar el archivo.",
                            "error"
                        );

                    }

                };


            lector.readAsText(
                archivo
            );


            inputImportar.value =
                "";

        }
    );


    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.ctrlKey &&
                evento.key.toLowerCase() ===
                "n"
            ) {

                evento.preventDefault();


                if (
                    pedidosView &&
                    !pedidosView.hidden
                ) {

                    abrirPanelPedido(
                        "nuevo"
                    );

                } else {

                    abrirPanel(
                        "nuevo"
                    );

                }

            }


            if (
                evento.ctrlKey &&
                evento.key.toLowerCase() ===
                "k"
            ) {

                evento.preventDefault();


                if (searchInput) {

                    searchInput.focus();

                }

            }


            if (
                evento.key ===
                "Escape"
            ) {

                if (
                    pedidoPanel.classList.contains(
                        "is-open"
                    )
                ) {

                    cerrarPanelPedido();

                } else if (
                    panel.classList.contains(
                        "is-open"
                    )
                ) {

                    cerrarPanel();

                }

            }

        }
    );


    const btnNavEstadisticas =
        document.getElementById(
            "btnNavEstadisticas"
        );


    if (
        btnNavEstadisticas
    ) {

        btnNavEstadisticas.addEventListener(
            "click",
            function () {

                window.scrollTo(
                    {
                        top:
                            0,
                        behavior:
                            "smooth"
                    }
                );

            }
        );

    }


    actualizarCamposTipo();

    actualizarContadorNotas();

    mostrarClientes();

    actualizarEstadisticasPedidos();

});