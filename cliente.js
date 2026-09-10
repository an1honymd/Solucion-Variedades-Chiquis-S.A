document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // VARIEDADES CHIQUIS - CLIENTES
    // ============================================================

    const $ = (id) => document.getElementById(id);

    const on = (id, event, fn) => {
        const el = $(id);
        if (el) el.addEventListener(event, fn);
        return el;
    };

    const overlay = $('overlay');
    const panel = $('panel');
    const clienteForm = $('clienteForm');

    let clientes = cargarClientes();
    let clienteDetalle = null;
    let clienteAEliminar = null;

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
    // LOCAL STORAGE
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
    // TIPO DE CLIENTE
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

    // ============================================================
    // VALIDACIONES
    // ============================================================

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

        $('clienteId').value =
            cliente?.id || '';

        $('panelTitulo').textContent =
            cliente
                ? 'Editar cliente'
                : 'Nuevo cliente';

        if (cliente) {
            $('nombre').value =
                cliente.nombre || '';

            $('telefono').value =
                cliente.telefono || '';

            $('email').value =
                cliente.email || '';

            $('direccion').value =
                cliente.direccion || '';

            $('dpi').value =
                cliente.dpi || '';

            $('nit').value =
                cliente.nit || '';

            $('descuento').value =
                cliente.descuento ?? 0;

            $('limiteCredito').value =
                cliente.limiteCredito ?? 0;

            if (cliente.tipo === 'mayorista') {
                $('tipoMayorista').checked = true;
            } else {
                $('tipoMinorista').checked = true;
            }
        }

        actualizarCamposTipo();

        setTimeout(() => {
            $('nombre')?.focus();
        }, 100);
    }

    function cerrarPanelCliente() {
        if (!panel) return;

        panel.classList.remove('is-open');

        panel.setAttribute(
            'aria-hidden',
            'true'
        );

        if (overlay) {
            overlay.hidden = true;
        }
    }

    // ============================================================
    // GUARDAR CLIENTE
    // ============================================================

    function guardarCliente(event) {
        event.preventDefault();

        if (!validarCliente()) {
            return;
        }

        const id =
            $('clienteId').value ||
            generarId('CLI-');

        const tipo =
            obtenerTipoCliente();

        const cliente = {
            id: id,
            nombre: $('nombre').value.trim(),
            telefono: $('telefono').value.trim(),
            email: $('email').value.trim(),
            dpi: $('dpi').value.trim(),
            nit: $('nit').value.trim(),
            direccion: $('direccion').value.trim(),
            tipo: tipo,
            descuento: Number($('descuento').value || 0),
            limiteCredito: Number($('limiteCredito').value || 0),
            fechaRegistro: new Date().toISOString()
        };

        const indice =
            clientes.findIndex(
                c => String(c.id) === String(id)
            );

        if (indice >= 0) {
            cliente.fechaRegistro =
                clientes[indice].fechaRegistro ||
                cliente.fechaRegistro;

            clientes[indice] = {
                ...clientes[indice],
                ...cliente
            };

            toast('Cliente actualizado correctamente.');

        } else {
            clientes.push(cliente);

            toast('Cliente registrado correctamente.');
        }

        if (guardarClientes()) {
            cerrarPanelCliente();
            mostrarClientes();
            actualizarEstadisticas();
        }
    }

    // ============================================================
    // MOSTRAR CLIENTES
    // ============================================================

    function obtenerClientesFiltrados() {
        const busqueda =
            ($('searchInput')?.value || '')
                .trim()
                .toLowerCase();

        const filtro =
            document.querySelector(
                '.filter-button.active'
            )?.dataset.filter || 'todos';

        return clientes.filter(cliente => {

            const coincideBusqueda =
                !busqueda ||
                [
                    cliente.nombre,
                    cliente.telefono,
                    cliente.email,
                    cliente.nit,
                    cliente.dpi
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(busqueda);

            const coincideFiltro =
                filtro === 'todos' ||
                cliente.tipo === filtro;

            return coincideBusqueda &&
                coincideFiltro;
        });
    }

    function mostrarClientes() {
        const tbody = $('tablaBody');
        const empty = $('emptyState');

        if (!tbody) return;

        const lista =
            obtenerClientesFiltrados();

        tbody.innerHTML = '';

        lista.forEach(cliente => {

            const tr =
                document.createElement('tr');

            const inicial =
                (cliente.nombre || '?')
                    .charAt(0)
                    .toUpperCase();

            const tipoTexto =
                cliente.tipo === 'mayorista'
                    ? 'Mayorista'
                    : 'Minorista';

            tr.innerHTML = `
                <td>
                    <div class="client-cell">
                        <div class="client-avatar">
                            ${escaparHTML(inicial)}
                        </div>

                        <div>
                            <strong>
                                ${escaparHTML(cliente.nombre)}
                            </strong>

                            <small>
                                ${escaparHTML(cliente.email || 'Sin correo')}
                            </small>
                        </div>
                    </div>
                </td>

                <td>
                    <span class="type-badge ${cliente.tipo}">
                        ${tipoTexto}
                    </span>
                </td>

                <td>
                    <div class="contact-cell">
                        <strong>
                            ${escaparHTML(cliente.telefono || '-')}
                        </strong>

                        <small>
                            ${escaparHTML(cliente.email || 'Sin correo')}
                        </small>
                    </div>
                </td>

                <td>
                    <div class="info-cell">
                        <span>
                            ${escaparHTML(cliente.nit || 'Sin NIT')}
                        </span>

                        <small>
                            ${escaparHTML(cliente.direccion || 'Sin dirección')}
                        </small>
                    </div>
                </td>

                <td>
                    ${formatearFecha(cliente.fechaRegistro)}
                </td>

                <td>
                    <div class="row-actions">
                        <button
                            class="table-action"
                            data-action="ver"
                            data-id="${escaparHTML(cliente.id)}"
                            title="Ver cliente">
                            👁
                        </button>

                        <button
                            class="table-action"
                            data-action="editar"
                            data-id="${escaparHTML(cliente.id)}"
                            title="Editar">
                            ✎
                        </button>

                        <button
                            class="table-action danger"
                            data-action="eliminar"
                            data-id="${escaparHTML(cliente.id)}"
                            title="Eliminar">
                            🗑
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        if (empty) {
            empty.hidden = lista.length > 0;
        }

        const resultado =
            $('resultadoTexto');

        if (resultado) {
            resultado.textContent =
                `Mostrando ${lista.length} de ${clientes.length} clientes`;
        }

        const footer =
            $('tableFooterText');

        if (footer) {
            footer.textContent =
                `${lista.length} cliente${lista.length === 1 ? '' : 's'}`;
        }

        if ($('statVisibles')) {
            $('statVisibles').textContent =
                lista.length;
        }

        actualizarContadores();
    }

    // ============================================================
    // CONTADORES
    // ============================================================

    function actualizarContadores() {
        const minoristas =
            clientes.filter(
                c => c.tipo === 'minorista'
            ).length;

        const mayoristas =
            clientes.filter(
                c => c.tipo === 'mayorista'
            ).length;

        if ($('countTodos')) {
            $('countTodos').textContent =
                clientes.length;
        }

        if ($('countMinoristas')) {
            $('countMinoristas').textContent =
                minoristas;
        }

        if ($('countMayoristas')) {
            $('countMayoristas').textContent =
                mayoristas;
        }
    }

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================

    function actualizarEstadisticas() {
        const total = clientes.length;

        const minoristas =
            clientes.filter(
                c => c.tipo === 'minorista'
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

        if ($('porcentajeMinorista')) {
            $('porcentajeMinorista').textContent =
                total
                    ? `${Math.round((minoristas / total) * 100)}% del total`
                    : '0% del total';
        }

        if ($('porcentajeMayorista')) {
            $('porcentajeMayorista').textContent =
                total
                    ? `${Math.round((mayoristas / total) * 100)}% del total`
                    : '0% del total';
        }

        actualizarContadores();
    }

    // ============================================================
    // DETALLE CLIENTE
    // ============================================================

    function mostrarDetalleCliente(cliente) {
        clienteDetalle = cliente;

        const dialog =
            $('dialogDetalle');

        if (!dialog) return;

        if ($('detalleNombre')) {
            $('detalleNombre').textContent =
                cliente.nombre || '-';
        }

        if ($('detalleTelefono')) {
            $('detalleTelefono').textContent =
                cliente.telefono || '-';
        }

        if ($('detalleEmail')) {
            $('detalleEmail').textContent =
                cliente.email || '-';
        }

        if ($('detalleDpi')) {
            $('detalleDpi').textContent =
                cliente.dpi || '-';
        }

        if ($('detalleNit')) {
            $('detalleNit').textContent =
                cliente.nit || '-';
        }

        if ($('detalleDireccion')) {
            $('detalleDireccion').textContent =
                cliente.direccion || '-';
        }

        if ($('detalleTipo')) {
            $('detalleTipo').textContent =
                cliente.tipo === 'mayorista'
                    ? 'Mayorista'
                    : 'Minorista';
        }

        if ($('detalleDescuento')) {
            $('detalleDescuento').textContent =
                `${Number(cliente.descuento || 0)}%`;
        }

        if ($('detalleLimiteCredito')) {
            $('detalleLimiteCredito').textContent =
                dinero(cliente.limiteCredito);
        }

        if ($('detalleRegistro')) {
            $('detalleRegistro').textContent =
                formatearFecha(cliente.fechaRegistro);
        }

        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }
    }

    // ============================================================
    // ELIMINAR CLIENTE
    // ============================================================

    function eliminarCliente(cliente) {
        clienteAEliminar = cliente;

        const dialog =
            $('dialogEliminar');

        if (!dialog) {
            if (
                confirm(
                    `¿Deseas eliminar al cliente "${cliente.nombre}"?`
                )
            ) {
                confirmarEliminarCliente();
            }

            return;
        }

        if ($('nombreEliminar')) {
            $('nombreEliminar').textContent =
                cliente.nombre;
        }

        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }
    }

    function confirmarEliminarCliente() {
        if (!clienteAEliminar) return;

        clientes =
            clientes.filter(
                c =>
                    String(c.id) !==
                    String(clienteAEliminar.id)
            );

        guardarClientes();

        clienteAEliminar = null;

        $('dialogEliminar')?.close();

        mostrarClientes();
        actualizarEstadisticas();

        toast(
            'Cliente eliminado correctamente.'
        );
    }

    // ============================================================
    // TABLA
    // ============================================================

    on(
        'tablaBody',
        'click',
        event => {

            const button =
                event.target.closest(
                    'button[data-id]'
                );

            if (!button) return;

            const cliente =
                clientes.find(
                    c =>
                        String(c.id) ===
                        String(button.dataset.id)
                );

            if (!cliente) return;

            const accion =
                button.dataset.action;

            if (accion === 'ver') {
                mostrarDetalleCliente(cliente);
            }

            if (accion === 'editar') {
                abrirPanelCliente(cliente);
            }

            if (accion === 'eliminar') {
                eliminarCliente(cliente);
            }
        }
    );

    // ============================================================
    // BOTONES
    // ============================================================

    on(
        'btnNuevo',
        'click',
        () => abrirPanelCliente()
    );

    on(
        'btnNuevoVacio',
        'click',
        () => abrirPanelCliente()
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

    on(
        'overlay',
        'click',
        cerrarPanelCliente
    );

    on(
        'clienteForm',
        'submit',
        guardarCliente
    );

    // ============================================================
    // TIPO
    // ============================================================

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

    // ============================================================
    // BUSCADOR
    // ============================================================

    on(
        'searchInput',
        'input',
        mostrarClientes
    );

    on(
        'btnLimpiarBusqueda',
        'click',
        () => {

            if ($('searchInput')) {
                $('searchInput').value = '';
            }

            mostrarClientes();

            $('searchInput')?.focus();
        }
    );

    // ============================================================
    // FILTROS
    // ============================================================

    document
        .querySelectorAll(
            '.filter-button[data-filter]'
        )
        .forEach(button => {

            button.addEventListener(
                'click',
                () => {

                    document
                        .querySelectorAll(
                            '.filter-button[data-filter]'
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    'active'
                                )
                        );

                    button.classList.add(
                        'active'
                    );

                    mostrarClientes();
                }
            );
        });

    // ============================================================
    // DETALLE
    // ============================================================

    on(
        'btnCerrarDetalle',
        'click',
        () =>
            $('dialogDetalle')?.close()
    );

    on(
        'btnEditarDetalle',
        'click',
        () => {

            if (!clienteDetalle) return;

            $('dialogDetalle')?.close();

            abrirPanelCliente(
                clienteDetalle
            );
        }
    );

    on(
        'btnEliminarDetalle',
        'click',
        () => {

            if (!clienteDetalle) return;

            $('dialogDetalle')?.close();

            eliminarCliente(
                clienteDetalle
            );
        }
    );

    // ============================================================
    // ELIMINAR
    // ============================================================

    on(
        'btnCerrarEliminar',
        'click',
        () =>
            $('dialogEliminar')?.close()
    );

    on(
        'btnCancelarEliminar',
        'click',
        () =>
            $('dialogEliminar')?.close()
    );

    on(
        'btnConfirmarEliminar',
        'click',
        confirmarEliminarCliente
    );

    // ============================================================
    // WHATSAPP
    // ============================================================

    on(
        'btnWhatsApp',
        'click',
        () => {

            if (
                !clienteDetalle ||
                !clienteDetalle.telefono
            ) {
                toast(
                    'El cliente no tiene teléfono registrado.',
                    'error'
                );

                return;
            }

            const telefono =
                clienteDetalle.telefono
                    .replace(/\D/g, '');

            const mensaje =
                `Hola ${clienteDetalle.nombre}, le contactamos de Variedades Chiquis.`;

            window.open(
                `https://wa.me/502${telefono}?text=${encodeURIComponent(mensaje)}`,
                '_blank'
            );
        }
    );

    // ============================================================
    // TEMA
    // ============================================================

    function actualizarTema() {
        const oscuro =
            document.body.classList.contains('dark');

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
        document.body.classList.toggle('dark');

        localStorage.setItem(
            'temaChiquis',
            document.body.classList.contains('dark')
                ? 'dark'
                : 'light'
        );

        actualizarTema();
    }

    if (
        localStorage.getItem('temaChiquis') ===
        'dark'
    ) {
        document.body.classList.add('dark');
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

    // ============================================================
    // MENÚ MÓVIL
    // ============================================================

    on(
        'btnMenu',
        'click',
        () =>
            $('sidebar')?.classList.toggle('open')
    );

    // ============================================================
    // NAVEGACIÓN
    // ============================================================

    on(
        'btnNavPedidos',
        'click',
        () => {
            window.location.href =
                'pedidos.html';
        }
    );

    on(
        'btnNavEstadisticas',
        'click',
        () => {

            document
                .querySelector('.stats-grid')
                ?.scrollIntoView({
                    behavior: 'smooth'
                });
        }
    );

    // ============================================================
    // EXPORTAR
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
            URL.createObjectURL(blob);

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

    function exportarClientes() {

        if (!clientes.length) {
            toast(
                'No hay clientes para exportar.',
                'error'
            );

            return;
        }

        descargar(
            'clientes-variedades-chiquis.json',
            JSON.stringify(
                clientes,
                null,
                2
            ),
            'application/json'
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

    // ============================================================
    // IMPORTAR
    // ============================================================

    on(
        'btnImportar',
        'click',
        () =>
            $('inputImportar')?.click()
    );

    on(
        'btnImportarNav',
        'click',
        () =>
            $('inputImportar')?.click()
    );

    on(
        'inputImportar',
        'change',
        event => {

            const archivo =
                event.target.files?.[0];

            if (!archivo) return;

            const lector =
                new FileReader();

            lector.onload = () => {

                try {

                    const datos =
                        JSON.parse(
                            lector.result
                        );

                    if (
                        !Array.isArray(datos)
                    ) {
                        throw new Error(
                            'Formato inválido'
                        );
                    }

                    clientes = datos;

                    guardarClientes();

                    mostrarClientes();
                    actualizarEstadisticas();

                    toast(
                        'Clientes importados correctamente.'
                    );

                } catch (error) {

                    console.error(error);

                    toast(
                        'El archivo no tiene un formato válido.',
                        'error'
                    );
                }

                event.target.value = '';
            };

            lector.readAsText(
                archivo,
                'UTF-8'
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
                panel?.classList.contains(
                    'is-open'
                )
            ) {
                cerrarPanelCliente();
            }

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === 'n'
            ) {

                event.preventDefault();

                abrirPanelCliente();
            }

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === 'k'
            ) {

                event.preventDefault();

                $('searchInput')?.focus();
            }
        }
    );

    // ============================================================
    // INICIO
    // ============================================================

    actualizarCamposTipo();
    mostrarClientes();
    actualizarEstadisticas();
});