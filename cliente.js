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
            $('clienteId')?.value || '';

        const tipo =
            obtenerTipoCliente();

        const cliente = {
            id: id || generarId('cli_'),
            nombre: $('nombre')?.value.trim() || '',
            telefono: $('telefono')?.value.trim() || '',
            email: $('email')?.value.trim() || '',
            direccion: $('direccion')?.value.trim() || '',
            dpi: $('dpi')?.value.trim() || '',
            nit: $('nit')?.value.trim() || '',
            tipo: tipo,
            descuento: tipo === 'mayorista'
                ? Number($('descuento')?.value || 0)
                : 0,
            limiteCredito: tipo === 'mayorista'
                ? Number($('limiteCredito')?.value || 0)
                : 0,
            actualizado: new Date().toISOString()
        };

        const indice =
            clientes.findIndex(
                c => c.id === cliente.id
            );

        if (indice >= 0) {
            cliente.creado =
                clientes[indice].creado ||
                new Date().toISOString();

            clientes[indice] = {
                ...clientes[indice],
                ...cliente
            };

            toast(
                'Cliente actualizado correctamente.'
            );

        } else {
            cliente.creado =
                new Date().toISOString();

            clientes.unshift(cliente);

            toast(
                'Cliente registrado correctamente.'
            );
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

    function obtenerFiltroActivo() {
        return document
            .querySelector(
                '.filter-button[data-filter].active'
            )?.dataset.filter || 'todos';
    }

    function mostrarClientes() {
        const tbody = $('clientesBody');

        if (!tbody) {
            return;
        }

        const busqueda =
            ($('searchInput')?.value || '')
                .trim()
                .toLowerCase();

        const filtro =
            obtenerFiltroActivo();

        let lista =
            clientes.filter(cliente => {

                const texto = [
                    cliente.nombre,
                    cliente.telefono,
                    cliente.email,
                    cliente.dpi,
                    cliente.nit,
                    cliente.direccion
                ]
                    .join(' ')
                    .toLowerCase();

                const coincideBusqueda =
                    !busqueda ||
                    texto.includes(busqueda);

                let coincideFiltro = true;

                if (filtro === 'mayorista') {
                    coincideFiltro =
                        cliente.tipo === 'mayorista';
                }

                if (filtro === 'minorista') {
                    coincideFiltro =
                        cliente.tipo !== 'mayorista';
                }

                return coincideBusqueda &&
                    coincideFiltro;
            });

        tbody.innerHTML = '';

        if (!lista.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-icon">👥</div>
                        <strong>No se encontraron clientes</strong>
                        <span>Agrega un cliente o cambia los filtros.</span>
                    </td>
                </tr>
            `;

            actualizarContador(0);
            return;
        }

        lista.forEach(cliente => {
            const tr =
                document.createElement('tr');

            const inicial =
                (cliente.nombre || '?')
                    .trim()
                    .charAt(0)
                    .toUpperCase();

            const tipoTexto =
                cliente.tipo === 'mayorista'
                    ? 'Mayorista'
                    : 'Minorista';

            const tipoClase =
                cliente.tipo === 'mayorista'
                    ? 'mayorista'
                    : 'minorista';

            tr.innerHTML = `
                <td>
                    <div class="client-cell">
                        <div class="avatar">
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
                    ${escaparHTML(cliente.telefono || 'Sin teléfono')}
                </td>

                <td>
                    ${escaparHTML(cliente.nit || '—')}
                </td>

                <td>
                    <span class="type-badge ${tipoClase}">
                        ${tipoTexto}
                    </span>
                </td>

                <td>
                    ${cliente.tipo === 'mayorista'
                        ? dinero(cliente.limiteCredito)
                        : '—'}
                </td>

                <td>
                    ${formatearFecha(
                        cliente.actualizado ||
                        cliente.creado
                    )}
                </td>

                <td>
                    <div class="actions">
                        <button
                            class="action-btn"
                            type="button"
                            data-action="view"
                            data-id="${escaparHTML(cliente.id)}"
                            title="Ver cliente">
                            👁
                        </button>

                        <button
                            class="action-btn"
                            type="button"
                            data-action="edit"
                            data-id="${escaparHTML(cliente.id)}"
                            title="Editar cliente">
                            ✏
                        </button>

                        <button
                            class="action-btn danger"
                            type="button"
                            data-action="delete"
                            data-id="${escaparHTML(cliente.id)}"
                            title="Eliminar cliente">
                            🗑
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        actualizarContador(lista.length);
    }

    function actualizarContador(cantidad) {
        const contador = $('clientesCount');

        if (contador) {
            contador.textContent =
                `${cantidad} cliente${cantidad === 1 ? '' : 's'}`;
        }
    }

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================

    function actualizarEstadisticas() {
        const total = clientes.length;

        const mayoristas =
            clientes.filter(
                c => c.tipo === 'mayorista'
            ).length;

        const minoristas =
            clientes.filter(
                c => c.tipo !== 'mayorista'
            ).length;

        const limite =
            clientes.reduce(
                (total, cliente) =>
                    total +
                    Number(cliente.limiteCredito || 0),
                0
            );

        if ($('statTotal')) {
            $('statTotal').textContent =
                total;
        }

        if ($('statMayoristas')) {
            $('statMayoristas').textContent =
                mayoristas;
        }

        if ($('statMinoristas')) {
            $('statMinoristas').textContent =
                minoristas;
        }

        if ($('statCredito')) {
            $('statCredito').textContent =
                dinero(limite);
        }
    }

    // ============================================================
    // BUSCAR CLIENTE POR ID
    // ============================================================

    function buscarCliente(id) {
        return clientes.find(
            cliente => cliente.id === id
        );
    }

    // ============================================================
    // DETALLE
    // ============================================================

    function mostrarDetalle(cliente) {
        if (!cliente) return;

        clienteDetalle = cliente;

        const dialog =
            $('dialogDetalle');

        if (!dialog) return;

        const inicial =
            (cliente.nombre || '?')
                .trim()
                .charAt(0)
                .toUpperCase();

        if ($('detalleAvatar')) {
            $('detalleAvatar').textContent =
                inicial;
        }

        if ($('detalleNombre')) {
            $('detalleNombre').textContent =
                cliente.nombre || 'Sin nombre';
        }

        if ($('detalleTipo')) {
            $('detalleTipo').textContent =
                cliente.tipo === 'mayorista'
                    ? 'Mayorista'
                    : 'Minorista';
        }

        if ($('detalleTelefono')) {
            $('detalleTelefono').textContent =
                cliente.telefono || 'No registrado';
        }

        if ($('detalleEmail')) {
            $('detalleEmail').textContent =
                cliente.email || 'No registrado';
        }

        if ($('detalleDireccion')) {
            $('detalleDireccion').textContent =
                cliente.direccion || 'No registrada';
        }

        if ($('detalleDpi')) {
            $('detalleDpi').textContent =
                cliente.dpi || 'No registrado';
        }

        if ($('detalleNit')) {
            $('detalleNit').textContent =
                cliente.nit || 'No registrado';
        }

        if ($('detalleDescuento')) {
            $('detalleDescuento').textContent =
                cliente.tipo === 'mayorista'
                    ? `${Number(cliente.descuento || 0)}%`
                    : '0%';
        }

        if ($('detalleCredito')) {
            $('detalleCredito').textContent =
                cliente.tipo === 'mayorista'
                    ? dinero(cliente.limiteCredito)
                    : 'Q0.00';
        }

        if ($('detalleFecha')) {
            $('detalleFecha').textContent =
                formatearFecha(
                    cliente.actualizado ||
                    cliente.creado
                );
        }

        dialog.showModal();
    }

    // ============================================================
    // ELIMINAR
    // ============================================================

    function eliminarCliente(cliente) {
        if (!cliente) return;

        clienteAEliminar = cliente;

        const dialog =
            $('dialogEliminar');

        if (!dialog) return;

        if ($('nombreEliminar')) {
            $('nombreEliminar').textContent =
                cliente.nombre;
        }

        dialog.showModal();
    }

    function confirmarEliminarCliente() {
        if (!clienteAEliminar) {
            return;
        }

        const id =
            clienteAEliminar.id;

        clientes =
            clientes.filter(
                cliente =>
                    cliente.id !== id
            );

        if (guardarClientes()) {
            toast(
                'Cliente eliminado correctamente.'
            );

            $('dialogEliminar')?.close();

            clienteAEliminar = null;

            mostrarClientes();
            actualizarEstadisticas();
        }
    }

    // ============================================================
    // EVENTOS DEL FORMULARIO
    // ============================================================

    on(
        'clienteForm',
        'submit',
        guardarCliente
    );

    on(
        'btnNuevoCliente',
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

    if (overlay) {
        overlay.addEventListener(
            'click',
            cerrarPanelCliente
        );
    }

    on(
        'tipoMayorista',
        'change',
        actualizarCamposTipo
    );

    on(
        'tipoMinorista',
        'change',
        actualizarCamposTipo
    );

    // ============================================================
    // ACCIONES DE LA TABLA
    // ============================================================

    on(
        'clientesBody',
        'click',
        event => {

            const boton =
                event.target.closest(
                    '[data-action]'
                );

            if (!boton) return;

            const id =
                boton.dataset.id;

            const accion =
                boton.dataset.action;

            const cliente =
                buscarCliente(id);

            if (!cliente) return;

            if (accion === 'view') {
                mostrarDetalle(cliente);
            }

            if (accion === 'edit') {
                abrirPanelCliente(cliente);
            }

            if (accion === 'delete') {
                eliminarCliente(cliente);
            }
        }
    );

    // ============================================================
    // BÚSQUEDA
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