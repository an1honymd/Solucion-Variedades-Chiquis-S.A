document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // VARIEDADES CHIQUIS - PEDIDOS
    // ============================================================

    const $ = (id) => document.getElementById(id);

    const on = (id, event, fn) => {
        const el = $(id);
        if (el) el.addEventListener(event, fn);
        return el;
    };

    const overlay = $('overlay');
    const pedidoPanel = $('pedidoPanel');
    const pedidoForm = $('pedidoForm');

    let pedidos = cargarPedidos();
    let clientes = cargarClientes();
    let pedidoDetalleActual = null;
    let filtroPedido = 'todos';

    // ============================================================
    // UTILIDADES
    // ============================================================

    function escaparHTML(valor) {
        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function dinero(valor) {
        return 'Q' + Number(valor || 0).toFixed(2);
    }

    function generarId(prefijo = '') {
        return prefijo +
            Date.now() +
            Math.random()
                .toString(36)
                .slice(2, 8);
    }

    function formatearFechaHora(fecha) {
        if (!fecha) return 'Sin fecha';

        const d = new Date(fecha);

        if (Number.isNaN(d.getTime())) {
            return 'Sin fecha';
        }

        return d.toLocaleString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function fechaActualInput() {
        const d = new Date();

        d.setMinutes(
            d.getMinutes() -
            d.getTimezoneOffset()
        );

        return d.toISOString()
            .slice(0, 16);
    }

    function toast(
        mensaje,
        tipo = 'success'
    ) {

        const contenedor =
            $('toast');

        if (contenedor) {

            const icono =
                $('toastIcon');

            const texto =
                $('toastMessage');

            if (texto) {
                texto.textContent =
                    mensaje;
            }

            if (icono) {
                icono.textContent =
                    tipo === 'error'
                        ? '!'
                        : '✓';
            }

            contenedor.classList.add(
                'show'
            );

            clearTimeout(
                window.__toastTimer
            );

            window.__toastTimer =
                setTimeout(() => {

                    contenedor.classList.remove(
                        'show'
                    );

                }, 3000);

            return;
        }

        const t =
            document.createElement(
                'div'
            );

        t.textContent =
            mensaje;

        t.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 99999;
            padding: 14px 18px;
            border-radius: 10px;
            background: ${tipo === 'error' ? '#b42318' : '#16794b'};
            color: #fff;
            font-weight: 600;
            box-shadow: 0 8px 30px rgba(0,0,0,.2);
        `;

        document.body.appendChild(t);

        setTimeout(
            () => t.remove(),
            3000
        );
    }

    // ============================================================
    // LOCAL STORAGE
    // ============================================================

    function cargarPedidos() {
        try {

            const datos =
                JSON.parse(
                    localStorage.getItem(
                        'pedidosChiquis'
                    ) || '[]'
                );

            return Array.isArray(datos)
                ? datos
                : [];

        } catch (e) {

            console.error(e);

            return [];
        }
    }

    function guardarPedidos() {

        try {

            localStorage.setItem(
                'pedidosChiquis',
                JSON.stringify(
                    pedidos
                )
            );

            return true;

        } catch (e) {

            console.error(e);

            toast(
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
                        'clientesChiquis'
                    ) || '[]'
                );

            return Array.isArray(datos)
                ? datos
                : [];

        } catch (e) {

            console.error(e);

            return [];
        }
    }

    // ============================================================
    // NUMERO DE PEDIDO
    // ============================================================

    function generarNumeroPedido() {

        const numero =
            pedidos.length + 1;

        return 'PED-' +
            String(numero)
                .padStart(4, '0');
    }

    // ============================================================
    // CLIENTES EN SELECT
    // ============================================================

    function cargarClientesEnSelect() {

        const select =
            $('pedidoCliente');

        if (!select) return;

        clientes =
            cargarClientes();

        select.innerHTML = `
            <option value="">
                Seleccionar cliente
            </option>
        `;

        clientes.forEach(
            cliente => {

                const option =
                    document.createElement(
                        'option'
                    );

                option.value =
                    cliente.id;

                option.textContent =
                    `${cliente.nombre} — ${cliente.telefono || 'Sin teléfono'}`;

                select.appendChild(
                    option
                );
            }
        );
    }

    // ============================================================
    // PRODUCTOS
    // ============================================================

    function agregarFilaProducto(
        producto = {}
    ) {

        const contenedor =
            $('productosPedido');

        if (!contenedor) return;

        const fila =
            document.createElement(
                'div'
            );

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
                    value="${escaparHTML(producto.nombre || '')}">
            </div>

            <div class="field">
                <label class="field-label">
                    Cantidad
                </label>

                <input
                    type="number"
                    class="producto-cantidad"
                    min="1"
                    value="${producto.cantidad || 1}">
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
                    value="${producto.precio ?? 0}">
            </div>

            <button
                type="button"
                class="btn-eliminar-producto"
                title="Eliminar producto">
                ×
            </button>
        `;

        contenedor.appendChild(
            fila
        );

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

        fila
            .querySelector(
                '.btn-eliminar-producto'
            )
            ?.addEventListener(
                'click',
                () => {

                    fila.remove();

                    calcularTotales();
                }
            );
    }

    function obtenerProductos() {

        const filas =
            document.querySelectorAll(
                '.producto-pedido-row'
            );

        const productos = [];

        filas.forEach(
            fila => {

                const nombre =
                    fila.querySelector(
                        '.producto-nombre'
                    )?.value.trim();

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
            }
        );

        return productos;
    }

    // ============================================================
    // TOTALES
    // ============================================================

    function calcularTotales() {

        const productos =
            obtenerProductos();

        const subtotal =
            productos.reduce(
                (total, producto) =>
                    total +
                    Number(
                        producto.subtotal ||
                        0
                    ),
                0
            );

        const clienteId =
            $('pedidoCliente')
                ?.value;

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
            (porcentaje / 100);

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

    // ============================================================
    // ABRIR PANEL PEDIDO
    // ============================================================

    function abrirPanelPedido(
        pedido = null
    ) {

        if (
            !pedidoPanel ||
            !pedidoForm
        ) {
            return;
        }

        clientes =
            cargarClientes();

        cargarClientesEnSelect();

        if (overlay) {
            overlay.hidden = false;
        }

        pedidoPanel.classList.add(
            'is-open'
        );

        pedidoPanel.setAttribute(
            'aria-hidden',
            'false'
        );

        pedidoForm.reset();

        const productos =
            $('productosPedido');

        if (productos) {
            productos.innerHTML = '';
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

        calcularTotales();
    }

    function cerrarPanelPedido() {

        if (!pedidoPanel) return;

        pedidoPanel.classList.remove(
            'is-open'
        );

        pedidoPanel.setAttribute(
            'aria-hidden',
            'true'
        );

        if (overlay) {
            overlay.hidden = true;
        }
    }

    // ============================================================
    // VALIDAR PEDIDO
    // ============================================================

    function validarPedido() {

        const cliente =
            $('pedidoCliente')
                ?.value;

        const fecha =
            $('pedidoFecha')
                ?.value;

        const productos =
            obtenerProductos();

        if (!cliente) {

            toast(
                'Selecciona un cliente.',
                'error'
            );

            return false;
        }

        if (!fecha) {

            toast(
                'Selecciona la fecha del pedido.',
                'error'
            );

            return false;
        }

        if (!productos.length) {

            toast(
                'Agrega al menos un producto.',
                'error'
            );

            return false;
        }

        for (
            const producto of productos
        ) {

            if (
                !producto.nombre ||
                producto.cantidad <= 0 ||
                producto.precio < 0
            ) {

                toast(
                    'Revisa los productos del pedido.',
                    'error'
                );

                return false;
            }
        }

        return true;
    }

    // ============================================================
    // GUARDAR PEDIDO
    // ============================================================

    function guardarPedido(event) {

        event.preventDefault();

        if (!validarPedido()) {
            return;
        }

        clientes =
            cargarClientes();

        const id =
            $('pedidoId').value ||
            generarId('PED-');

        const numero =
            $('pedidoNumero').value;

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
                (total, producto) =>
                    total +
                    Number(
                        producto.subtotal ||
                        0
                    ),
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

            toast(
                'Pedido actualizado correctamente.'
            );

        } else {

            pedido.fechaCreacion =
                new Date().toISOString();

            pedidos.push(
                pedido
            );

            toast(
                'Pedido registrado correctamente.'
            );
        }

        if (guardarPedidos()) {

            cerrarPanelPedido();

            mostrarPedidos();

            actualizarEstadisticasPedidos();
        }
    }

    // ============================================================
    // MOSTRAR PEDIDOS
    // ============================================================

    function obtenerPedidosFiltrados() {

        const busqueda =
            (
                $('searchPedidos')
                    ?.value || ''
            )
                .trim()
                .toLowerCase();

        return pedidos.filter(
            pedido => {

                const coincideEstado =
                    filtroPedido ===
                    'todos' ||
                    pedido.estado ===
                    filtroPedido;

                const texto =
                    [
                        pedido.numero,
                        pedido.clienteNombre,
                        pedido.clienteTelefono,
                        pedido.origen,
                        pedido.direccion,
                        pedido.notas,
                        ...(pedido.productos || [])
                            .map(
                                p => p.nombre
                            )
                    ]
                        .join(' ')
                        .toLowerCase();

                const coincideBusqueda =
                    !busqueda ||
                    texto.includes(
                        busqueda
                    );

                return coincideEstado &&
                    coincideBusqueda;
            }
        );
    }

    function mostrarPedidos() {

        const tbody =
            $('pedidosBody');

        const empty =
            $('emptyPedidos');

        if (!tbody) return;

        const lista =
            obtenerPedidosFiltrados();

        tbody.innerHTML = '';

        lista.forEach(
            pedido => {

                const tr =
                    document.createElement(
                        'tr'
                    );

                const productos =
                    pedido.productos ||
                    [];

                const nombres =
                    productos
                        .map(
                            p => p.nombre
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
                ] || pedido.estado;

                tr.innerHTML = `

                    <td>
                        <strong>
                            ${escaparHTML(
                                pedido.numero
                            )}
                        </strong>

                        <small>
                            ${escaparHTML(
                                pedido.origen || ''
                            )}
                        </small>
                    </td>

                    <td>
                        <div class="client-cell">

                            <div class="client-avatar">
                                ${escaparHTML(
                                    (pedido.clienteNombre || '?')
                                        .charAt(0)
                                        .toUpperCase()
                                )}
                            </div>

                            <div>
                                <strong>
                                    ${escaparHTML(
                                        pedido.clienteNombre || 'Sin cliente'
                                    )}
                                </strong>

                                <small>
                                    ${escaparHTML(
                                        pedido.clienteTelefono || 'Sin teléfono'
                                    )}
                                </small>
                            </div>

                        </div>
                    </td>

                    <td>
                        <div class="productos-resumen">

                            <strong>
                                ${productos.length}
                                producto${productos.length === 1 ? '' : 's'}
                            </strong>

                            <small>
                                ${escaparHTML(
                                    nombres || 'Sin productos'
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
                        <span class="status-badge ${escaparHTML(
                            pedido.estado
                        )}">
                            ${estadoTexto}
                        </span>
                    </td>

                    <td>
                        <div class="row-actions">

                            <button
                                class="table-action btn-ver-pedido"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Ver pedido">
                                👁
                            </button>

                            <button
                                class="table-action btn-editar-pedido"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Editar">
                                ✎
                            </button>

                            <button
                                class="table-action danger btn-eliminar-pedido"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Eliminar">
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

        if (empty) {
            empty.hidden =
                lista.length > 0;
        }

        if ($('resultadoPedidos')) {
            $('resultadoPedidos')
                .textContent =
                `Mostrando ${lista.length} de ${pedidos.length} pedidos`;
        }

        if ($('footerPedidos')) {
            $('footerPedidos')
                .textContent =
                `${lista.length} pedido${lista.length === 1 ? '' : 's'}`;
        }

        actualizarContadoresPedidos();
    }

    // ============================================================
    // CONTADORES
    // ============================================================

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

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================

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
                (sum, pedido) =>
                    sum +
                    Number(
                        pedido.total || 0
                    ),
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

    // ============================================================
    // TABLA
    // ============================================================

    on(
        'pedidosBody',
        'click',
        event => {

            const btn =
                event.target.closest(
                    'button[data-id]'
                );

            if (!btn) return;

            const pedido =
                pedidos.find(
                    p =>
                        String(p.id) ===
                        String(btn.dataset.id)
                );

            if (!pedido) return;

            if (
                btn.classList.contains(
                    'btn-ver-pedido'
                )
            ) {

                mostrarDetallePedido(
                    pedido
                );
            }

            if (
                btn.classList.contains(
                    'btn-editar-pedido'
                )
            ) {

                abrirPanelPedido(
                    pedido
                );
            }

            if (
                btn.classList.contains(
                    'btn-eliminar-pedido'
                )
            ) {

                eliminarPedido(
                    pedido
                );
            }
        }
    );

    // ============================================================
    // BUSCADOR
    // ============================================================

    on(
        'searchPedidos',
        'input',
        mostrarPedidos
    );

    on(
        'btnLimpiarPedidos',
        'click',
        () => {

            if ($('searchPedidos')) {
                $('searchPedidos').value =
                    '';
            }

            filtroPedido =
                'todos';

            document
                .querySelectorAll(
                    '.filter-button[data-estado]'
                )
                .forEach(
                    b =>
                        b.classList.remove(
                            'active'
                        )
                );

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

    // ============================================================
    // FILTROS
    // ============================================================

    document
        .querySelectorAll(
            '.filter-button[data-estado]'
        )
        .forEach(
            btn => {

                btn.addEventListener(
                    'click',
                    () => {

                        filtroPedido =
                            btn.dataset.estado ||
                            'todos';

                        document
                            .querySelectorAll(
                                '.filter-button[data-estado]'
                            )
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        'active'
                                    )
                            );

                        btn.classList.add(
                            'active'
                        );

                        mostrarPedidos();
                    }
                );
            }
        );

    // ============================================================
    // DETALLE PEDIDO
    // ============================================================

    function mostrarDetallePedido(
        pedido
    ) {

        pedidoDetalleActual =
            pedido;

        const dialog =
            $('dialogPedidoDetalle');

        if (!dialog) return;

        if ($('detallePedidoNumero')) {
            $('detallePedidoNumero')
                .textContent =
                pedido.numero || 'Pedido';
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
            ] || pedido.estado;

            $('detallePedidoEstado')
                .textContent =
                estadoTexto;
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

            contenedor.innerHTML = '';

            (
                pedido.productos ||
                []
            ).forEach(
                producto => {

                    const div =
                        document.createElement(
                            'div'
                        );

                    div.className =
                        'detalle-producto';

                    div.innerHTML = `
                        <span>
                            ${escaparHTML(
                                producto.nombre
                            )}
                        </span>

                        <strong>
                            ${producto.cantidad}
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
                }
            );
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

            dialog.showModal();

        } else {

            dialog.setAttribute(
                'open',
                ''
            );
        }
    }

    on(
        'btnCerrarPedidoDetalle',
        'click',
        () =>
            $('dialogPedidoDetalle')
                ?.close()
    );

    on(
        'btnEditarPedidoDetalle',
        'click',
        () => {

            if (
                !pedidoDetalleActual
            ) {
                return;
            }

            $('dialogPedidoDetalle')
                ?.close();

            abrirPanelPedido(
                pedidoDetalleActual
            );
        }
    );

    // ============================================================
    // ELIMINAR PEDIDO
    // ============================================================

    function eliminarPedido(
        pedido
    ) {

        if (
            !confirm(
                `¿Deseas eliminar el pedido ${pedido.numero}?`
            )
        ) {
            return;
        }

        pedidos =
            pedidos.filter(
                p =>
                    String(p.id) !==
                    String(pedido.id)
            );

        guardarPedidos();

        mostrarPedidos();

        actualizarEstadisticasPedidos();

        toast(
            'Pedido eliminado correctamente.'
        );
    }

    on(
        'btnEliminarPedidoDetalle',
        'click',
        () => {

            if (
                !pedidoDetalleActual
            ) {
                return;
            }

            $('dialogPedidoDetalle')
                ?.close();

            eliminarPedido(
                pedidoDetalleActual
            );
        }
    );

    // ============================================================
    // WHATSAPP
    // ============================================================

    on(
        'btnWhatsAppPedido',
        'click',
        () => {

            if (
                !pedidoDetalleActual
                    ?.clienteTelefono
            ) {

                toast(
                    'El cliente no tiene teléfono registrado.',
                    'error'
                );

                return;
            }

            const p =
                pedidoDetalleActual;

            const telefono =
                p.clienteTelefono
                    .replace(
                        /\D/g,
                        ''
                    );

            let mensaje =
                `Hola ${
                    p.clienteNombre || ''
                },\n\n`;

            mensaje +=
                `Detalle del pedido ${
                    p.numero
                }:\n\n`;

            (
                p.productos || []
            ).forEach(
                producto => {

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
                }
            );

            mensaje +=
                `\nTotal: ${
                    dinero(
                        p.total
                    )
                }`;

            window.open(
                `https://wa.me/502${telefono}?text=${encodeURIComponent(mensaje)}`,
                '_blank'
            );
        }
    );

    // ============================================================
    // BOTONES PRINCIPALES
    // ============================================================

    on(
        'btnNuevoPedido',
        'click',
        () =>
            abrirPanelPedido()
    );

    on(
        'btnNuevoPedidoVacio',
        'click',
        () =>
            abrirPanelPedido()
    );

    on(
        'btnAgregarProducto',
        'click',
        () =>
            agregarFilaProducto()
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

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    on(
        'btnNavClientes',
        'click',
        () => {
            window.location.href =
                'cliente.html';
        }
    );

    on(
        'btnNavEstadisticas',
        'click',
        () => {

            $('pedidosStats')
                ?.scrollIntoView({
                    behavior: 'smooth'
                });
        }
    );

    // ============================================================
    // TEMA
    // ============================================================

    function actualizarTema() {

        const oscuro =
            document.body.classList.contains(
                'dark'
            );

        if ($('themeIcon')) {
            $('themeIcon').textContent =
                oscuro ? '☀' : '☾';
        }

        if ($('btnTemaDesktop')) {
            $('btnTemaDesktop')
                .textContent =
                oscuro ? '☀' : '☾';
        }
    }

    function cambiarTema() {

        document.body.classList.toggle(
            'dark'
        );

        localStorage.setItem(
            'temaChiquis',
            document.body.classList.contains(
                'dark'
            )
                ? 'dark'
                : 'light'
        );

        actualizarTema();
    }

    if (
        localStorage.getItem(
            'temaChiquis'
        ) === 'dark'
    ) {

        document.body.classList.add(
            'dark'
        );
    }

    actualizarTema();

    on(
        'btnTema',
        'click',
        cambiarTema
    );

    on(
        'btnTemaDesktop',
        'click',
        cambiarTema
    );

    on(
        'btnMenu',
        'click',
        () =>
            $('sidebar')
                ?.classList.toggle(
                    'open'
                )
    );

    // ============================================================
    // OVERLAY
    // ============================================================

    on(
        'overlay',
        'click',
        () =>
            cerrarPanelPedido()
    );

    // ============================================================
    // DESCARGAR
    // ============================================================

    function descargar(
        nombre,
        contenido,
        tipo
    ) {

        const blob =
            new Blob(
                [contenido],
                {
                    type: tipo
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                'a'
            );

        a.href = url;

        a.download =
            nombre;

        document.body.appendChild(
            a
        );

        a.click();

        a.remove();

        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }

    // ============================================================
    // EXPORTAR PEDIDOS
    // ============================================================

    on(
        'btnExportarPedidos',
        'click',
        () => {

            if (!pedidos.length) {

                toast(
                    'No hay pedidos para exportar.',
                    'error'
                );

                return;
            }

            descargar(
                'pedidos-variedades-chiquis.json',
                JSON.stringify(
                    pedidos,
                    null,
                    2
                ),
                'application/json'
            );

            toast(
                'Pedidos exportados correctamente.'
            );
        }
    );

    // ============================================================
    // TECLADO
    // ============================================================

    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Escape' &&
                pedidoPanel?.classList.contains(
                    'is-open'
                )
            ) {

                cerrarPanelPedido();
            }

            if (
                event.ctrlKey &&
                event.key.toLowerCase() ===
                'n'
            ) {

                event.preventDefault();

                abrirPanelPedido();
            }

            if (
                event.ctrlKey &&
                event.key.toLowerCase() ===
                'k'
            ) {

                event.preventDefault();

                $('searchPedidos')
                    ?.focus();
            }
        }
    );

    // ============================================================
    // INICIO
    // ============================================================

    cargarClientesEnSelect();

    mostrarPedidos();

    actualizarEstadisticasPedidos();
});