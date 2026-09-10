const STORAGE_KEY = "clientesChiquis";
const THEME_KEY = "temaChiquis";

let clientes = [];
let clienteEditando = null;
let clienteEliminar = null;
let toastTimer = null;

const $ = id => document.getElementById(id);

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
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

function guardarClientes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
}

function cargarClientes() {
    try {
        clientes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        clientes = [];
    }
}

function aplicarTema() {
    const tema = localStorage.getItem(THEME_KEY);

    if (tema === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }
}

function cambiarTema() {
    const oscuro = document.body.classList.toggle("dark-theme");

    localStorage.setItem(
        THEME_KEY,
        oscuro ? "dark" : "light"
    );
}

function abrirPanelCliente(cliente = null) {

    clienteEditando = cliente;

    if (cliente) {

        $("tituloPanel").textContent = "Editar cliente";

        $("clienteId").value = cliente.id;
        $("nombre").value = cliente.nombre || "";
        $("telefono").value = cliente.telefono || "";
        $("email").value = cliente.email || "";
        $("dpi").value = cliente.dpi || "";
        $("nit").value = cliente.nit || "";
        $("direccion").value = cliente.direccion || "";
        $("descuento").value = cliente.descuento || 0;
        $("limiteCredito").value = cliente.limiteCredito || 0;

        const radio = document.querySelector(
            `input[name="tipoCliente"][value="${cliente.tipo || "minorista"}"]`
        );

        if (radio) radio.checked = true;

    } else {

        $("tituloPanel").textContent = "Nuevo cliente";

        $("clienteForm").reset();

        $("clienteId").value = "";

        const minorista = document.querySelector(
            'input[name="tipoCliente"][value="minorista"]'
        );

        if (minorista) minorista.checked = true;

        $("descuento").value = 0;
        $("limiteCredito").value = 0;
    }

    $("overlay").classList.add("show");
    $("panelCliente").classList.add("show");
    document.body.classList.add("modal-open");

    setTimeout(() => $("nombre").focus(), 250);
}

function cerrarPanelCliente() {

    $("panelCliente").classList.remove("show");
    $("overlay").classList.remove("show");

    document.body.classList.remove("modal-open");

    clienteEditando = null;
}

function validarCliente() {

    const nombre = $("nombre").value.trim();
    const telefono = $("telefono").value.trim();
    const email = $("email").value.trim();
    const nit = $("nit").value.trim();
    const tipo = document.querySelector(
        'input[name="tipoCliente"]:checked'
    )?.value || "minorista";

    const descuento = Number($("descuento").value);

    if (!nombre) {
        mostrarToast("Ingresa el nombre del cliente.");
        $("nombre").focus();
        return false;
    }

    if (!telefono) {
        mostrarToast("Ingresa el teléfono.");
        $("telefono").focus();
        return false;
    }

    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        mostrarToast("Ingresa un correo válido.");
        $("email").focus();
        return false;
    }

    if (tipo === "mayorista" && !nit) {
        mostrarToast("Los clientes mayoristas necesitan NIT.");
        $("nit").focus();
        return false;
    }

    if (descuento < 0 || descuento > 100) {
        mostrarToast("El descuento debe estar entre 0 y 100.");
        return false;
    }

    return true;
}

function guardarCliente(evento) {

    evento.preventDefault();

    if (!validarCliente()) return;

    const tipo = document.querySelector(
        'input[name="tipoCliente"]:checked'
    )?.value || "minorista";

    const datos = {
        id: $("clienteId").value || Date.now().toString(),
        nombre: $("nombre").value.trim(),
        telefono: $("telefono").value.trim(),
        email: $("email").value.trim(),
        dpi: $("dpi").value.trim(),
        nit: $("nit").value.trim(),
        direccion: $("direccion").value.trim(),
        tipo,
        descuento: Number($("descuento").value) || 0,
        limiteCredito: Number($("limiteCredito").value) || 0,
        activo: clienteEditando?.activo !== false,
        fechaCreacion:
            clienteEditando?.fechaCreacion ||
            new Date().toISOString()
    };

    if (clienteEditando) {

        const indice = clientes.findIndex(
            c => c.id === clienteEditando.id
        );

        if (indice !== -1) {
            clientes[indice] = datos;
        }

        mostrarToast("Cliente actualizado correctamente.");

    } else {

        clientes.push(datos);

        mostrarToast("Cliente guardado correctamente.");
    }

    guardarClientes();
    renderClientes();
    actualizarEstadisticas();
    cerrarPanelCliente();
}

function obtenerClientesFiltrados() {

    const texto = $("searchClientes").value
        .trim()
        .toLowerCase();

    const tipo = $("filtroTipo").value;

    return clientes.filter(cliente => {

        const coincideTexto =
            !texto ||
            (cliente.nombre || "").toLowerCase().includes(texto) ||
            (cliente.telefono || "").toLowerCase().includes(texto) ||
            (cliente.email || "").toLowerCase().includes(texto) ||
            (cliente.nit || "").toLowerCase().includes(texto);

        const coincideTipo =
            !tipo || cliente.tipo === tipo;

        return coincideTexto && coincideTipo;
    });
}

