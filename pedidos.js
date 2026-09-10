'use strict';


/* =========================================================
   REGRESAR A CLIENTES
   =========================================================

   ESTA ES LA SOLUCIÓN DEL ERROR:

   Cannot GET /Solucion%20Variedades%20Chiquis,%20S.A/cliente.html

   No intentamos volver a solicitar cliente.html al servidor.
   Regresamos mediante el historial del navegador.
========================================================= */

function volverAClientes(evento) {

    if (evento) {
        evento.preventDefault();
    }

    /*
       Si llegamos a Pedidos desde Clientes,
       regresamos exactamente a la página anterior.
    */

    if (window.history.length > 1) {

        window.history.back();

        return;
    }

    /*
       Esta parte solamente se utiliza si Pedidos
       fue abierto directamente y no existe historial.
    */

    window.location.href = './cliente.html';
}


/* =========================================================
   APLICACIÓN
========================================================= */

document.addEventListener('DOMContentLoaded', function () {


    /* =====================================================
       CONFIGURACIÓN
    ====================================================== */

    const STORAGE_PEDIDOS = 'pedidosChiquis';

    const STORAGE_CLIENTES = 'clientesChiquis';

    const STORAGE_TEMA = 'temaChiquis';


    const $ = function (id) {
        return document.getElementById(id);
    };


    const on = function (id, evento, funcion) {

        const elemento = $(id);

        if (elemento) {
            elemento.addEventListener(
                evento,
                funcion
            );
        }
    };


    /* =====================================================
       VARIABLES
    ====================================================== */

    let pedidos = cargarPedidos();

    let clientes = cargarClientes();

    let pedidoDetalleActual = null;

    let filtroPedido = 'todos';

    let toastTimer = null;


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const overlay = $('overlay');

    const pedidoPanel = $('pedidoPanel');

    const pedidoForm = $('pedidoForm');

    const dialogDetalle =
        $('dialogPedidoDetalle');


    /* =====================================================
       NAVEGACIÓN A CLIENTES
    ====================================================== */

    on(
        'btnNavClientes',
        'click',
        volverAClientes
    );


    /* =====================================================
       ESCAPAR HTML
    ====================================================== */

    function escaparHTML(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {
            return '';
        }

        return String(valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    /* =====================================================
       DINERO
    ====================================================== */

    function dinero(valor) {

        const numero =
            Number(valor) || 0;

        return numero.toLocaleString(
            'es-GT',
            {
                style: 'currency',
                currency: 'GTQ',
                minimumFractionDigits: 2
            }
        );
    }


    /* =====================================================
       GENERAR ID
    ====================================================== */

    function generarId(prefijo) {

        prefijo =
            prefijo || 'ID-';

        return (
            prefijo +
            Date.now().toString(36).toUpperCase() +
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase()
        );
    }


    /* =====================================================
       CARGAR PEDIDOS
    ====================================================== */

    function cargarPedidos() {

        try {

            const datos =
                localStorage.getItem(
                    STORAGE_PEDIDOS
                );

            if (!datos) {
                return [];
            }

            const resultado =
                JSON.parse(datos);

            return Array.isArray(resultado)
                ? resultado
                : [];

        } catch (error) {

            console.error(
                'Error cargando pedidos:',
                error
            );

            return [];
        }
    }


    /* =====================================================
       GUARDAR PEDIDOS
    ====================================================== */

    function guardarPedidos() {

        localStorage.setItem(
            STORAGE_PEDIDOS,
            JSON.stringify(pedidos)
        );
    }


    /* =====================================================
       CARGAR CLIENTES
    ====================================================== */

    function cargarClientes() {

        try {

            const datos =
                localStorage.getItem(
                    STORAGE_CLIENTES
                );

            if (!datos) {
                return [];
            }

            const resultado =
                JSON.parse(datos);

            return Array.isArray(resultado)
                ? resultado
                : [];

        } catch (error) {

            console.error(
                'Error cargando clientes:',
                error
            );

            return [];
        }
    }


    /* =====================================================
       NÚMERO DE PEDIDO
    ====================================================== */

    function generarNumeroPedido() {

        let mayor = 0;

        pedidos.forEach(function (pedido) {

            const numero =
                String(
                    pedido.numero || ''
                ).replace(/\D/g, '');

            const valor =
                parseInt(numero, 10);

            if (
                !isNaN(valor) &&
                valor > mayor
            ) {
                mayor = valor;
            }

        });

        return (
            'PED-' +
            String(mayor + 1).padStart(4, '0')
        );
    }


    /* =====================================================
       FECHA ACTUAL
    ====================================================== */

    function fechaActualInput() {

        const fecha =
            new Date();

        const año =
            fecha.getFullYear();

        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(2, '0');

        const dia =
            String(
                fecha.getDate()
            ).padStart(2, '0');

        const horas =
            String(
                fecha.getHours()
            ).padStart(2, '0');

        const minutos =
            String(
                fecha.getMinutes()
            ).padStart(2, '0');

        return (
            año +
            '-' +
            mes +
            '-' +
            dia +
            'T' +
            horas +
            ':' +
            minutos
        );
    }


    /* =====================================================
       FORMATEAR FECHA
    ====================================================== */

    function formatearFechaHora(fecha) {

        if (!fecha) {
            return 'Sin fecha';
        }

        const fechaObj =
            new Date(fecha);

        if (
            isNaN(
                fechaObj.getTime()
            )
        ) {
            return String(fecha);
        }

        return fechaObj.toLocaleString(
            'es-GT',
            {
                dateStyle: 'short',
                timeStyle: 'short'
            }
        );
    }


    /* =====================================================
       TOAST
    ====================================================== */

    function toast(
        mensaje,
        tipo
    ) {

        const elementoToast =
            $('toast');

        const elementoMensaje =
            $('toastMessage');

        const elementoIcono =
            $('toastIcon');


        if (!elementoToast) {
            return;
        }


        if (elementoMensaje) {

            elementoMensaje.textContent =
                mensaje;
        }


        if (elementoIcono) {

            if (tipo === 'error') {

                elementoIcono.textContent =
                    '✕';

            } else if (
                tipo === 'warning'
            ) {

                elementoIcono.textContent =
                    '⚠️';

            } else {

                elementoIcono.textContent =
                    '✓';
            }
        }


        elementoToast.classList.add(
            'show'
        );


        clearTimeout(
            toastTimer
        );


        toastTimer =
            setTimeout(
                function () {

                    elementoToast.classList.remove(
                        'show'
                    );

                },
                3000
            );
    }


    /* =====================================================
       CERRAR TODO AL INICIAR
    ====================================================== */

    function cerrarTodoAlIniciar() {

        if (overlay) {

            overlay.classList.remove(
                'show'
            );

            overlay.hidden = true;

            overlay.style.opacity = '0';

            overlay.style.visibility =
                'hidden';

            overlay.style.pointerEvents =
                'none';
        }


        if (pedidoPanel) {

            pedidoPanel.classList.remove(
                'show'
            );

            pedidoPanel.style.transform =
                'translateX(100%)';
        }


        if (dialogDetalle) {

            dialogDetalle.classList.remove(
                'show'
            );

            dialogDetalle.hidden = true;
        }


        document.body.classList.remove(
            'modal-open'
        );
    }


    /* =====================================================
       ABRIR OVERLAY
    ====================================================== */

    function abrirOverlay() {

        if (!overlay) {
            return;
        }

        overlay.hidden = false;

        overlay.classList.add(
            'show'
        );

        overlay.style.opacity = '1';

        overlay.style.visibility =
            'visible';

        overlay.style.pointerEvents =
            'auto';
    }


    /* =====================================================
       CERRAR OVERLAY
    ====================================================== */

    function cerrarOverlay() {

        if (!overlay) {
            return;
        }

        overlay.classList.remove(
            'show'
        );

        overlay.hidden = true;

        overlay.style.opacity = '0';

        overlay.style.visibility =
            'hidden';

        overlay.style.pointerEvents =
            'none';
    }


    /* =====================================================
       CLIENTES EN SELECT
    ====================================================== */

    function cargarClientesEnSelect() {

        const select =
            $('pedidoCliente');

        if (!select) {
            return;
        }


        const valorAnterior =
            select.value;


        select.innerHTML =
            '<option value="">Selecciona un cliente</option>';


        clientes.forEach(
            function (cliente) {

                const option =
                    document.createElement(
                        'option'
                    );

                option.value =
                    cliente.id;

                option.textContent =
                    cliente.nombre ||
                    'Cliente sin nombre';

                select.appendChild(
                    option
                );
            }
        );


        if (valorAnterior) {

            select.value =
                valorAnterior;
        }
    }


    /* =====================================================
       AGREGAR PRODUCTO
    ====================================================== */

    function agregarFilaProducto(
        producto
    ) {

        producto =
            producto || {};


        const contenedor =
            $('productosPedido');


        if (!contenedor) {
            return;
        }


        const fila =
            document.createElement(
                'div'
            );


        fila.className =
            'producto-row';


        fila.innerHTML = `

            <div class="field">

                <label>
                    Producto
                </label>

                <input
                    type="text"
                    class="producto-nombre"
                    placeholder="Nombre del producto"
                    value="${escaparHTML(
                        producto.nombre || ''
                    )}"
                >

            </div>


            <div class="field">

                <label>
                    Cantidad
                </label>

                <input
                    type="number"
                    class="producto-cantidad"
                    min="1"
                    step="1"
                    value="${producto.cantidad || 1}"
                >

            </div>


            <div class="field">

                <label>
                    Precio
                </label>

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
                title="Eliminar producto">

                🗑️

            </button>

        `;


        const btnEliminar =
            fila.querySelector(
                '.btn-eliminar-producto'
            );


        btnEliminar.addEventListener(
            'click',
            function () {

                fila.remove();

                calcularTotales();
            }
        );


        const cantidad =
            fila.querySelector(
                '.producto-cantidad'
            );


        const precio =
            fila.querySelector(
                '.producto-precio'
            );


        const nombre =
            fila.querySelector(
                '.producto-nombre'
            );


        cantidad.addEventListener(
            'input',
            calcularTotales
        );


        precio.addEventListener(
            'input',
            calcularTotales
        );


        nombre.addEventListener(
            'input',
            calcularTotales
        );


        contenedor.appendChild(
            fila
        );
    }


    /* =====================================================
       OBTENER PRODUCTOS
    ====================================================== */

    function obtenerProductos() {

        const contenedor =
            $('productosPedido');


        if (!contenedor) {
            return [];
        }


        const filas =
            contenedor.querySelectorAll(
                '.producto-row'
            );


        const productos = [];


        filas.forEach(
            function (fila) {

                const nombre =
                    fila.querySelector(
                        '.producto-nombre'
                    )?.value.trim();


                const cantidad =
                    Number(
                        fila.querySelector(
                            '.producto-cantidad'
                        )?.value
                    ) || 0;


                const precio =
                    Number(
                        fila.querySelector(
                            '.producto-precio'
                        )?.value
                    ) || 0;


                if (
                    nombre ||
                    cantidad ||
                    precio
                ) {

                    productos.push({

                        nombre:
                            nombre,

                        cantidad:
                            cantidad,

                        precio:
                            precio,

                        subtotal:
                            cantidad * precio

                    });
                }

            }
        );


        return productos;
    }


    /* =====================================================
       CALCULAR TOTALES
    ====================================================== */

    function calcularTotales() {

        const productos =
            obtenerProductos();


        let subtotal = 0;


        productos.forEach(
            function (producto) {

                subtotal +=
                    Number(
                        producto.cantidad || 0
                    ) *
                    Number(
                        producto.precio || 0
                    );
            }
        );


        const clienteId =
            $('pedidoCliente')?.value;


        const cliente =
            clientes.find(
                function (c) {

                    return String(c.id) ===
                        String(clienteId);

                }
            );


        const porcentaje =
            Number(
                cliente?.descuento || 0
            );


        const descuento =
            subtotal *
            (porcentaje / 100);


        const total =
            subtotal -
            descuento;


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

            subtotal:
                subtotal,

            descuento:
                descuento,

            total:
                total
        };
    }


    /* =====================================================
       ABRIR PANEL
    ====================================================== */

    function abrirPanelPedido(
        pedido
    ) {

        pedido =
            pedido || null;


        cargarClientesEnSelect();


        if (!pedido) {


            if (pedidoForm) {
                pedidoForm.reset();
            }


            $('pedidoId').value =
                '';


            $('pedidoNumero').value =
                generarNumeroPedido();


            $('pedidoFecha').value =
                fechaActualInput();


            $('pedidoEstado').value =
                'pendiente';


            $('pedidoOrigen').value =
                'Tienda';


            $('productosPedido').innerHTML =
                '';


            agregarFilaProducto();


        } else {


            $('pedidoId').value =
                pedido.id || '';


            $('pedidoNumero').value =
                pedido.numero || '';


            $('pedidoFecha').value =
                pedido.fecha ||
                fechaActualInput();


            $('pedidoCliente').value =
                pedido.clienteId || '';


            $('pedidoOrigen').value =
                pedido.origen ||
                'Tienda';


            $('pedidoEstado').value =
                pedido.estado ||
                'pendiente';


            $('pedidoDireccion').value =
                pedido.direccion || '';


            $('pedidoNotas').value =
                pedido.notas || '';


            $('productosPedido').innerHTML =
                '';


            const productos =
                Array.isArray(
                    pedido.productos
                )
                    ? pedido.productos
                    : [];


            if (
                productos.length === 0
            ) {

                agregarFilaProducto();

            } else {

                productos.forEach(
                    function (producto) {

                        agregarFilaProducto(
                            producto
                        );

                    }
                );
            }
        }


        calcularTotales();


        abrirOverlay();


        if (pedidoPanel) {

            pedidoPanel.classList.add(
                'show'
            );

            pedidoPanel.style.transform =
                'translateX(0)';
        }


        document.body.classList.add(
            'modal-open'
        );
    }


    /* =====================================================
       CERRAR PANEL
    ====================================================== */

    function cerrarPanelPedido() {

        if (pedidoPanel) {

            pedidoPanel.classList.remove(
                'show'
            );

            pedidoPanel.style.transform =
                'translateX(100%)';
        }


        cerrarOverlay();


        document.body.classList.remove(
            'modal-open'
        );
    }


    /* =====================================================
       VALIDAR
    ====================================================== */

    function validarPedido() {

        const cliente =
            $('pedidoCliente')?.value;


        const fecha =
            $('pedidoFecha')?.value;


        const productos =
            obtenerProductos();


        if (!cliente) {

            toast(
                'Selecciona un cliente.',
                'warning'
            );

            return false;
        }


        if (!fecha) {

            toast(
                'Selecciona la fecha del pedido.',
                'warning'
            );

            return false;
        }


        if (
            productos.length === 0
        ) {

            toast(
                'Agrega al menos un producto.',
                'warning'
            );

            return false;
        }


        for (
            const producto of productos
        ) {


            if (!producto.nombre) {

                toast(
                    'Todos los productos deben tener nombre.',
                    'warning'
                );

                return false;
            }


            if (
                producto.cantidad <= 0
            ) {

                toast(
                    'La cantidad debe ser mayor que cero.',
                    'warning'
                );

                return false;
            }


            if (
                producto.precio < 0
            ) {

                toast(
                    'El precio no puede ser negativo.',
                    'warning'
                );

                return false;
            }

        }


        return true;
    }


    /* =====================================================
       GUARDAR PEDIDO
    ====================================================== */

    function guardarPedido(
        evento
    ) {

        evento.preventDefault();


        if (!validarPedido()) {
            return;
        }


        const id =
            $('pedidoId')?.value ||
            generarId('PED-');


        const pedidoExistente =
            pedidos.find(
                function (p) {

                    return String(p.id) ===
                        String(id);

                }
            );


        const productos =
            obtenerProductos();


        const totales =
            calcularTotales();


        const clienteId =
            $('pedidoCliente').value;


        const cliente =
            clientes.find(
                function (c) {

                    return String(c.id) ===
                        String(clienteId);

                }
            );


        const datos = {

            id:
                id,

            numero:
                $('pedidoNumero').value ||
                generarNumeroPedido(),

            fecha:
                $('pedidoFecha').value ||
                fechaActualInput(),

            clienteId:
                clienteId,

            clienteNombre:
                cliente?.nombre ||
                'Cliente',

            clienteTelefono:
                cliente?.telefono ||
                '',

            origen:
                $('pedidoOrigen').value ||
                'Tienda',

            estado:
                $('pedidoEstado').value ||
                'pendiente',

            productos:
                productos,

            subtotal:
                totales.subtotal,

            descuento:
                totales.descuento,

            total:
                totales.total,

            direccion:
                $('pedidoDireccion').value.trim(),

            notas:
                $('pedidoNotas').value.trim(),

            actualizado:
                new Date().toISOString()

        };


        if (pedidoExistente) {

            Object.assign(
                pedidoExistente,
                datos
            );


            toast(
                'Pedido actualizado correctamente.'
            );

        } else {

            pedidos.push(
                datos
            );


            toast(
                'Pedido creado correctamente.'
            );
        }


        guardarPedidos();


        cerrarPanelPedido();


        mostrarPedidos();


        actualizarEstadisticasPedidos();
    }


    /* =====================================================
       FILTRAR
    ====================================================== */

    function obtenerPedidosFiltrados() {

        const texto =
            $('searchPedidos')?.value
                .trim()
                .toLowerCase() ||
            '';


        return pedidos.filter(
            function (pedido) {


                const coincideEstado =
                    filtroPedido ===
                    'todos' ||
                    String(
                        pedido.estado
                    ).toLowerCase() ===
                    filtroPedido;


                const contenido = [

                    pedido.numero,

                    pedido.clienteNombre,

                    pedido.clienteTelefono,

                    pedido.origen,

                    pedido.estado

                ]
                    .join(' ')
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
    }


    /* =====================================================
       MOSTRAR PEDIDOS
    ====================================================== */

    function mostrarPedidos() {

        const tbody =
            $('pedidosBody');


        const empty =
            $('emptyPedidos');


        if (!tbody) {
            return;
        }


        const lista =
            obtenerPedidosFiltrados();


        tbody.innerHTML =
            '';


        if (
            lista.length === 0
        ) {

            if (empty) {

                empty.classList.add(
                    'show'
                );
            }

            return;
        }


        if (empty) {

            empty.classList.remove(
                'show'
            );
        }


        lista.forEach(
            function (pedido) {


                const fila =
                    document.createElement(
                        'tr'
                    );


                const estado =
                    String(
                        pedido.estado ||
                        'pendiente'
                    ).toLowerCase();


                const nombre =
                    pedido.clienteNombre ||
                    obtenerNombreCliente(
                        pedido.clienteId
                    );


                fila.innerHTML = `

                    <td>

                        <div class="pedido-numero">

                            <strong>
                                ${escaparHTML(
                                    pedido.numero ||
                                    'Sin número'
                                )}
                            </strong>

                            <small>
                                ${escaparHTML(
                                    pedido.id || ''
                                )}
                            </small>

                        </div>

                    </td>


                    <td>

                        <div class="cliente-cell">

                            <div class="avatar">

                                ${escaparHTML(
                                    obtenerIniciales(
                                        nombre
                                    )
                                )}

                            </div>


                            <div>

                                <strong>
                                    ${escaparHTML(
                                        nombre
                                    )}
                                </strong>

                                <small>
                                    ${escaparHTML(
                                        pedido.clienteTelefono ||
                                        ''
                                    )}
                                </small>

                            </div>

                        </div>

                    </td>


                    <td>

                        ${escaparHTML(
                            formatearFechaHora(
                                pedido.fecha
                            )
                        )}

                    </td>


                    <td>

                        <span class="status-badge ${estado}">

                            ${textoEstado(
                                estado
                            )}

                        </span>

                    </td>


                    <td>

                        ${escaparHTML(
                            pedido.origen ||
                            'Tienda'
                        )}

                    </td>


                    <td>

                        <strong>
                            ${dinero(
                                pedido.total
                            )}
                        </strong>

                    </td>


                    <td>

                        <div class="actions">


                            <button
                                class="action-btn"
                                data-action="ver"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Ver pedido">

                                👁️

                            </button>


                            <button
                                class="action-btn"
                                data-action="editar"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Editar pedido">

                                ✏️

                            </button>


                            <button
                                class="action-btn danger"
                                data-action="eliminar"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Eliminar pedido">

                                🗑️

                            </button>


                        </div>

                    </td>

                `;


                tbody.appendChild(
                    fila
                );

            }
        );
    }


    /* =====================================================
       NOMBRE CLIENTE
    ====================================================== */

    function obtenerNombreCliente(
        clienteId
    ) {

        const cliente =
            clientes.find(
                function (c) {

                    return String(c.id) ===
                        String(clienteId);

                }
            );


        return cliente?.nombre ||
            'Cliente eliminado';
    }


    /* =====================================================
       INICIALES
    ====================================================== */

    function obtenerIniciales(
        nombre
    ) {

        if (!nombre) {
            return '?';
        }


        const partes =
            String(nombre)
                .trim()
                .split(/\s+/)
                .slice(0, 2);


        return partes
            .map(
                function (p) {

                    return p.charAt(0);

                }
            )
            .join('')
            .toUpperCase();
    }


    /* =====================================================
       ESTADO
    ====================================================== */

    function textoEstado(
        estado
    ) {

        const estados = {

            pendiente:
                'Pendiente',

            preparando:
                'Preparando',

            entregado:
                'Entregado'

        };


        return estados[estado] ||
            estado;
    }


    /* =====================================================
       ESTADÍSTICAS
    ====================================================== */

    function actualizarEstadisticasPedidos() {

        const total =
            pedidos.length;


        const pendientes =
            pedidos.filter(
                function (p) {

                    return String(
                        p.estado
                    ).toLowerCase() ===
                    'pendiente';

                }
            ).length;


        const entregados =
            pedidos.filter(
                function (p) {

                    return String(
                        p.estado
                    ).toLowerCase() ===
                    'entregado';

                }
            ).length;


        const ventas =
            pedidos.reduce(
                function (suma, p) {

                    return suma +
                        (
                            Number(
                                p.total
                            ) || 0
                        );

                },
                0
            );


        if ($('statPedidos')) {

            $('statPedidos').textContent =
                total;
        }


        if ($('statPedidosPendientes')) {

            $('statPedidosPendientes').textContent =
                pendientes;
        }


        if ($('statPedidosEntregados')) {

            $('statPedidosEntregados').textContent =
                entregados;
        }


        if ($('statVentas')) {

            $('statVentas').textContent =
                dinero(ventas);
        }
    }


    /* =====================================================
       DETALLE
    ====================================================== */

    function mostrarDetallePedido(
        id
    ) {

        const pedido =
            pedidos.find(
                function (p) {

                    return String(p.id) ===
                        String(id);

                }
            );


        if (!pedido) {
            return;
        }


        pedidoDetalleActual =
            pedido;


        const nombre =
            pedido.clienteNombre ||
            obtenerNombreCliente(
                pedido.clienteId
            );


        $('detallePedidoNumero').textContent =
            pedido.numero || '';


        $('detallePedidoCliente').textContent =
            nombre;


        $('detallePedidoTelefono').textContent =
            pedido.clienteTelefono ||
            'Sin teléfono';


        $('detallePedidoFecha').textContent =
            formatearFechaHora(
                pedido.fecha
            );


        $('detallePedidoOrigen').textContent =
            pedido.origen ||
            'Tienda';


        $('detallePedidoDireccion').textContent =
            pedido.direccion ||
            'Sin dirección';


        $('detallePedidoEstado').textContent =
            textoEstado(
                String(
                    pedido.estado ||
                    'pendiente'
                ).toLowerCase()
            );


        $('detallePedidoTotal').textContent =
            dinero(
                pedido.total
            );


        $('detallePedidoNotas').textContent =
            pedido.notas ||
            'Sin notas.';


        const productos =
            $('detallePedidoProductos');


        if (productos) {

            productos.innerHTML =
                '';


            (
                pedido.productos ||
                []
            ).forEach(
                function (producto) {


                    const fila =
                        document.createElement(
                            'div'
                        );


                    fila.className =
                        'detalle-producto';


                    fila.innerHTML = `

                        <span>
                            ${escaparHTML(
                                producto.nombre
                            )}
                        </span>


                        <span>

                            ${producto.cantidad}
                            ×
                            ${dinero(
                                producto.precio
                            )}

                        </span>


                        <strong>

                            ${dinero(
                                producto.subtotal ||
                                (
                                    producto.cantidad *
                                    producto.precio
                                )
                            )}

                        </strong>

                    `;


                    productos.appendChild(
                        fila
                    );

                }
            );
        }


        if (dialogDetalle) {

            dialogDetalle.hidden =
                false;

            dialogDetalle.classList.add(
                'show'
            );
        }
    }


    /* =====================================================
       CERRAR DETALLE
    ====================================================== */

    function cerrarDetallePedido() {

        if (dialogDetalle) {

            dialogDetalle.classList.remove(
                'show'
            );

            dialogDetalle.hidden =
                true;
        }


        pedidoDetalleActual =
            null;
    }


    /* =====================================================
       EDITAR
    ====================================================== */

    function editarPedido(
        id
    ) {

        const pedido =
            pedidos.find(
                function (p) {

                    return String(p.id) ===
                        String(id);

                }
            );


        if (!pedido) {
            return;
        }


        cerrarDetallePedido();


        abrirPanelPedido(
            pedido
        );
    }


    /* =====================================================
       ELIMINAR
    ====================================================== */

    function eliminarPedido(
        id
    ) {

        const pedido =
            pedidos.find(
                function (p) {

                    return String(p.id) ===
                        String(id);

                }
            );


        if (!pedido) {
            return;
        }


        const confirmar =
            window.confirm(
                '¿Deseas eliminar el pedido ' +
                pedido.numero +
                '?'
            );


        if (!confirmar) {
            return;
        }


        pedidos =
            pedidos.filter(
                function (p) {

                    return String(p.id) !==
                        String(id);

                }
            );


        guardarPedidos();


        cerrarDetallePedido();


        mostrarPedidos();


        actualizarEstadisticasPedidos();


        toast(
            'Pedido eliminado correctamente.'
        );
    }


    /* =====================================================
       WHATSAPP
    ====================================================== */

    function abrirWhatsAppPedido() {

        if (!pedidoDetalleActual) {
            return;
        }


        let telefono =
            String(
                pedidoDetalleActual.clienteTelefono ||
                ''
            ).replace(
                /\D/g,
                ''
            );


        if (
            telefono.length === 8
        ) {

            telefono =
                '502' +
                telefono;
        }


        if (!telefono) {

            toast(
                'El cliente no tiene teléfono registrado.',
                'warning'
            );

            return;
        }


        const mensaje =
            'Hola, le escribimos de Variedades Chiquis. ' +
            'Respecto a su pedido ' +
            (
                pedidoDetalleActual.numero ||
                ''
            ) +
            '.';


        const url =
            'https://wa.me/' +
            telefono +
            '?text=' +
            encodeURIComponent(
                mensaje
            );


        window.open(
            url,
            '_blank'
        );
    }


    /* =====================================================
       EXPORTAR
    ====================================================== */

    function exportarPedidos() {

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
                        'application/json'
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const enlace =
            document.createElement(
                'a'
            );


        enlace.href =
            url;


        enlace.download =
            'pedidos-variedades-chiquis.json';


        document.body.appendChild(
            enlace
        );


        enlace.click();


        enlace.remove();


        URL.revokeObjectURL(
            url
        );


        toast(
            'Pedidos exportados correctamente.'
        );
    }


    /* =====================================================
       TEMA
    ====================================================== */

    function aplicarTema() {

        const tema =
            localStorage.getItem(
                STORAGE_TEMA
            );


        if (
            tema === 'oscuro'
        ) {

            document.body.classList.add(
                'dark'
            );

        } else {

            document.body.classList.remove(
                'dark'
            );
        }


        actualizarBotonTema();
    }


    function actualizarBotonTema() {

        const oscuro =
            document.body.classList.contains(
                'dark'
            );


        if ($('themeIcon')) {

            $('themeIcon').textContent =
                oscuro
                    ? '☀️'
                    : '🌙';
        }


        if ($('themeText')) {

            $('themeText').textContent =
                oscuro
                    ? 'Modo claro'
                    : 'Cambiar tema';
        }
    }


    function cambiarTema() {

        const oscuro =
            document.body.classList.toggle(
                'dark'
            );


        localStorage.setItem(
            STORAGE_TEMA,
            oscuro
                ? 'oscuro'
                : 'claro'
        );


        actualizarBotonTema();
    }


    /* =====================================================
       EVENTOS
    ====================================================== */


    on(
        'btnNuevoPedido',
        'click',
        function () {

            abrirPanelPedido();

        }
    );


    on(
        'btnNuevoPedidoVacio',
        'click',
        function () {

            abrirPanelPedido();

        }
    );


    on(
        'btnAgregarProducto',
        'click',
        function () {

            agregarFilaProducto();

        }
    );


    on(
        'btnCerrarPedido',
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
        'pedidoCliente',
        'change',
        calcularTotales
    );


    if (pedidoForm) {

        pedidoForm.addEventListener(
            'submit',
            guardarPedido
        );
    }


    on(
        'searchPedidos',
        'input',
        mostrarPedidos
    );


    on(
        'filtroEstado',
        'change',
        function () {

            filtroPedido =
                $('filtroEstado')?.value ||
                'todos';


            mostrarPedidos();
        }
    );


    on(
        'btnLimpiarPedidos',
        'click',
        function () {

            if ($('searchPedidos')) {

                $('searchPedidos').value =
                    '';
            }


            if ($('filtroEstado')) {

                $('filtroEstado').value =
                    'todos';
            }


            filtroPedido =
                'todos';


            mostrarPedidos();
        }
    );


    on(
        'btnExportarPedidos',
        'click',
        exportarPedidos
    );


    on(
        'btnTema',
        'click',
        cambiarTema
    );


    /* =====================================================
       ACCIONES DE LA TABLA
    ====================================================== */

    const pedidosBody =
        $('pedidosBody');


    if (pedidosBody) {

        pedidosBody.addEventListener(
            'click',
            function (evento) {


                const boton =
                    evento.target.closest(
                        '[data-action]'
                    );


                if (!boton) {
                    return;
                }


                const accion =
                    boton.dataset.action;


                const id =
                    boton.dataset.id;


                if (
                    accion === 'ver'
                ) {

                    mostrarDetallePedido(
                        id
                    );

                } else if (
                    accion === 'editar'
                ) {

                    editarPedido(
                        id
                    );

                } else if (
                    accion === 'eliminar'
                ) {

                    eliminarPedido(
                        id
                    );
                }

            }
        );
    }


    /* =====================================================
       BOTONES DEL DETALLE
    ====================================================== */

    on(
        'btnCerrarDetalle',
        'click',
        cerrarDetallePedido
    );


    on(
        'btnEditarPedidoDetalle',
        'click',
        function () {

            if (
                pedidoDetalleActual
            ) {

                editarPedido(
                    pedidoDetalleActual.id
                );
            }
        }
    );


    on(
        'btnEliminarPedidoDetalle',
        'click',
        function () {

            if (
                pedidoDetalleActual
            ) {

                eliminarPedido(
                    pedidoDetalleActual.id
                );
            }
        }
    );


    on(
        'btnWhatsAppPedido',
        'click',
        abrirWhatsAppPedido
    );


    /* =====================================================
       ESC PARA CERRAR
    ====================================================== */

    document.addEventListener(
        'keydown',
        function (evento) {

            if (
                evento.key === 'Escape'
            ) {

                cerrarPanelPedido();

                cerrarDetallePedido();
            }
        }
    );


    /* =====================================================
       INICIALIZACIÓN
    ====================================================== */

    cerrarTodoAlIniciar();

    aplicarTema();

    mostrarPedidos();

    actualizarEstadisticasPedidos();

});