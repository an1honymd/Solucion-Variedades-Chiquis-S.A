document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // VARIEDADES CHIQUIS - CLIENTES Y PEDIDOS
    // ============================================================

    const $ = (id) => document.getElementById(id);

    const on = (id, event, fn) => {
        const el = $(id);
        if (el) el.addEventListener(event, fn);
        return el;
    };

    // ============================================================
    // ELEMENTOS PRINCIPALES
    // ============================================================

    const overlay = $('overlay');
    const panel = $('panel');
    const clienteForm = $('clienteForm');
    const pedidoPanel = $('pedidoPanel');
    const pedidoForm = $('pedidoForm');

    // ============================================================
    // ESTADO
    // ============================================================

    let clientes = cargarClientes();
    let pedidos = cargarPedidos();

    let clienteDetalle = null;
    let clienteAEliminar = null;
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
        return prefijo + Date.now() + Math.random().toString(36).slice(2, 8);
    }

    function formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';

        const d = new Date(fecha);

        if (Number.isNaN(d.getTime())) {
            return 'Sin fecha';
        }

        return d.toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
            d.getMinutes() - d.getTimezoneOffset()
        );

        return d.toISOString().slice(0, 16);
    }

    function toast(mensaje, tipo = 'success') {
        const contenedor = $('toast');

        if (contenedor) {
            const icono = $('toastIcon');
            const texto = $('toastMessage');

            if (texto) {
                texto.textContent = mensaje;
            }

            if (icono) {
                icono.textContent = tipo === 'error' ? '!' : '✓';
            }

            contenedor.classList.add('show');

            clearTimeout(window.__toastTimer);

            window.__toastTimer = setTimeout(() => {
                contenedor.classList.remove('show');
            }, 3000);

            return;
        }

        const t = document.createElement('div');

        t.textContent = mensaje;

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

        setTimeout(() => {
            t.remove();
        }, 3000);
    }

    // ============================================================
    // LOCAL STORAGE - CLIENTES
    // ============================================================

    function cargarClientes() {
        try {
            const datos = JSON.parse(
                localStorage.getItem('clientesChiquis') || '[]'
            );

            return Array.isArray(datos) ? datos : [];

        } catch (e) {
            console.error(e);
            return [];
        }
    }

    function guardarClientes() {
        try {
            localStorage.setItem(
                'clientesChiquis',
                JSON.stringify(clientes)
            );

            return true;

        } catch (e) {
            console.error(
                'No se pudieron guardar los clientes:',
                e
            );

            toast(
                'No se pudieron guardar los clientes.',
                'error'
            );

            return false;
        }
    }

    // ============================================================
    // LOCAL STORAGE - PEDIDOS
    // ============================================================

    function cargarPedidos() {
        try {
            const datos = JSON.parse(
                localStorage.getItem('pedidosChiquis') || '[]'
            );

            return Array.isArray(datos) ? datos : [];

        } catch (e) {
            console.error(e);
            return [];
        }
    }

    function guardarPedidos() {
        try {
            localStorage.setItem(
                'pedidosChiquis',
                JSON.stringify(pedidos)
            );

            return true;

        } catch (e) {
            console.error(
                'No se pudieron guardar los pedidos:',
                e
            );

            toast(
                'No se pudieron guardar los pedidos.',
                'error'
            );

            return false;
        }
    }

    // ============================================================
    // CLIENTES
    // ============================================================

    function obtenerTipoCliente() {
        const mayorista = $('tipoMayorista');

        return mayorista && mayorista.checked
            ? 'mayorista'
            : 'minorista';
    }

    function actualizarCamposTipo() {
        const mayorista = $('tipoMayorista')?.checked;
        const campos = $('camposMayorista');
        const hint = $('tipoHint');
        const descuento = $('descuento');

        if (campos) {
            campos.hidden = !mayorista;
        }

        if (descuento) {
            descuento.disabled = !mayorista;
        }

        if (!mayorista && descuento) {
            descuento.value = '0';
        }

        if (hint) {
            hint.textContent = mayorista
                ? 'Cliente que realiza compras por volumen y puede recibir descuento.'
                : 'Compra para uso personal, en unidades sueltas.';
        }
    }

    function limpiarErrores() {
        document
            .querySelectorAll('.error-message')
            .forEach(e => e.remove());

        document
            .querySelectorAll('.error')
            .forEach(e => e.classList.remove('error'));
    }

    function mostrarError(elemento, mensaje) {
        if (!elemento) return;

        elemento.classList.add('error');

        const error = document.createElement('div');

        error.className = 'error-message';
        error.textContent = mensaje;

        elemento.parentElement?.appendChild(error);
    }

    function validarCliente() {
        limpiarErrores();

        let valido = true;

        const nombre = $('nombre');
        const telefono = $('telefono');
        const email = $('email');
        const nit = $('nit');
        const descuento = $('descuento');

        const mayorista =
            $('tipoMayorista')?.checked;

        // NOMBRE
        if (
            !nombre?.value.trim() ||
            nombre.value.trim().length < 3
        ) {
            mostrarError(
                nombre,
                'Ingrese un nombre válido.'
            );

            valido = false;
        }

        // TELÉFONO
        const telefonoLimpio =
            (telefono?.value || '').replace(/\D/g, '');

        if (!telefonoLimpio) {
            mostrarError(
                telefono,
                'Ingrese el número de teléfono.'
            );

            valido = false;

        } else if (telefonoLimpio.length < 8) {
            mostrarError(
                telefono,
                'Ingrese un teléfono válido.'
            );

            valido = false;
        }

        // EMAIL
        if (email?.value.trim()) {
            const correcto =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(email.value.trim());

            if (!correcto) {
                mostrarError(
                    email,
                    'Ingrese un correo válido.'
                );

                valido = false;
            }
        }

        // NIT MAYORISTA
        if (
            mayorista &&
            !nit?.value.trim()
        ) {
            mostrarError(
                nit,
                'El NIT es obligatorio para mayoristas.'
            );

            valido = false;
        }

        // DESCUENTO
        const desc =
            Number(descuento?.value || 0);

        if (desc < 0 || desc > 100) {
            mostrarError(
                descuento,
                'El descuento debe estar entre 0 y 100.'
            );

            valido = false;
        }

        if (!valido) {
            toast(
                'Revisa los campos marcados.',
                'error'
            );
        }

        return valido;
    }

    // ============================================================
    // ABRIR PANEL CLIENTE
    // ============================================================

    function abrirPanelCliente(cliente = null) {
        if (!panel || !clienteForm) {
            return;
        }

        if (overlay) {
            overlay.hidden = false;
        }

        panel.classList.add('is-open');
        panel.setAttribute(
            'aria-hidden',
            'false'
        );

        clienteForm.reset();

        limpiarErrores();

        if ($('clienteId')) {
            $('clienteId').value =
                cliente?.id || '';
        }

        if ($('panelTitulo')) {
            $('panelTitulo').textContent =
                cliente
                    ? 'Editar cliente'
                    : 'Nuevo cliente';
        }

        if (cliente) {

            if ($('nombre')) {
                $('nombre').value =
                    cliente.nombre || '';
            }

            if ($('telefono')) {
                $('telefono').value =
                    cliente.telefono || '';
            }

            if ($('email')) {
                $('email').value =
                    cliente.email || '';
            }

            if ($('direccion')) {
                $('direccion').value =
                    cliente.direccion || '';
            }

            if ($('dpi')) {
                $('dpi').value =
                    cliente.dpi || '';
            }

            if ($('nit')) {
                $('nit').value =
                    cliente.nit || '';
            }

            if ($('descuento')) {
                $('descuento').value =
                    cliente.descuento ?? 0;
            }

            if ($('limiteCredito')) {
                $('limiteCredito').value =
                    cliente.limiteCredito ?? 0;
            }

            if ($('notas')) {
                $('notas').value =
                    cliente.notas || '';
            }

            if (
                cliente.tipo === 'mayorista'
            ) {
                if ($('tipoMayorista')) {
                    $('tipoMayorista').checked = true;
                }

            } else {
                if ($('tipoMinorista')) {
                    $('tipoMinorista').checked = true;
                }
            }

        } else {

            if ($('tipoMinorista')) {
                $('tipoMinorista').checked = true;
            }

            if ($('descuento')) {
                $('descuento').value = 0;
            }

            if ($('limiteCredito')) {
                $('limiteCredito').value = 0;
            }
        }

        actualizarCamposTipo();
        actualizarContadorNotas();

        setTimeout(() => {
            $('nombre')?.focus();
        }, 100);
    }

    // ============================================================
    // CERRAR PANEL CLIENTE
    // ============================================================

    function cerrarPanelCliente() {
        if (!panel) return;

        panel.classList.remove('is-open');

        panel.setAttribute(
            'aria-hidden',
            'true'
        );

        if (
            !pedidoPanel?.classList.contains('is-open')
        ) {
            if (overlay) {
                overlay.hidden = true;
            }
        }
    }

    // ============================================================
    // GUARDAR CLIENTE
    // ============================================================

    function guardarClienteDesdeFormulario(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!validarCliente()) {
            return;
        }

        const id =
            $('clienteId')?.value ||
            generarId('cliente-');

        const existente =
            clientes.find(c => c.id === id);

        const tipo =
            obtenerTipoCliente();

        const datos = {
            id: id,

            tipo: tipo,

            nombre:
                $('nombre')?.value.trim() || '',

            telefono:
                $('telefono')?.value.trim() || '',

            email:
                $('email')?.value.trim() || '',

            direccion:
                $('direccion')?.value.trim() || '',

            dpi:
                $('dpi')?.value.trim() || '',

            nit:
                $('nit')?.value.trim() || '',

            descuento:
                tipo === 'mayorista'
                    ? Number(
                        $('descuento')?.value || 0
                    )
                    : 0,

            limiteCredito:
                Number(
                    $('limiteCredito')?.value || 0
                ),

            notas:
                $('notas')?.value.trim() || '',

            fecha:
                existente?.fecha ||
                new Date().toISOString()
        };

        if (existente) {

            clientes =
                clientes.map(c =>
                    c.id === id
                        ? datos
                        : c
                );

            toast(
                'Cliente actualizado correctamente.'
            );

        } else {

            clientes.push(datos);

            toast(
                'Cliente registrado correctamente.'
            );
        }

        if (guardarClientes()) {
            mostrarClientes();
            cargarClientesEnSelect();
            cerrarPanelCliente();
        }
    }

    // ============================================================
    // MOSTRAR CLIENTES
    // ============================================================

    function mostrarClientes(lista = clientes) {
        const tbody = $('tablaBody');

        if (!tbody) {
            return;
        }

        tbody.innerHTML = '';

        const empty =
            $('emptyState');

        if (empty) {
            empty.hidden =
                lista.length !== 0;
        }

        lista.forEach(cliente => {

            const tr =
                document.createElement('tr');

            const tipo =
                cliente.tipo === 'mayorista'
                    ? 'Mayorista'
                    : 'Minorista';

            tr.innerHTML = `
                <td>
                    <div class="cliente-nombre">
                        <strong>
                            ${escaparHTML(cliente.nombre)}
                        </strong>

                        <small>
                            ${escaparHTML(
                                cliente.telefono || ''
                            )}
                        </small>
                    </div>
                </td>

                <td>
                    <span class="tipo-cliente">
                        ${tipo}
                    </span>
                </td>

                <td>
                    ${escaparHTML(
                        cliente.email || '—'
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        cliente.nit || '—'
                    )}
                </td>

                <td>
                    ${Number(
                        cliente.descuento || 0
                    )}%
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
                            data-id="${cliente.id}">
                            👁
                        </button>

                        <button
                            type="button"
                            class="btn-accion btn-editar"
                            data-id="${cliente.id}">
                            ✏
                        </button>

                        <button
                            type="button"
                            class="btn-accion btn-eliminar"
                            data-id="${cliente.id}">
                            🗑
                        </button>

                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        actualizarEstadisticasClientes();
        actualizarContadoresClientes();

        const resultado =
            $('resultadoTexto');

        const footer =
            $('tableFooterText');

        if (resultado) {
            resultado.textContent =
                `${lista.length} ${
                    lista.length === 1
                        ? 'cliente'
                        : 'clientes'
                }`;
        }

        if (footer) {
            footer.textContent =
                `${lista.length} de ${clientes.length} clientes`;
        }
    }

    // ============================================================
    // ESTADÍSTICAS CLIENTES
    // ============================================================

    function actualizarEstadisticasClientes() {

        const total =
            clientes.length;

        const minoristas =
            clientes.filter(
                c => c.tipo !== 'mayorista'
            ).length;

        const mayoristas =
            clientes.filter(
                c => c.tipo === 'mayorista'
            ).length;

        if ($('statTotal')) {
            $('statTotal').textContent =
                total;
        }

        if ($('statMinorista')) {
            $('statMinorista').textContent =
                minoristas;
        }

        if ($('statMayorista')) {
            $('statMayorista').textContent =
                mayoristas;
        }

        if ($('statVisibles')) {
            $('statVisibles').textContent =
                total;
        }

        if ($('porcentajeMinorista')) {
            $('porcentajeMinorista').textContent =
                total
                    ? Math.round(
                        minoristas * 100 / total
                    ) + '% del total'
                    : '0% del total';
        }

        if ($('porcentajeMayorista')) {
            $('porcentajeMayorista').textContent =
                total
                    ? Math.round(
                        mayoristas * 100 / total
                    ) + '% del total'
                    : '0% del total';
        }
    }

    // ============================================================
    // CONTADORES CLIENTES
    // ============================================================

    function actualizarContadoresClientes() {

        if ($('countTodos')) {
            $('countTodos').textContent =
                clientes.length;
        }

        if ($('countMinoristas')) {
            $('countMinoristas').textContent =
                clientes.filter(
                    c => c.tipo !== 'mayorista'
                ).length;
        }

        if ($('countMayoristas')) {
            $('countMayoristas').textContent =
                clientes.filter(
                    c => c.tipo === 'mayorista'
                ).length;
        }
    }

    // ============================================================
    // DETALLE CLIENTE
    // ============================================================

    function mostrarDetalleCliente(cliente) {

        clienteDetalle = cliente;

        if ($('detalleAvatar')) {
            $('detalleAvatar').textContent =
                (cliente.nombre || 'C')
                    .charAt(0)
                    .toUpperCase();
        }

        if ($('detalleNombre')) {
            $('detalleNombre').textContent =
                cliente.nombre || '—';
        }

        if ($('detalleTipo')) {
            $('detalleTipo').textContent =
                cliente.tipo === 'mayorista'
                    ? 'Mayorista'
                    : 'Minorista';
        }

        if ($('detalleTelefono')) {
            $('detalleTelefono').textContent =
                cliente.telefono || '—';
        }

        if ($('detalleEmail')) {
            $('detalleEmail').textContent =
                cliente.email || '—';
        }

        if ($('detalleDireccion')) {
            $('detalleDireccion').textContent =
                cliente.direccion || '—';
        }

        if ($('detalleFecha')) {
            $('detalleFecha').textContent =
                formatearFecha(cliente.fecha);
        }

        if ($('detalleIdentificacion')) {
            $('detalleIdentificacion').textContent =
                `DPI: ${cliente.dpi || '—'} | NIT: ${cliente.nit || '—'}`;
        }

        if ($('detalleComercial')) {
            $('detalleComercial').textContent =
                `Descuento: ${
                    Number(cliente.descuento || 0)
                }% | Crédito: ${
                    dinero(cliente.limiteCredito || 0)
                }`;
        }

        if ($('detalleNotas')) {
            $('detalleNotas').textContent =
                cliente.notas ||
                'Sin notas registradas.';
        }

        $('dialogDetalle')?.showModal();
    }

    // ============================================================
    // ELIMINAR CLIENTE
    // ============================================================

    function eliminarCliente(cliente) {

        if (!cliente) {
            return;
        }

        if (
            !confirm(
                `¿Deseas eliminar al cliente "${cliente.nombre}"?`
            )
        ) {
            return;
        }

        clientes =
            clientes.filter(
                c => c.id !== cliente.id
            );

        guardarClientes();

        mostrarClientes();

        cargarClientesEnSelect();

        toast(
            'Cliente eliminado correctamente.'
        );
    }

    // ============================================================
    // PEDIDOS
    // ============================================================

    function numeroPedido() {

        let max = 0;

        pedidos.forEach(p => {

            const n =
                parseInt(
                    String(
                        p.numero || ''
                    ).replace(/\D/g, ''),
                    10
                );

            if (!Number.isNaN(n)) {
                max = Math.max(max, n);
            }
        });

        return (
            'PED-' +
            String(max + 1).padStart(4, '0')
        );
    }

    // ============================================================
    // CLIENTES EN SELECT DE PEDIDOS
    // ============================================================

    function cargarClientesEnSelect(
        seleccionado = ''
    ) {

        const select =
            $('pedidoCliente');

        if (!select) {
            return;
        }

        select.innerHTML =
            '<option value="">Seleccione un cliente</option>';

        clientes.forEach(c => {

            const op =
                document.createElement('option');

            op.value = c.id;

            op.textContent =
                `${c.nombre} — ${
                    c.telefono ||
                    'sin teléfono'
                }`;

            if (
                String(c.id) ===
                String(seleccionado)
            ) {
                op.selected = true;
            }

            select.appendChild(op);
        });
    }

    // ============================================================
    // AGREGAR PRODUCTO AL PEDIDO
    // ============================================================

    function agregarFilaProducto(
        producto = {}
    ) {

        const contenedor =
            $('productosPedido');

        if (!contenedor) {
            return;
        }

        const row =
            document.createElement('div');

        row.className =
            'producto-pedido-row';

        row.innerHTML = `
            <div>
                <label>Producto</label>

                <input
                    type="text"
                    class="producto-nombre"
                    placeholder="Ej. Camisa"
                    value="${escaparHTML(
                        producto.nombre || ''
                    )}">
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
                    )}">
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
                    )}">
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
                    )}">
            </div>

            <div>
                <button
                    type="button"
                    class="btn-quitar-producto"
                    title="Quitar producto">
                    ×
                </button>
            </div>
        `;

        contenedor.appendChild(row);

        row
            .querySelectorAll(
                '.producto-cantidad, .producto-precio'
            )
            .forEach(input => {

                input.addEventListener(
                    'input',
                    calcularTotalesPedido
                );
            });

        row
            .querySelector(
                '.btn-quitar-producto'
            )
            ?.addEventListener(
                'click',
                () => {

                    row.remove();

                    calcularTotalesPedido();
                }
            );

        calcularTotalesPedido();
    }

    // ============================================================
    // OBTENER PRODUCTOS
    // ============================================================

    function obtenerProductosPedido() {

        return [
            ...document.querySelectorAll(
                '#productosPedido .producto-pedido-row'
            )
        ]

        .map(row => ({

            nombre:
                row
                    .querySelector(
                        '.producto-nombre'
                    )
                    ?.value.trim() || '',

            cantidad:
                Number(
                    row
                        .querySelector(
                            '.producto-cantidad'
                        )
                        ?.value || 0
                ),

            precio:
                Number(
                    row
                        .querySelector(
                            '.producto-precio'
                        )
                        ?.value || 0
                )
        }))

        .filter(
            p =>
                p.nombre &&
                p.cantidad > 0 &&
                p.precio >= 0
        );
    }

    // ============================================================
    // CALCULAR TOTALES
    // ============================================================

    function calcularTotalesPedido() {

        let subtotal = 0;

        document
            .querySelectorAll(
                '#productosPedido .producto-pedido-row'
            )
            .forEach(row => {

                const cantidad =
                    Number(
                        row
                            .querySelector(
                                '.producto-cantidad'
                            )
                            ?.value || 0
                    );

                const precio =
                    Number(
                        row
                            .querySelector(
                                '.producto-precio'
                            )
                            ?.value || 0
                    );

                const sub =
                    cantidad * precio;

                subtotal += sub;

                const campo =
                    row.querySelector(
                        '.producto-subtotal'
                    );

                if (campo) {
                    campo.value =
                        dinero(sub);
                }
            });

        const cliente =
            clientes.find(
                c =>
                    String(c.id) ===
                    String(
                        $('pedidoCliente')?.value
                    )
            );

        const porcentaje =
            cliente?.tipo === 'mayorista'
                ? Number(
                    cliente.descuento || 0
                )
                : 0;

        const descuento =
            subtotal * porcentaje / 100;

        const total =
            subtotal - descuento;

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

        return {
            subtotal,
            descuento,
            total,
            porcentaje
        };
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

        if ($('pedidoPanelTitulo')) {
            $('pedidoPanelTitulo').textContent =
                pedido
                    ? 'Editar pedido'
                    : 'Nuevo pedido';
        }

        if ($('pedidoId')) {
            $('pedidoId').value =
                pedido?.id || '';
        }

        if ($('pedidoNumero')) {
            $('pedidoNumero').value =
                pedido?.numero ||
                numeroPedido();
        }

        if ($('pedidoFecha')) {
            $('pedidoFecha').value =
                pedido?.fecha
                    ? new Date(
                        pedido.fecha
                    )
                        .toISOString()
                        .slice(0, 16)
                    : fechaActualInput();
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
                pedido?.direccion || '';
        }

        if ($('pedidoNotas')) {
            $('pedidoNotas').value =
                pedido?.notas || '';
        }

        cargarClientesEnSelect(
            pedido?.clienteId || ''
        );

        if ($('productosPedido')) {
            $('productosPedido').innerHTML = '';
        }

        if (
            pedido?.productos &&
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

        calcularTotalesPedido();
    }

    // ============================================================
    // CERRAR PANEL PEDIDO
    // ============================================================

    function cerrarPanelPedido() {

        pedidoPanel?.classList.remove(
            'is-open'
        );

        pedidoPanel?.setAttribute(
            'aria-hidden',
            'true'
        );

        if (
            !panel?.classList.contains(
                'is-open'
            )
        ) {
            if (overlay) {
                overlay.hidden = true;
            }
        }
    }

    // ============================================================
    // GUARDAR PEDIDO
    // ============================================================

    function guardarPedidoDesdeFormulario(e) {

        e.preventDefault();
        e.stopPropagation();

        const clienteId =
            $('pedidoCliente')?.value;

        const fecha =
            $('pedidoFecha')?.value;

        const productos =
            obtenerProductosPedido();

        // CLIENTE
        if (!clienteId) {

            toast(
                'Selecciona un cliente para el pedido.',
                'error'
            );

            $('pedidoCliente')?.focus();

            return;
        }

        // FECHA
        if (!fecha) {

            toast(
                'Ingresa la fecha del pedido.',
                'error'
            );

            $('pedidoFecha')?.focus();

            return;
        }

        // PRODUCTOS
        if (!productos.length) {

            toast(
                'Agrega al menos un producto con nombre y cantidad.',
                'error'
            );

            return;
        }

        const cliente =
            clientes.find(
                c =>
                    String(c.id) ===
                    String(clienteId)
            );

        if (!cliente) {

            toast(
                'El cliente seleccionado no existe.',
                'error'
            );

            return;
        }

        const totales =
            calcularTotalesPedido();

        const id =
            $('pedidoId')?.value ||
            generarId('pedido-');

        const existente =
            pedidos.find(
                p => p.id === id
            );

        const datos = {

            id,

            numero:
                $('pedidoNumero')?.value ||
                numeroPedido(),

            clienteId:
                cliente.id,

            clienteNombre:
                cliente.nombre,

            clienteTelefono:
                cliente.telefono || '',

            productos:
                productos.map(p => ({
                    ...p,
                    subtotal:
                        p.cantidad *
                        p.precio
                })),

            subtotal:
                totales.subtotal,

            descuento:
                totales.descuento,

            porcentajeDescuento:
                totales.porcentaje,

            total:
                totales.total,

            fecha:
                new Date(fecha).toISOString(),

            origen:
                $('pedidoOrigen')?.value ||
                'WhatsApp',

            estado:
                $('pedidoEstado')?.value ||
                'pendiente',

            direccion:
                $('pedidoDireccion')
                    ?.value.trim() || '',

            notas:
                $('pedidoNotas')
                    ?.value.trim() || ''
        };

        if (existente) {

            pedidos =
                pedidos.map(p =>
                    p.id === id
                        ? datos
                        : p
                );

            toast(
                'Pedido actualizado correctamente.'
            );

        } else {

            pedidos.push(datos);

            toast(
                'Pedido registrado correctamente.'
            );
        }

        if (guardarPedidos()) {

            mostrarPedidos();

            actualizarEstadisticasPedidos();

            cerrarPanelPedido();
        }
    }

    // ============================================================
    // ESTADO DEL PEDIDO
    // ============================================================

    function estadoTexto(estado) {

        return {

            pendiente: 'Pendiente',

            preparando: 'Preparando',

            entregado: 'Entregado',

            cancelado: 'Cancelado'

        }[estado] ||
            estado ||
            'Pendiente';
    }

    // ============================================================
    // MOSTRAR PEDIDOS
    // ============================================================

    function mostrarPedidos() {

        const tbody =
            $('pedidosBody');

        if (!tbody) {
            return;
        }

        tbody.innerHTML = '';

        const texto =
            (
                $('searchPedidos')
                    ?.value || ''
            )
                .toLowerCase()
                .trim();

        let lista =
            pedidos.filter(p => {

                const estadoOk =
                    filtroPedido === 'todos' ||
                    p.estado === filtroPedido;

                const contenido =
                    `${p.numero} ${
                        p.clienteNombre || ''
                    } ${
                        p.clienteTelefono || ''
                    } ${
                        p.origen || ''
                    }`
                        .toLowerCase();

                return (
                    estadoOk &&
                    (
                        !texto ||
                        contenido.includes(texto)
                    )
                );
            });

        lista.sort(
            (a, b) =>
                new Date(b.fecha) -
                new Date(a.fecha)
        );

        const empty =
            $('emptyPedidos');

        if (empty) {
            empty.hidden =
                lista.length !== 0;
        }

        lista.forEach(p => {

            const tr =
                document.createElement('tr');

            const productos =
                (p.productos || [])
                    .map(
                        x =>
                            `${x.nombre} (${x.cantidad})`
                    )
                    .join(', ');

            tr.innerHTML = `

                <td>
                    <strong>
                        ${escaparHTML(
                            p.numero
                        )}
                    </strong>
                </td>

                <td>
                    ${escaparHTML(
                        p.clienteNombre ||
                        'Sin cliente'
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        productos ||
                        'Sin productos'
                    )}
                </td>

                <td>
                    <strong>
                        ${dinero(p.total)}
                    </strong>
                </td>

                <td>
                    ${formatearFechaHora(
                        p.fecha
                    )}
                </td>

                <td>
                    <span
                        class="estado-pedido estado-${escaparHTML(
                            p.estado
                        )}">
                        ${estadoTexto(
                            p.estado
                        )}
                    </span>
                </td>

                <td>

                    <div class="acciones-pedido">

                        <button
                            type="button"
                            class="btn-accion btn-ver-pedido"
                            data-id="${p.id}">
                            👁
                        </button>

                        <button
                            type="button"
                            class="btn-accion btn-editar-pedido"
                            data-id="${p.id}">
                            ✏
                        </button>

                        <button
                            type="button"
                            class="btn-accion btn-eliminar-pedido"
                            data-id="${p.id}">
                            🗑
                        </button>

                    </div>

                </td>
            `;

            tbody.appendChild(tr);
        });

        if ($('resultadoPedidos')) {

            $('resultadoPedidos')
                .textContent =
                `${lista.length} ${
                    lista.length === 1
                        ? 'pedido'
                        : 'pedidos'
                }`;
        }

        if ($('footerPedidos')) {

            $('footerPedidos')
                .textContent =
                `${lista.length} de ${pedidos.length} pedidos`;
        }
    }

    // ============================================================
    // ESTADÍSTICAS PEDIDOS
    // ============================================================

    function actualizarEstadisticasPedidos() {

        const total =
            pedidos.length;

        const pendientes =
            pedidos.filter(
                p => p.estado === 'pendiente'
            ).length;

        const preparando =
            pedidos.filter(
                p => p.estado === 'preparando'
            ).length;

        const entregados =
            pedidos.filter(
                p => p.estado === 'entregado'
            ).length;

        const ventas =
            pedidos
                .filter(
                    p => p.estado !== 'cancelado'
                )
                .reduce(
                    (s, p) =>
                        s +
                        Number(p.total || 0),
                    0
                );

        if ($('statPedidos')) {
            $('statPedidos').textContent =
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
            $('statVentas').textContent =
                dinero(ventas);
        }

        if ($('countPedidosTodos')) {
            $('countPedidosTodos')
                .textContent =
                total;
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
    // DETALLE PEDIDO
    // ============================================================

    function mostrarDetallePedido(pedido) {

        pedidoDetalleActual =
            pedido;

        if ($('detallePedidoNumero')) {
            $('detallePedidoNumero')
                .textContent =
                pedido.numero;
        }

        if ($('detallePedidoEstado')) {

            $('detallePedidoEstado')
                .textContent =
                estadoTexto(
                    pedido.estado
                );

            $('detallePedidoEstado')
                .className =
                `detail-badge estado-${pedido.estado}`;
        }

        if ($('detallePedidoCliente')) {
            $('detallePedidoCliente')
                .textContent =
                pedido.clienteNombre ||
                '—';
        }

        if ($('detallePedidoTelefono')) {
            $('detallePedidoTelefono')
                .textContent =
                pedido.clienteTelefono ||
                '—';
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
                pedido.origen || '—';
        }

        if ($('detallePedidoDireccion')) {
            $('detallePedidoDireccion')
                .textContent =
                pedido.direccion ||
                'No especificada';
        }

        if ($('detallePedidoTotal')) {
            $('detallePedidoTotal')
                .textContent =
                dinero(pedido.total);
        }

        if ($('detallePedidoNotas')) {
            $('detallePedidoNotas')
                .textContent =
                pedido.notas ||
                'Sin notas registradas.';
        }

        const cont =
            $('detallePedidoProductos');

        if (cont) {

            cont.innerHTML = '';

            (pedido.productos || [])
                .forEach(p => {

                    const item =
                        document.createElement('div');

                    item.className =
                        'detalle-producto';

                    item.innerHTML = `

                        <div>

                            <strong>
                                ${escaparHTML(
                                    p.nombre
                                )}
                            </strong>

                            <small>
                                ${p.cantidad}
                                ×
                                ${dinero(p.precio)}
                            </small>

                        </div>

                        <strong>
                            ${dinero(
                                p.subtotal
                            )}
                        </strong>
                    `;

                    cont.appendChild(item);
                });
        }

        $('dialogPedidoDetalle')
            ?.showModal();
    }

    // ============================================================
    // ELIMINAR PEDIDO
    // ============================================================

    function eliminarPedido(pedido) {

        if (!pedido) {
            return;
        }

        if (
            !confirm(
                `¿Deseas eliminar el pedido ${pedido.numero}?`
            )
        ) {
            return;
        }

        pedidos =
            pedidos.filter(
                p => p.id !== pedido.id
            );

        guardarPedidos();

        mostrarPedidos();

        actualizarEstadisticasPedidos();

        toast(
            'Pedido eliminado correctamente.'
        );
    }

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    function cambiarVista(vista) {

        const clientesToolbar =
            $('clientesToolbar');

        const clientesTable =
            $('clientesTableSection');

        const pedidosView =
            $('pedidosView');

        const pedidosStats =
            $('pedidosStats');

        const titulo =
            $('tituloPrincipal');

        const descripcion =
            $('descripcionPrincipal');

        const textoNuevo =
            $('textoBtnNuevo');

        const esPedidos =
            vista === 'pedidos';

        if (clientesToolbar) {
            clientesToolbar.hidden =
                esPedidos;
        }

        if (clientesTable) {
            clientesTable.hidden =
                esPedidos;
        }

        if (pedidosView) {
            pedidosView.hidden =
                !esPedidos;
        }

        if (pedidosStats) {
            pedidosStats.hidden =
                !esPedidos;
        }

        if (titulo) {
            titulo.textContent =
                esPedidos
                    ? 'Gestión de pedidos'
                    : 'Gestión de clientes';
        }

        if (descripcion) {
            descripcion.textContent =
                esPedidos
                    ? 'Centraliza y administra los pedidos recibidos por teléfono y WhatsApp.'
                    : 'Administra clientes y centraliza los pedidos recibidos por teléfono y WhatsApp.';
        }

        if (textoNuevo) {
            textoNuevo.textContent =
                esPedidos
                    ? 'Nuevo pedido'
                    : 'Nuevo cliente';
        }

        $('btnNavClientes')
            ?.classList.toggle(
                'active',
                !esPedidos
            );

        $('btnNavPedidos')
            ?.classList.toggle(
                'active',
                esPedidos
            );

        if (esPedidos) {

            cargarClientesEnSelect();

            mostrarPedidos();

            actualizarEstadisticasPedidos();

        } else {

            mostrarClientes();
        }
    }

    // ============================================================
    // CONTADOR DE NOTAS
    // ============================================================

    function actualizarContadorNotas() {

        if (
            $('notasCounter') &&
            $('notas')
        ) {

            $('notasCounter')
                .textContent =
                $('notas').value.length;
        }
    }

    // ============================================================
    // EVENTOS DE CLIENTES
    // ============================================================

    on(
        'clienteForm',
        'submit',
        guardarClienteDesdeFormulario
    );

    on(
        'tipoMinorista',
        'change',
        actualizarCamposTipo
    );

    on(
        'tipoMayorista',
        'change',
        actualizarCamposTipo
    );

    on(
        'notas',
        'input',
        actualizarContadorNotas
    );

    on(
        'btnNuevo',
        'click',
        () => {

            if (
                $('pedidosView') &&
                !$('pedidosView').hidden
            ) {

                abrirPanelPedido();

            } else {

                abrirPanelCliente();
            }
        }
    );

    on(
        'btnNuevoVacio',
        'click',
        () => abrirPanelCliente()
    );

    on(
        'btnFloating',
        'click',
        () => {

            if (
                $('pedidosView') &&
                !$('pedidosView').hidden
            ) {

                abrirPanelPedido();

            } else {

                abrirPanelCliente();
            }
        }
    );

    on(
        'btnCerrarPanel',
        'click',
        cerrarPanelCliente
    );

    on(
        'btnCancelar',
        'click',
        cerrarPanelCliente
    );

    // ============================================================
    // ACCIONES DE TABLA CLIENTES
    // ============================================================

    on(
        'tablaBody',
        'click',
        e => {

            const btn =
                e.target.closest(
                    'button[data-id]'
                );

            if (!btn) {
                return;
            }

            const cliente =
                clientes.find(
                    c =>
                        String(c.id) ===
                        String(btn.dataset.id)
                );

            if (!cliente) {
                return;
            }

            if (
                btn.classList.contains(
                    'btn-ver'
                )
            ) {

                mostrarDetalleCliente(
                    cliente
                );
            }

            if (
                btn.classList.contains(
                    'btn-editar'
                )
            ) {

                abrirPanelCliente(
                    cliente
                );
            }

            if (
                btn.classList.contains(
                    'btn-eliminar'
                )
            ) {

                eliminarCliente(
                    cliente
                );
            }
        }
    );

    // ============================================================
    // BUSCADOR CLIENTES
    // ============================================================

    on(
        'searchInput',
        'input',
        e => {

            const q =
                e.target.value
                    .toLowerCase()
                    .trim();

            const filtrados =
                clientes.filter(c =>
                    `${c.nombre} ${
                        c.telefono
                    } ${
                        c.email || ''
                    } ${
                        c.nit || ''
                    } ${
                        c.dpi || ''
                    }`
                        .toLowerCase()
                        .includes(q)
                );

            mostrarClientes(
                filtrados
            );
        }
    );

    on(
        'btnLimpiarBusqueda',
        'click',
        () => {

            if ($('searchInput')) {
                $('searchInput').value =
                    '';
            }

            mostrarClientes();
        }
    );

    // ============================================================
    // DETALLE CLIENTE
    // ============================================================

    on(
        'btnCerrarDetalle',
        'click',
        () =>
            $('dialogDetalle')
                ?.close()
    );

    on(
        'btnEditarDetalle',
        'click',
        () => {

            if (!clienteDetalle) {
                return;
            }

            $('dialogDetalle')
                ?.close();

            abrirPanelCliente(
                clienteDetalle
            );
        }
    );

    on(
        'btnLlamar',
        'click',
        () => {

            if (
                clienteDetalle?.telefono
            ) {

                window.location.href =
                    `tel:${clienteDetalle.telefono}`;
            }
        }
    );

    on(
        'btnWhatsApp',
        'click',
        () => {

            if (
                !clienteDetalle?.telefono
            ) {
                return;
            }

            const numero =
                clienteDetalle.telefono
                    .replace(/\D/g, '');

            window.open(
                `https://wa.me/502${numero}`,
                '_blank'
            );
        }
    );

    // ============================================================
    // EVENTOS PEDIDOS
    // ============================================================

    on(
        'pedidoForm',
        'submit',
        guardarPedidoDesdeFormulario
    );

    on(
        'pedidoCliente',
        'change',
        calcularTotalesPedido
    );

    on(
        'btnAgregarProducto',
        'click',
        () => agregarFilaProducto()
    );

    on(
        'btnNuevoPedido',
        'click',
        () => abrirPanelPedido()
    );

    on(
        'btnNuevoPedidoVacio',
        'click',
        () => abrirPanelPedido()
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

    // ============================================================
    // ACCIONES TABLA PEDIDOS
    // ============================================================

    on(
        'pedidosBody',
        'click',
        e => {

            const btn =
                e.target.closest(
                    'button[data-id]'
                );

            if (!btn) {
                return;
            }

            const pedido =
                pedidos.find(
                    p =>
                        String(p.id) ===
                        String(btn.dataset.id)
                );

            if (!pedido) {
                return;
            }

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
    // BUSCADOR PEDIDOS
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

            filtroPedido = 'todos';

            document
                .querySelectorAll(
                    '.filtro-pedido'
                )
                .forEach(
                    b =>
                        b.classList.remove(
                            'active'
                        )
                );

            document
                .querySelector(
                    '.filtro-pedido[data-filtro="todos"]'
                )
                ?.classList.add(
                    'active'
                );

            mostrarPedidos();
        }
    );

    // ============================================================
    // FILTROS PEDIDOS
    // ============================================================

    document
        .querySelectorAll(
            '.filtro-pedido'
        )
        .forEach(btn => {

            btn.addEventListener(
                'click',
                () => {

                    filtroPedido =
                        btn.dataset.filtro ||
                        'todos';

                    document
                        .querySelectorAll(
                            '.filtro-pedido'
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
        });

    // ============================================================
    // DETALLE PEDIDO
    // ============================================================

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
    // WHATSAPP PEDIDO
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
                    .replace(/\D/g, '');

            let mensaje =
                `Hola ${
                    p.clienteNombre || ''
                },%0A%0A`;

            mensaje +=
                `Detalle del pedido ${
                    p.numero
                }:%0A%0A`;

            (p.productos || [])
                .forEach(x => {

                    mensaje +=
                        `• ${
                            x.nombre
                        } — ${
                            x.cantidad
                        } x ${
                            dinero(x.precio)
                        } = ${
                            dinero(x.subtotal)
                        }%0A`;
                });

            mensaje +=
                `%0ATotal: ${
                    dinero(p.total)
                }`;

            window.open(
                `https://wa.me/502${telefono}?text=${mensaje}`,
                '_blank'
            );
        }
    );

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    on(
        'btnNavClientes',
        'click',
        () =>
            cambiarVista('clientes')
    );

    on(
        'btnNavPedidos',
        'click',
        () =>
            cambiarVista('pedidos')
    );

    on(
        'btnNavEstadisticas',
        'click',
        () => {

            if (
                $('pedidosView') &&
                !$('pedidosView').hidden
            ) {

                $('pedidosStats')
                    ?.scrollIntoView({
                        behavior: 'smooth'
                    });

            } else {

                document
                    .querySelector(
                        '.stats-grid'
                    )
                    ?.scrollIntoView({
                        behavior: 'smooth'
                    });
            }
        }
    );

    // ============================================================
    // OVERLAY
    // ============================================================

    on(
        'overlay',
        'click',
        () => {

            if (
                pedidoPanel?.classList.contains(
                    'is-open'
                )
            ) {

                cerrarPanelPedido();

            } else {

                cerrarPanelCliente();
            }
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
            $('btnTemaDesktop').textContent =
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
    // DESCARGAR ARCHIVO
    // ============================================================

    function descargar(
        nombre,
        contenido,
        tipo
    ) {

        const blob =
            new Blob(
                [contenido],
                { type: tipo }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement('a');

        a.href = url;

        a.download = nombre;

        document.body.appendChild(a);

        a.click();

        a.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    // ============================================================
    // EXPORTAR CLIENTES
    // ============================================================

    function exportarClientes() {

        if (!clientes.length) {

            toast(
                'No hay clientes para exportar.',
                'error'
            );

            return;
        }

        const encabezados = [
            'Nombre',
            'Tipo',
            'Telefono',
            'Correo',
            'DPI',
            'NIT',
            'Direccion',
            'Descuento',
            'LimiteCredito',
            'Notas',
            'Fecha'
        ];

        const filas =
            clientes.map(c => [

                c.nombre,

                c.tipo,

                c.telefono,

                c.email || '',

                c.dpi || '',

                c.nit || '',

                c.direccion || '',

                c.descuento || 0,

                c.limiteCredito || 0,

                c.notas || '',

                formatearFecha(
                    c.fecha
                )
            ]);

        const csv =
            [
                encabezados,
                ...filas
            ]
                .map(
                    f =>
                        f
                            .map(
                                v =>
                                    `"${String(v)
                                        .replace(
                                            /"/g,
                                            '""'
                                        )}"`
                            )
                            .join(',')
                )
                .join('\n');

        descargar(
            'clientes-variedades-chiquis.csv',
            '\ufeff' + csv,
            'text/csv;charset=utf-8'
        );

        toast(
            'Clientes exportados correctamente.'
        );
    }

    on(
        'btnExportar',
        'click',
        exportarClientes
    );

    on(
        'btnExportarNav',
        'click',
        exportarClientes
    );

    on(
        'btnExportarOpciones',
        'click',
        exportarClientes
    );

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
    // IMPORTAR CLIENTES
    // ============================================================

    function importarClientes() {

        $('inputImportar')?.click();
    }

    on(
        'btnImportar',
        'click',
        importarClientes
    );

    on(
        'btnImportarNav',
        'click',
        importarClientes
    );

    on(
        'inputImportar',
        'change',
        e => {

            const archivo =
                e.target.files?.[0];

            if (!archivo) {
                return;
            }

            const lector =
                new FileReader();

            lector.onload = () => {

                try {

                    const datos =
                        JSON.parse(
                            lector.result
                        );

                    if (
                        !Array.isArray(
                            datos
                        )
                    ) {
                        throw new Error(
                            'Formato incorrecto'
                        );
                    }

                    clientes = datos;

                    guardarClientes();

                    mostrarClientes();

                    cargarClientesEnSelect();

                    toast(
                        `${clientes.length} clientes importados.`
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    toast(
                        'No se pudo importar el archivo.',
                        'error'
                    );
                }

                e.target.value = '';
            };

            lector.readAsText(
                archivo
            );
        }
    );

    // ============================================================
    // ELIMINACIÓN
    // ============================================================

    on(
        'btnCancelarEliminar',
        'click',
        () =>
            $('dialogEliminar')
                ?.close()
    );

    on(
        'btnConfirmarEliminar',
        'click',
        () => {

            if (
                clienteAEliminar
            ) {

                eliminarCliente(
                    clienteAEliminar
                );
            }

            $('dialogEliminar')
                ?.close();

            clienteAEliminar = null;
        }
    );

    // ============================================================
    // CARGAR CLIENTES DE EJEMPLO
    // ============================================================

    on(
        'btnCargarEjemplos',
        'click',
        () => {

            if (
                clientes.length &&
                !confirm(
                    'Ya existen clientes. ¿Deseas agregar ejemplos?'
                )
            ) {
                return;
            }

            const ejemplos = [

                {
                    nombre:
                        'María López',

                    telefono:
                        '55551234',

                    email:
                        'maria@gmail.com',

                    tipo:
                        'minorista'
                },

                {
                    nombre:
                        'Distribuidora Chiquis',

                    telefono:
                        '55552345',

                    email:
                        'ventas@distribuidora.com',

                    tipo:
                        'mayorista'
                }
            ];

            ejemplos.forEach(x => {

                clientes.push({

                    id:
                        generarId(
                            'cliente-'
                        ),

                    ...x,

                    direccion:
                        '',

                    dpi:
                        '',

                    nit:
                        '',

                    descuento:
                        x.tipo === 'mayorista'
                            ? 10
                            : 0,

                    limiteCredito:
                        0,

                    notas:
                        '',

                    fecha:
                        new Date()
                            .toISOString()
                });
            });

            guardarClientes();

            mostrarClientes();

            cargarClientesEnSelect();

            toast(
                'Ejemplos agregados.'
            );
        }
    );

    // ============================================================
    // ELIMINAR TODOS LOS CLIENTES
    // ============================================================

    on(
        'btnEliminarTodos',
        'click',
        () => {

            if (!clientes.length) {

                toast(
                    'No hay clientes para eliminar.',
                    'error'
                );

                return;
            }

            if (
                !confirm(
                    '¿Seguro que deseas eliminar TODOS los clientes?'
                )
            ) {
                return;
            }

            clientes = [];

            guardarClientes();

            mostrarClientes();

            cargarClientesEnSelect();

            toast(
                'Todos los clientes fueron eliminados.'
            );
        }
    );

    // ============================================================
    // CERRAR OPCIONES
    // ============================================================

    on(
        'btnCerrarOpciones',
        'click',
        () =>
            $('dialogOpciones')
                ?.close()
    );

    // ============================================================
    // TECLADO
    // ============================================================

    document.addEventListener(
        'keydown',
        e => {

            // ESC
            if (e.key === 'Escape') {

                if (
                    pedidoPanel?.classList.contains(
                        'is-open'
                    )
                ) {

                    cerrarPanelPedido();

                } else if (
                    panel?.classList.contains(
                        'is-open'
                    )
                ) {

                    cerrarPanelCliente();
                }
            }

            // CTRL + N
            if (
                e.ctrlKey &&
                e.key.toLowerCase() === 'n'
            ) {

                e.preventDefault();

                if (
                    $('pedidosView') &&
                    !$('pedidosView').hidden
                ) {

                    abrirPanelPedido();

                } else {

                    abrirPanelCliente();
                }
            }

            // CTRL + K
            if (
                e.ctrlKey &&
                e.key.toLowerCase() === 'k'
            ) {

                e.preventDefault();

                (
                    $('searchInput') ||
                    $('searchPedidos')
                )?.focus();
            }
        }
    );

    // ============================================================
    // INICIO
    // ============================================================

    actualizarCamposTipo();

    actualizarContadorNotas();

    mostrarClientes();

    actualizarEstadisticasPedidos();

    cambiarVista('clientes');

});