function renderClientes() {

    const body = $("clientesBody");
    const vacio = $("emptyClientes");

    const lista = obtenerClientesFiltrados();

    body.innerHTML = "";

    if (!lista.length) {
        vacio.style.display = "block";
        return;
    }

    vacio.style.display = "none";

    lista.forEach(cliente => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>
                <div class="client-name">
                    ${escaparHTML(cliente.nombre)}
                </div>
                <div class="client-sub">
                    ${escaparHTML(cliente.direccion || "Sin dirección")}
                </div>
            </td>

            <td>${escaparHTML(cliente.telefono)}</td>

            <td>${escaparHTML(cliente.email || "—")}</td>

            <td>${escaparHTML(cliente.nit || "—")}</td>

            <td>
                <span class="badge ${
                    cliente.tipo === "mayorista"
                        ? "badge-mayorista"
                        : "badge-minorista"
                }">
                    ${
                        cliente.tipo === "mayorista"
                            ? "Mayorista"
                            : "Minorista"
                    }
                </span>
            </td>

            <td>${cliente.descuento || 0}%</td>

            <td>
                <div class="action-buttons">

                    <button
                        class="action-btn"
                        title="Editar"
                        onclick="editarCliente('${cliente.id}')"
                    >
                        ✎
                    </button>

                    <button
                        class="action-btn"
                        title="WhatsApp"
                        onclick="abrirWhatsApp('${cliente.id}')"
                    >
                        ☎
                    </button>

                    <button
                        class="action-btn"
                        title="Eliminar"
                        onclick="solicitarEliminar('${cliente.id}')"
                    >
                        🗑
                    </button>

                </div>
            </td>
        `;

        body.appendChild(fila);
    });
}

function editarCliente(id) {

    const cliente = clientes.find(c => c.id === id);

    if (cliente) {
        abrirPanelCliente(cliente);
    }
}

function solicitarEliminar(id) {

    const cliente = clientes.find(c => c.id === id);

    if (!cliente) return;

    clienteEliminar = cliente;

    $("modalConfirmacion").classList.add("show");
}

function cerrarModalEliminar() {

    clienteEliminar = null;

    $("modalConfirmacion").classList.remove("show");
}

function eliminarCliente() {

    if (!clienteEliminar) return;

    clientes = clientes.filter(
        c => c.id !== clienteEliminar.id
    );

    guardarClientes();
    renderClientes();
    actualizarEstadisticas();

    cerrarModalEliminar();

    mostrarToast("Cliente eliminado correctamente.");
}

function abrirWhatsApp(id) {

    const cliente = clientes.find(c => c.id === id);

    if (!cliente || !cliente.telefono) {
        mostrarToast("Este cliente no tiene teléfono.");
        return;
    }

    const telefono = cliente.telefono.replace(/\D/g, "");

    let numero = telefono;

    if (numero.length === 8) {
        numero = "502" + numero;
    }

    const mensaje = encodeURIComponent(
        `Hola ${cliente.nombre}, le escribimos de Variedades Chiquis.`
    );

    window.open(
        `https://wa.me/${numero}?text=${mensaje}`,
        "_blank"
    );
}

function actualizarEstadisticas() {

    $("totalClientes").textContent = clientes.length;

    $("clientesActivos").textContent =
        clientes.filter(c => c.activo !== false).length;

    $("clientesMayoristas").textContent =
        clientes.filter(c => c.tipo === "mayorista").length;

    $("clientesCredito").textContent =
        clientes.filter(c => Number(c.limiteCredito) > 0).length;
}

function exportarClientes() {

    const archivo = new Blob(
        [JSON.stringify(clientes, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(archivo);

    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "clientesChiquis.json";

    enlace.click();

    URL.revokeObjectURL(url);

    mostrarToast("Clientes exportados correctamente.");
}

function importarClientes(evento) {

    const archivo = evento.target.files[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = e => {

        try {

            const datos = JSON.parse(e.target.result);

            if (!Array.isArray(datos)) {
                throw new Error();
            }

            clientes = datos;

            guardarClientes();
            renderClientes();
            actualizarEstadisticas();

            mostrarToast("Clientes importados correctamente.");

        } catch {
            mostrarToast("El archivo no tiene un formato válido.");
        }

        evento.target.value = "";
    };

    lector.readAsText(archivo);
}

document.addEventListener("DOMContentLoaded", () => {

    cargarClientes();
    aplicarTema();

    renderClientes();
    actualizarEstadisticas();

    $("btnNuevo").addEventListener(
        "click",
        () => abrirPanelCliente()
    );

    $("btnNuevoVacio").addEventListener(
        "click",
        () => abrirPanelCliente()
    );

    $("btnCerrarPanel").addEventListener(
        "click",
        cerrarPanelCliente
    );

    $("btnCancelar").addEventListener(
        "click",
        cerrarPanelCliente
    );

    $("overlay").addEventListener(
        "click",
        cerrarPanelCliente
    );

    $("clienteForm").addEventListener(
        "submit",
        guardarCliente
    );

    $("btnTema").addEventListener(
        "click",
        cambiarTema
    );

    $("searchClientes").addEventListener(
        "input",
        renderClientes
    );

    $("filtroTipo").addEventListener(
        "change",
        renderClientes
    );

    $("btnLimpiar").addEventListener("click", () => {

        $("searchClientes").value = "";
        $("filtroTipo").value = "";

        renderClientes();
    });

    $("btnExportar").addEventListener(
        "click",
        exportarClientes
    );

    $("inputImportar").addEventListener(
        "change",
        importarClientes
    );

    $("btnCancelarEliminar").addEventListener(
        "click",
        cerrarModalEliminar
    );

    $("btnConfirmarEliminar").addEventListener(
        "click",
        eliminarCliente
    );

    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape") {

            cerrarPanelCliente();
            cerrarModalEliminar();
        }

        if (
            evento.ctrlKey &&
            evento.key.toLowerCase() === "n"
        ) {
            evento.preventDefault();
            abrirPanelCliente();
        }

        if (
            evento.ctrlKey &&
            evento.key.toLowerCase() === "f"
        ) {
            evento.preventDefault();
            $("searchClientes").focus();
        }
    });

});