document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       ELEMENTOS
    ========================================================= */

    const tablaBody =
        document.getElementById("tablaBody");

    const emptyState =
        document.getElementById("emptyState");

    const emptyTitle =
        document.getElementById("emptyTitle");

    const emptyDescription =
        document.getElementById("emptyDescription");

    const searchInput =
        document.getElementById("searchInput");

    const btnLimpiarBusqueda =
        document.getElementById("btnLimpiarBusqueda");

    const btnNuevo =
        document.getElementById("btnNuevo");

    const btnNuevoVacio =
        document.getElementById("btnNuevoVacio");

    const btnFloating =
        document.getElementById("btnFloating");

    const panel =
        document.getElementById("panel");

    const overlay =
        document.getElementById("overlay");

    const clienteForm =
        document.getElementById("clienteForm");

    const btnCerrarPanel =
        document.getElementById("btnCerrarPanel");

    const btnCancelar =
        document.getElementById("btnCancelar");

    const panelTitulo =
        document.getElementById("panelTitulo");

    const clienteId =
        document.getElementById("clienteId");

    const tipoMinorista =
        document.getElementById("tipoMinorista");

    const tipoMayorista =
        document.getElementById("tipoMayorista");

    const tipoHint =
        document.getElementById("tipoHint");

    const camposMayorista =
        document.getElementById("camposMayorista");

    const campoDpi =
        document.getElementById("campoDpi");

    const nombre =
        document.getElementById("nombre");

    const telefono =
        document.getElementById("telefono");

    const email =
        document.getElementById("email");

    const direccion =
        document.getElementById("direccion");

    const dpi =
        document.getElementById("dpi");

    const nit =
        document.getElementById("nit");

    const descuento =
        document.getElementById("descuento");

    const limiteCredito =
        document.getElementById("limiteCredito");

    const notas =
        document.getElementById("notas");

    const notasCounter =
        document.getElementById("notasCounter");


    /* ESTADÍSTICAS */

    const statTotal =
        document.getElementById("statTotal");

    const statMinorista =
        document.getElementById("statMinorista");

    const statMayorista =
        document.getElementById("statMayorista");

    const statVisibles =
        document.getElementById("statVisibles");

    const porcentajeMinorista =
        document.getElementById("porcentajeMinorista");

    const porcentajeMayorista =
        document.getElementById("porcentajeMayorista");


    /* CONTADORES */

    const countTodos =
        document.getElementById("countTodos");

    const countMinoristas =
        document.getElementById("countMinoristas");

    const countMayoristas =
        document.getElementById("countMayoristas");


    const resultadoTexto =
        document.getElementById("resultadoTexto");

    const tableFooterText =
        document.getElementById("tableFooterText");


    /* DELETE */

    const dialogEliminar =
        document.getElementById("dialogEliminar");

    const dialogNombreCliente =
        document.getElementById("dialogNombreCliente");

    const btnCancelarEliminar =
        document.getElementById("btnCancelarEliminar");

    const btnConfirmarEliminar =
        document.getElementById("btnConfirmarEliminar");


    /* DETAIL */

    const dialogDetalle =
        document.getElementById("dialogDetalle");

    const btnCerrarDetalle =
        document.getElementById("btnCerrarDetalle");

    const detalleAvatar =
        document.getElementById("detalleAvatar");

    const detalleNombre =
        document.getElementById("detalleNombre");

    const detalleTipo =
        document.getElementById("detalleTipo");

    const detalleTelefono =
        document.getElementById("detalleTelefono");

    const detalleEmail =
        document.getElementById("detalleEmail");

    const detalleDireccion =
        document.getElementById("detalleDireccion");

    const detalleFecha =
        document.getElementById("detalleFecha");

    const detalleIdentificacion =
        document.getElementById("detalleIdentificacion");

    const detalleComercial =
        document.getElementById("detalleComercial");

    const detalleNotas =
        document.getElementById("detalleNotas");

    const detalleNotasContainer =
        document.getElementById("detalleNotasContainer");

    const btnEditarDetalle =
        document.getElementById("btnEditarDetalle");

    const btnLlamar =
        document.getElementById("btnLlamar");

    const btnWhatsApp =
        document.getElementById("btnWhatsApp");


    /* TOAST */

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    const toastIcon =
        document.getElementById("toastIcon");


    /* THEME */

    const btnTema =
        document.getElementById("btnTema");

    const btnTemaDesktop =
        document.getElementById("btnTemaDesktop");

    const themeIcon =
        document.getElementById("themeIcon");


    /* SIDEBAR */

    const sidebar =
        document.getElementById("sidebar");

    const btnMenu =
        document.getElementById("btnMenu");


    /* IMPORT / EXPORT */

    const btnExportar =
        document.getElementById("btnExportar");

    const btnImportar =
        document.getElementById("btnImportar");

    const btnExportarNav =
        document.getElementById("btnExportarNav");

    const btnImportarNav =
        document.getElementById("btnImportarNav");

    const inputImportar =
        document.getElementById("inputImportar");


    /* =========================================================
       VARIABLES
    ========================================================= */

    let clientes =
        cargarClientes();

    let filtroActual =
        "todos";

    let clienteAEliminar =
        null;

    let clienteDetalle =
        null;

    let toastTimeout =
        null;


    /* =========================================================
       LOCAL STORAGE
    ========================================================= */

    function cargarClientes() {

        try {

            const datos =
                localStorage.getItem("clientesChiquis");

            if (!datos) {
                return [];
            }

            const clientesGuardados =
                JSON.parse(datos);

            return Array.isArray(clientesGuardados)
                ? clientesGuardados
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
            JSON.stringify(clientes)
        );

    }


    /* =========================================================
       ID
    ========================================================= */

    function generarId() {

        return (
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );

    }


    /* =========================================================
       TIPO
    ========================================================= */

    function obtenerTipo() {

        return tipoMayorista.checked
            ? "mayorista"
            : "minorista";

    }


    /* =========================================================
       FECHA
    ========================================================= */

    function formatearFecha(fecha) {

        if (!fecha) {
            return "Sin fecha";
        }

        const fechaObjeto =
            new Date(fecha);

        if (isNaN(fechaObjeto.getTime())) {
            return "Sin fecha";
        }

        return fechaObjeto.toLocaleDateString(
            "es-GT",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =========================================================
       INICIALES
    ========================================================= */

    function obtenerIniciales(nombreCliente) {

        if (!nombreCliente) {
            return "??";
        }

        const palabras =
            nombreCliente
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (palabras.length === 1) {

            return palabras[0]
                .substring(0, 2)
                .toUpperCase();

        }

        return (
            palabras[0].charAt(0) +
            palabras[1].charAt(0)
        ).toUpperCase();

    }


    /* =========================================================
       ESCAPAR HTML
    ========================================================= */

    function escaparHTML(texto) {

        if (
            texto === null ||
            texto === undefined
        ) {
            return "";
        }

        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================================================
       MOSTRAR CLIENTES
    ========================================================= */

    function mostrarClientes() {

        tablaBody.innerHTML = "";

        const textoBusqueda =
            searchInput.value
                .toLowerCase()
                .trim();


        const clientesFiltrados =
            clientes.filter(function (cliente) {

                const coincideTipo =
                    filtroActual === "todos" ||
                    cliente.tipo === filtroActual;


                const textoCliente = [

                    cliente.nombre,
                    cliente.telefono,
                    cliente.email,
                    cliente.nit,
                    cliente.dpi,
                    cliente.direccion

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const coincideBusqueda =
                    textoCliente.includes(
                        textoBusqueda
                    );


                return (
                    coincideTipo &&
                    coincideBusqueda
                );

            });


        /* EMPTY */

        if (clientesFiltrados.length === 0) {

            emptyState.hidden = false;

            if (
                clientes.length === 0
            ) {

                emptyTitle.textContent =
                    "No hay clientes registrados";

                emptyDescription.textContent =
                    "Comienza agregando tu primer cliente al sistema.";

            } else {

                emptyTitle.textContent =
                    "No encontramos clientes";

                emptyDescription.textContent =
                    "Prueba cambiando la búsqueda o seleccionando otro filtro.";

            }

        } else {

            emptyState.hidden = true;

        }


        /* FILAS */

        clientesFiltrados.forEach(
            function (cliente, index) {

                const fila =
                    document.createElement("tr");

                fila.style.animationDelay =
                    `${index * 0.03}s`;


                const esMayorista =
                    cliente.tipo === "mayorista";


                const tipoTexto =
                    esMayorista
                        ? "Mayorista"
                        : "Minorista";


                const claseTipo =
                    esMayorista
                        ? "tipo-badge--mayorista"
                        : "tipo-badge--minorista";


                const iconoTipo =
                    esMayorista
                        ? "📦"
                        : "🛍️";


                const identificacion =
                    esMayorista
                        ? (
                            cliente.nit
                                ? `NIT: ${escaparHTML(cliente.nit)}`
                                : "Sin NIT"
                        )
                        : (
                            cliente.dpi
                                ? `DPI: ${escaparHTML(cliente.dpi)}`
                                : "Sin DPI"
                        );


                const comercial =
                    esMayorista
                        ? (
                            `Descuento: ${Number(cliente.descuento || 0)}%`
                        )
                        : "Cliente personal";


                fila.innerHTML = `

                    <td>

                        <div class="cliente-info">

                            <div class="cliente-avatar">

                                ${escaparHTML(
                                    obtenerIniciales(
                                        cliente.nombre
                                    )
                                )}

                            </div>

                            <div>

                                <div class="cliente-nombre">

                                    ${escaparHTML(
                                        cliente.nombre
                                    )}

                                </div>

                                <div class="cliente-subtitle">

                                    ${escaparHTML(
                                        identificacion
                                    )}

                                </div>

                            </div>

                        </div>

                    </td>


                    <td>

                        <span
                            class="tipo-badge ${claseTipo}">

                            ${iconoTipo}

                            ${tipoTexto}

                        </span>

                    </td>


                    <td>

                        <div class="contacto">

                            <span class="contacto-phone">

                                ${escaparHTML(
                                    cliente.telefono
                                )}

                            </span>

                            <span class="contacto-email">

                                ${
                                    cliente.email
                                        ? escaparHTML(
                                            cliente.email
                                        )
                                        : "Sin correo"
                                }

                            </span>

                        </div>

                    </td>


                    <td>

                        <div class="info-item">

                            <span>💼</span>

                            ${escaparHTML(
                                comercial
                            )}

                        </div>

                        <div class="info-item">

                            <span>📍</span>

                            ${
                                cliente.direccion
                                    ? "Dirección registrada"
                                    : "Sin dirección"
                            }

                        </div>

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
                                class="btn-accion"
                                data-accion="ver"
                                data-id="${cliente.id}"
                                title="Ver cliente">

                                👁

                            </button>


                            <button
                                type="button"
                                class="btn-accion"
                                data-accion="editar"
                                data-id="${cliente.id}"
                                title="Editar cliente">

                                ✎

                            </button>


                            <button
                                type="button"
                                class="btn-accion eliminar"
                                data-accion="eliminar"
                                data-id="${cliente.id}"
                                title="Eliminar cliente">

                                ×

                            </button>

                        </div>

                    </td>

                `;


                tablaBody.appendChild(fila);

            }
        );


        actualizarEstadisticas(
            clientesFiltrados.length
        );

        actualizarResultado(
            clientesFiltrados.length
        );

    }


    /* =========================================================
       ESTADÍSTICAS
    ========================================================= */

    function actualizarEstadisticas(visibles) {

        const total =
            clientes.length;


        const minoristas =
            clientes.filter(
                cliente =>
                    cliente.tipo === "minorista"
            ).length;


        const mayoristas =
            clientes.filter(
                cliente =>
                    cliente.tipo === "mayorista"
            ).length;


        statTotal.textContent =
            total;

        statMinorista.textContent =
            minoristas;

        statMayorista.textContent =
            mayoristas;

        statVisibles.textContent =
            visibles;


        const porcentajeMinor =
            total
                ? Math.round(
                    (minoristas / total) * 100
                )
                : 0;


        const porcentajeMayor =
            total
                ? Math.round(
                    (mayoristas / total) * 100
                )
                : 0;


        porcentajeMinorista.textContent =
            `${porcentajeMinor}% del total`;

        porcentajeMayorista.textContent =
            `${porcentajeMayor}% del total`;


        countTodos.textContent =
            total;

        countMinoristas.textContent =
            minoristas;

        countMayoristas.textContent =
            mayoristas;


        tableFooterText.textContent =
            visibles === 1
                ? "1 cliente visible"
                : `${visibles} clientes visibles`;

    }


    /* =========================================================
       RESULTADO
    ========================================================= */

    function actualizarResultado(cantidad) {

        const busqueda =
            searchInput.value.trim();


        if (busqueda) {

            resultadoTexto.textContent =
                cantidad === 1
                    ? `1 resultado para "${busqueda}"`
                    : `${cantidad} resultados para "${busqueda}"`;

        } else if (
            filtroActual !== "todos"
        ) {

            resultadoTexto.textContent =
                cantidad === 1
                    ? "1 cliente encontrado"
                    : `${cantidad} clientes encontrados`;

        } else {

            resultadoTexto.textContent =
                cantidad === 1
                    ? "Mostrando 1 cliente"
                    : `Mostrando ${cantidad} clientes`;

        }


        if (searchInput.value.trim()) {

            btnLimpiarBusqueda.classList.add(
                "visible"
            );

        } else {

            btnLimpiarBusqueda.classList.remove(
                "visible"
            );

        }

    }


    /* =========================================================
       ABRIR PANEL
    ========================================================= */

    function abrirPanel(
        modo,
        cliente = null
    ) {

        overlay.hidden = false;

        panel.setAttribute(
            "aria-hidden",
            "false"
        );

        panel.classList.add(
            "is-open"
        );


        if (modo === "nuevo") {

            panelTitulo.textContent =
                "Nuevo cliente";

            clienteId.value = "";

            clienteForm.reset();

            tipoMinorista.checked =
                true;

            descuento.value = 0;

            limiteCredito.value = 0;

            actualizarCamposTipo();

            actualizarContadorNotas();

        }


        if (
            modo === "editar" &&
            cliente
        ) {

            panelTitulo.textContent =
                "Editar cliente";

            clienteId.value =
                cliente.id;


            nombre.value =
                cliente.nombre || "";

            telefono.value =
                cliente.telefono || "";

            email.value =
                cliente.email || "";

            direccion.value =
                cliente.direccion || "";

            dpi.value =
                cliente.dpi || "";

            nit.value =
                cliente.nit || "";

            descuento.value =
                cliente.descuento || 0;

            limiteCredito.value =
                cliente.limiteCredito || 0;

            notas.value =
                cliente.notas || "";


            if (
                cliente.tipo ===
                "mayorista"
            ) {

                tipoMayorista.checked =
                    true;

            } else {

                tipoMinorista.checked =
                    true;

            }


            actualizarCamposTipo();

            actualizarContadorNotas();

        }


        limpiarErrores();


        setTimeout(
            function () {

                nombre.focus();

            },
            350
        );

    }


    /* =========================================================
       CERRAR PANEL
    ========================================================= */

    function cerrarPanel() {

        panel.classList.remove(
            "is-open"
        );

        panel.setAttribute(
            "aria-hidden",
            "true"
        );


        setTimeout(
            function () {

                overlay.hidden = true;

            },
            350
        );

    }


    /* =========================================================
       TIPO
    ========================================================= */

    function actualizarCamposTipo() {

        if (
            tipoMayorista.checked
        ) {

            camposMayorista.hidden =
                false;

            campoDpi.hidden =
                true;

            tipoHint.textContent =
                "Compra productos en volumen para negocio o reventa.";

        } else {

            camposMayorista.hidden =
                true;

            campoDpi.hidden =
                false;

            tipoHint.textContent =
                "Compra para uso personal, en unidades sueltas.";

        }

    }


    /* =========================================================
       TOAST
    ========================================================= */

    function mostrarToast(
        mensaje,
        tipo = "success"
    ) {

        clearTimeout(
            toastTimeout
        );


        toastMessage.textContent =
            mensaje;


        if (
            tipo === "error"
        ) {

            toastIcon.textContent =
                "×";

        } else {

            toastIcon.textContent =
                "✓";

        }


        toast.classList.add(
            "show"
        );


        toastTimeout =
            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                3000
            );

    }


    /* =========================================================
       VALIDACIÓN
    ========================================================= */

    function validarFormulario() {

        limpiarErrores();

        let valido = true;


        if (
            nombre.value.trim().length <
            3
        ) {

            mostrarError(
                nombre,
                "Ingrese un nombre válido."
            );

            valido = false;

        }


        if (
            telefono.value.trim() === ""
        ) {

            mostrarError(
                telefono,
                "Ingrese el número de teléfono."
            );

            valido = false;

        } else if (
            telefono.value.replace(
                /\D/g,
                ""
            ).length < 8
        ) {

            mostrarError(
                telefono,
                "Ingrese un teléfono válido."
            );

            valido = false;

        }


        if (
            email.value.trim() !== ""
        ) {

            const correoValido =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(
                        email.value.trim()
                    );


            if (!correoValido) {

                mostrarError(
                    email,
                    "Ingrese un correo válido."
                );

                valido = false;

            }

        }


        if (
            tipoMayorista.checked
        ) {

            if (
                nit.value.trim() === ""
            ) {

                mostrarError(
                    nit,
                    "El NIT es obligatorio para mayoristas."
                );

                valido = false;

            }

        }


        if (
            Number(descuento.value) <
            0 ||
            Number(descuento.value) >
            100
        ) {

            mostrarError(
                descuento,
                "El descuento debe estar entre 0 y 100."
            );

            valido = false;

        }


        if (!valido) {

            const primerError =
                document.querySelector(
                    ".error"
                );

            if (primerError) {

                primerError.focus();

            }

            mostrarToast(
                "Revisa los campos marcados.",
                "error"
            );

        }


        return valido;

    }


    /* =========================================================
       MOSTRAR ERROR
    ========================================================= */

    function mostrarError(
        elemento,
        mensaje
    ) {

        elemento.classList.add(
            "error"
        );


        const error =
            document.createElement(
                "div"
            );

        error.className =
            "error-message";

        error.textContent =
            mensaje;


        elemento.parentElement.appendChild(
            error
        );

    }


    /* =========================================================
       LIMPIAR ERRORES
    ========================================================= */

    function limpiarErrores() {

        document
            .querySelectorAll(
                ".error-message"
            )
            .forEach(
                elemento =>
                    elemento.remove()
            );


        document
            .querySelectorAll(
                ".error"
            )
            .forEach(
                elemento =>
                    elemento.classList.remove(
                        "error"
                    )
            );

    }


    /* =========================================================
       GUARDAR CLIENTE
    ========================================================= */

    clienteForm.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            if (
                !validarFormulario()
            ) {
                return;
            }


            const id =
                clienteId.value ||
                generarId();


            const clienteExistente =
                clientes.find(
                    cliente =>
                        cliente.id === id
                );


            const datosCliente = {

                id: id,

                tipo:
                    obtenerTipo(),

                nombre:
                    nombre.value.trim(),

                telefono:
                    telefono.value.trim(),

                email:
                    email.value.trim(),

                direccion:
                    direccion.value.trim(),

                dpi:
                    dpi.value.trim(),

                nit:
                    nit.value.trim(),

                descuento:
                    Number(
                        descuento.value || 0
                    ),

                limiteCredito:
                    Number(
                        limiteCredito.value || 0
                    ),

                notas:
                    notas.value.trim(),

                fecha:
                    clienteExistente
                        ? clienteExistente.fecha
                        : new Date().toISOString()

            };


            if (clienteExistente) {

                const indice =
                    clientes.findIndex(
                        cliente =>
                            cliente.id === id
                    );


                clientes[indice] =
                    datosCliente;


                mostrarToast(
                    "Cliente actualizado correctamente."
                );

            } else {

                clientes.push(
                    datosCliente
                );


                mostrarToast(
                    "Cliente registrado correctamente."
                );

            }


            guardarClientes();

            mostrarClientes();

            cerrarPanel();

        }
    );


    /* =========================================================
       NUEVO
    ========================================================= */

    btnNuevo.addEventListener(
        "click",
        function () {

            abrirPanel(
                "nuevo"
            );

        }
    );


    btnNuevoVacio.addEventListener(
        "click",
        function () {

            abrirPanel(
                "nuevo"
            );

        }
    );


    btnFloating.addEventListener(
        "click",
        function () {

            abrirPanel(
                "nuevo"
            );

        }
    );


    /* =========================================================
       CERRAR PANEL
    ========================================================= */

    btnCerrarPanel.addEventListener(
        "click",
        cerrarPanel
    );


    btnCancelar.addEventListener(
        "click",
        cerrarPanel
    );


    overlay.addEventListener(
        "click",
        cerrarPanel
    );


    /* =========================================================
       CAMBIO TIPO
    ========================================================= */

    tipoMinorista.addEventListener(
        "change",
        actualizarCamposTipo
    );


    tipoMayorista.addEventListener(
        "change",
        actualizarCamposTipo
    );


    /* =========================================================
       BUSCAR
    ========================================================= */

    searchInput.addEventListener(
        "input",
        mostrarClientes
    );


    btnLimpiarBusqueda.addEventListener(
        "click",
        function () {

            searchInput.value = "";

            mostrarClientes();

            searchInput.focus();

        }
    );


    /* =========================================================
       FILTROS
    ========================================================= */

    document
        .querySelectorAll(
            ".filter-button"
        )
        .forEach(
            function (boton) {

                boton.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                ".filter-button"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        boton.classList.add(
                            "active"
                        );


                        filtroActual =
                            boton.dataset.filter;


                        mostrarClientes();

                    }
                );

            }
        );


    /* =========================================================
       ACCIONES TABLA
    ========================================================= */

    tablaBody.addEventListener(
        "click",
        function (evento) {

            const boton =
                evento.target.closest(
                    ".btn-accion"
                );


            if (!boton) {
                return;
            }


            const id =
                boton.dataset.id;

            const accion =
                boton.dataset.accion;


            const cliente =
                clientes.find(
                    item =>
                        item.id === id
                );


            if (!cliente) {
                return;
            }


            if (
                accion === "editar"
            ) {

                abrirPanel(
                    "editar",
                    cliente
                );

            }


            if (
                accion === "eliminar"
            ) {

                abrirDialogoEliminar(
                    cliente
                );

            }


            if (
                accion === "ver"
            ) {

                abrirDetalle(
                    cliente
                );

            }

        }
    );


    /* =========================================================
       DETALLE
    ========================================================= */

    function abrirDetalle(cliente) {

        clienteDetalle =
            cliente;


        detalleAvatar.textContent =
            obtenerIniciales(
                cliente.nombre
            );


        detalleNombre.textContent =
            cliente.nombre;


        const mayorista =
            cliente.tipo === "mayorista";


        detalleTipo.textContent =
            mayorista
                ? "📦 Mayorista"
                : "🛍️ Minorista";


        detalleTipo.style.background =
            mayorista
                ? "var(--orange-bg)"
                : "var(--green-bg)";


        detalleTipo.style.color =
            mayorista
                ? "var(--orange)"
                : "var(--green)";


        detalleTelefono.textContent =
            cliente.telefono ||
            "Sin teléfono";


        detalleEmail.textContent =
            cliente.email ||
            "Sin correo";


        detalleDireccion.textContent =
            cliente.direccion ||
            "Sin dirección";


        detalleFecha.textContent =
            formatearFecha(
                cliente.fecha
            );


        detalleIdentificacion.textContent =
            mayorista
                ? (
                    cliente.nit
                        ? `NIT: ${cliente.nit}`
                        : "Sin NIT"
                )
                : (
                    cliente.dpi
                        ? `DPI: ${cliente.dpi}`
                        : "Sin DPI"
                );


        detalleComercial.textContent =
            mayorista
                ? `Descuento ${cliente.descuento || 0}% · Crédito Q${Number(cliente.limiteCredito || 0).toFixed(2)}`
                : "Cliente minorista";


        if (
            cliente.notas
        ) {

            detalleNotas.textContent =
                cliente.notas;

            detalleNotasContainer.style.display =
                "block";

        } else {

            detalleNotas.textContent =
                "Sin notas registradas.";

            detalleNotasContainer.style.display =
                "block";

        }


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

            if (!clienteDetalle) {
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


    /* =========================================================
       ELIMINAR
    ========================================================= */

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


    /* =========================================================
       NOTAS COUNTER
    ========================================================= */

    function actualizarContadorNotas() {

        notasCounter.textContent =
            notas.value.length;

    }


    notas.addEventListener(
        "input",
        actualizarContadorNotas
    );


    /* =========================================================
       DARK MODE
    ========================================================= */

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


        if (btnTemaDesktop) {

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
        ) === "dark"
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


    /* =========================================================
       SIDEBAR MOBILE
    ========================================================= */

    btnMenu.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    /* =========================================================
       EXPORTAR CSV
    ========================================================= */

    function exportarCSV() {

        if (
            clientes.length === 0
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
                    cliente.email || "",
                    cliente.dpi || "",
                    cliente.nit || "",
                    cliente.direccion || "",
                    cliente.descuento || 0,
                    cliente.limiteCredito || 0,
                    cliente.notas || "",
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
                                `"${String(dato)
                                    .replace(
                                        /"/g,
                                        '""'
                                    )}"`
                        )
                        .join(",")
            )
            .join("\n");


        const blob =
            new Blob(
                ["\ufeff" + csv],
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


    /* =========================================================
       IMPORTAR JSON
    ========================================================= */

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


                    } catch (error) {

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


    /* =========================================================
       ATAJOS DE TECLADO
    ========================================================= */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.ctrlKey &&
                evento.key.toLowerCase() === "n"
            ) {

                evento.preventDefault();

                abrirPanel(
                    "nuevo"
                );

            }


            if (
                evento.ctrlKey &&
                evento.key.toLowerCase() === "k"
            ) {

                evento.preventDefault();

                searchInput.focus();

            }


            if (
                evento.key === "Escape"
            ) {

                if (
                    panel.classList.contains(
                        "is-open"
                    )
                ) {

                    cerrarPanel();

                }

            }

        }
    );


    /* =========================================================
       NAVEGACIÓN ESTADÍSTICAS
    ========================================================= */

    const btnNavEstadisticas =
        document.getElementById(
            "btnNavEstadisticas"
        );


    btnNavEstadisticas.addEventListener(
        "click",
        function () {

            window.scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            );

        }
    );


    /* =========================================================
       INICIALIZAR
    ========================================================= */

    actualizarCamposTipo();

    actualizarContadorNotas();

    mostrarClientes();

});