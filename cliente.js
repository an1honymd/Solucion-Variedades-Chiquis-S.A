document.addEventListener('DOMContentLoaded', () => {

    'use strict';


    /* ============================================================
       CONFIGURACIÓN
    ============================================================ */

    const STORAGE_PEDIDOS = 'pedidosChiquis';
    const STORAGE_CLIENTES = 'clientesChiquis';
    const STORAGE_TEMA = 'temaChiquis';


    const $ = (id) => document.getElementById(id);


    const on = (id, evento, funcion) => {

        const elemento = $(id);

        if (elemento) {
            elemento.addEventListener(evento, funcion);
        }

        return elemento;
    };


    /* ============================================================
       VARIABLES
    ============================================================ */

    let clientes = cargarClientes();

    let pedidos = cargarPedidos();

    let pedidoDetalleActual = null;

    let filtroPedido = 'todos';


    const overlay = $('overlay');

    const pedidoPanel = $('pedidoPanel');

    const pedidoForm = $('pedidoForm');


    /* ============================================================
       UTILIDADES
    ============================================================ */

    function escaparHTML(valor) {

        return String(valor ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    }


    function dinero(valor) {

        return 'Q' +
            Number(valor || 0).toFixed(2);

    }


    function generarId(prefijo = '') {

        return prefijo +
            Date.now() +
            Math.random()
                .toString(36)
                .slice(2, 8);

    }


    function formatearFechaHora(fecha) {

        if (!fecha) {
            return 'Sin fecha';
        }

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

        return d
            .toISOString()
            .slice(0, 16);

    }


    function fechaParaInput(fecha) {

        if (!fecha) {
            return fechaActualInput();
        }

        const d = new Date(fecha);

        if (Number.isNaN(d.getTime())) {

            return String(fecha)
                .slice(0, 16);

        }

        d.setMinutes(
            d.getMinutes() -
            d.getTimezoneOffset()
        );

        return d
            .toISOString()
            .slice(0, 16);

    }


    function toast(mensaje, tipo = 'success') {

        const contenedor = $('toast');

        if (!contenedor) {
            return;
        }

        const icono = $('toastIcon');

        const texto = $('toastMessage');


        if (texto) {
            texto.textContent = mensaje;
        }


        if (icono) {

            icono.textContent =
                tipo === 'error'
                    ? '!'
                    : '✓';

        }


        contenedor.classList.add('show');


        clearTimeout(
            window.__toastTimer
        );


        window.__toastTimer =
            setTimeout(() => {

                contenedor
                    .classList
                    .remove('show');

            }, 3000);

    }


    /* ============================================================
       LOCAL STORAGE CLIENTES
    ============================================================ */

    function cargarClientes() {

        try {

            const datos =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_CLIENTES
                    ) || '[]'
                );


            return Array.isArray(datos)
                ? datos
                : [];

        } catch (error) {

            console.error(error);

            return [];

        }

    }


    /* ============================================================
       LOCAL STORAGE PEDIDOS
    ============================================================ */

    function cargarPedidos() {

        try {

            const datos =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_PEDIDOS
                    ) || '[]'
                );


            return Array.isArray(datos)
                ? datos
                : [];

        } catch (error) {

            console.error(error);

            return [];

        }

    }


    function guardarPedidos() {

        try {

            localStorage.setItem(
                STORAGE_PEDIDOS,
                JSON.stringify(pedidos)
            );

            return true;

        } catch (error) {

            console.error(error);

            toast(
                'No se pudieron guardar los pedidos.',
                'error'
            );

            return false;

        }

    }


    /* ============================================================
       NÚMERO DE PEDIDO
    ============================================================ */

    function numeroPedido() {

        let mayor = 0;


        pedidos.forEach(pedido => {

            const numero =
                parseInt(
                    String(
                        pedido.numero || ''
                    ).replace(/\D/g, ''),
                    10
                );


            if (!Number.isNaN(numero)) {

                mayor =
                    Math.max(
                        mayor,
                        numero
                    );

            }

        });


        return 'PED-' +
            String(mayor + 1)
                .padStart(4, '0');

    }


    /* ============================================================
       CLIENTES
    ============================================================ */

    function cargarClientesEnSelect(
        seleccionado = ''
    ) {

        const select =
            $('pedidoCliente');


        if (!select) {
            return;
        }


        select.innerHTML = `
            <option value="">
                Seleccione un cliente
            </option>
        `;


        clientes
            .slice()
            .sort((a, b) =>
                String(a.nombre || '')
                    .localeCompare(
                        String(b.nombre || ''),
                        'es'
                    )
            )
            .forEach(cliente => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    cliente.id;


                option.textContent =
                    `${cliente.nombre} — ${
                        cliente.telefono ||
                        'sin teléfono'
                    }`;


                if (
                    String(cliente.id) ===
                    String(seleccionado)
                ) {

                    option.selected = true;

                }


                select.appendChild(option);

            });

    }


    /* ============================================================
       PRODUCTOS
    ============================================================ */

    function agregarFilaProducto(
        producto = {}
    ) {

        const contenedor =
            $('productosPedido');


        if (!contenedor) {
            return;
        }


        const fila =
            document.createElement('div');


        fila.className =
            'producto-pedido-row';


        fila.innerHTML = `

            <div>

                <label>
                    Producto
                </label>

                <input
                    type="text"
                    class="producto-nombre"
                    placeholder="Ej. Camisa"
                    value="${escaparHTML(
                        producto.nombre || ''
                    )}">

            </div>


            <div>

                <label>
                    Cantidad
                </label>

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

                <label>
                    Precio
                </label>

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

                <label>
                    Subtotal
                </label>

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


        contenedor.appendChild(fila);


        fila
            .querySelectorAll(
                '.producto-cantidad, .producto-precio'
            )
            .forEach(input => {

                input.addEventListener(
                    'input',
                    calcularTotalesPedido
                );

            });


        fila
            .querySelector(
                '.btn-quitar-producto'
            )
            ?.addEventListener(
                'click',
                () => {

                    fila.remove();

                    calcularTotalesPedido();

                }
            );


        calcularTotalesPedido();

    }


    function obtenerProductosPedido() {

        return [
            ...document.querySelectorAll(
                '#productosPedido .producto-pedido-row'
            )
        ]

            .map(fila => {

                const nombre =
                    fila
                        .querySelector(
                            '.producto-nombre'
                        )
                        ?.value
                        .trim() || '';


                const cantidad =
                    Number(
                        fila
                            .querySelector(
                                '.producto-cantidad'
                            )
                            ?.value || 0
                    );


                const precio =
                    Number(
                        fila
                            .querySelector(
                                '.producto-precio'
                            )
                            ?.value || 0
                    );


                return {

                    nombre,

                    cantidad,

                    precio,

                    subtotal:
                        cantidad * precio

                };

            })

            .filter(producto =>
                producto.nombre &&
                producto.cantidad > 0 &&
                producto.precio >= 0
            );

    }


    /* ============================================================
       TOTALES
    ============================================================ */

    function calcularTotalesPedido() {

        let subtotal = 0;


        document
            .querySelectorAll(
                '#productosPedido .producto-pedido-row'
            )
            .forEach(fila => {

                const cantidad =
                    Number(
                        fila
                            .querySelector(
                                '.producto-cantidad'
                            )
                            ?.value || 0
                    );


                const precio =
                    Number(
                        fila
                            .querySelector(
                                '.producto-precio'
                            )
                            ?.value || 0
                    );


                const sub =
                    cantidad * precio;


                subtotal += sub;


                const campo =
                    fila.querySelector(
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
                        $('pedidoCliente')
                            ?.value
                    )
            );


        const porcentaje =
            cliente?.tipo === 'mayorista'
                ? Number(
                    cliente.descuento || 0
                )
                : 0;


        const descuento =
            subtotal *
            porcentaje /
            100;


        const total =
            subtotal -
            descuento;


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


        return {

            subtotal,

            descuento,

            total,

            porcentaje

        };

    }


    /* ============================================================
       ABRIR PANEL
    ============================================================ */

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


        pedidoPanel
            .classList
            .add('is-open');


        pedidoPanel
            .setAttribute(
                'aria-hidden',
                'false'
            );


        $('pedidoPanelTitulo')
            .textContent =
            pedido
                ? 'Editar pedido'
                : 'Nuevo pedido';


        $('pedidoId').value =
            pedido?.id || '';


        $('pedidoNumero').value =
            pedido?.numero ||
            numeroPedido();


        $('pedidoFecha').value =
            pedido?.fecha
                ? fechaParaInput(
                    pedido.fecha
                )
                : fechaActualInput();


        $('pedidoOrigen').value =
            pedido?.origen ||
            'Tienda / Autoservicio';


        $('pedidoEstado').value =
            pedido?.estado ||
            'pendiente';


        $('pedidoDireccion').value =
            pedido?.direccion || '';


        $('pedidoNotas').value =
            pedido?.notas || '';


        cargarClientesEnSelect(
            pedido?.clienteId || ''
        );


        const contenedor =
            $('productosPedido');


        if (contenedor) {

            contenedor.innerHTML = '';

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


    /* ============================================================
       CERRAR PANEL
    ============================================================ */

    function cerrarPanelPedido() {

        pedidoPanel
            ?.classList
            .remove('is-open');


        pedidoPanel
            ?.setAttribute(
                'aria-hidden',
                'true'
            );


        if (overlay) {

            overlay.hidden = true;

        }

    }


    /* ============================================================
       GUARDAR PEDIDO
    ============================================================ */

    function guardarPedido(
        evento
    ) {

        evento.preventDefault();


        const clienteId =
            $('pedidoCliente')
                ?.value;


        const fecha =
            $('pedidoFecha')
                ?.value;


        const productos =
            obtenerProductosPedido();


        if (!clienteId) {

            toast(
                'Selecciona un cliente para el pedido.',
                'error'
            );

            $('pedidoCliente')
                ?.focus();

            return;

        }


        if (!fecha) {

            toast(
                'Ingresa la fecha del pedido.',
                'error'
            );

            return;

        }


        if (!productos.length) {

            toast(
                'Agrega al menos un producto.',
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
            $('pedidoId')
                ?.value ||
            generarId('PED-');


        const pedidoExistente =
            pedidos.find(
                p =>
                    String(p.id) ===
                    String(id)
            );


        const pedido = {

            id,

            numero:
                $('pedidoNumero')
                    ?.value ||
                numeroPedido(),

            fecha:
                new Date(fecha)
                    .toISOString(),

            clienteId:
                cliente.id,

            clienteNombre:
                cliente.nombre,

            clienteTelefono:
                cliente.telefono || '',

            origen:
                $('pedidoOrigen')
                    ?.value ||
                'Tienda / Autoservicio',

            estado:
                $('pedidoEstado')
                    ?.value ||
                'pendiente',

            productos:
                productos.map(
                    producto => ({

                        nombre:
                            producto.nombre,

                        cantidad:
                            producto.cantidad,

                        precio:
                            producto.precio,

                        subtotal:
                            producto.cantidad *
                            producto.precio

                    })
                ),

            subtotal:
                totales.subtotal,

            descuento:
                totales.descuento,

            porcentajeDescuento:
                totales.porcentaje,

            total:
                totales.total,

            direccion:
                $('pedidoDireccion')
                    ?.value
                    .trim() || '',

            notas:
                $('pedidoNotas')
                    ?.value
                    .trim() || '',

            actualizado:
                new Date()
                    .toISOString()

        };


        if (pedidoExistente) {

            pedidos =
                pedidos.map(
                    p =>
                        String(p.id) ===
                        String(id)
                            ? pedido
                            : p
                );


            toast(
                'Pedido actualizado correctamente.'
            );

        } else {

            pedidos.push(pedido);


            toast(
                'Pedido registrado correctamente.'
            );

        }


        if (
            guardarPedidos()
        ) {

            mostrarPedidos();

            actualizarEstadisticasPedidos();

            cerrarPanelPedido();

        }

    }


    /* ============================================================
       ESTADOS
    ============================================================ */

    function estadoTexto(
        estado
    ) {

        const estados = {

            pendiente:
                'Pendiente',

            preparando:
                'Preparando',

            entregado:
                'Entregado',

            cancelado:
                'Cancelado'

        };


        return estados[estado] ||
            estado ||
            'Pendiente';

    }


    /* ============================================================
       MOSTRAR PEDIDOS
    ============================================================ */

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
            pedidos.filter(
                pedido => {

                    const estadoCorrecto =
                        filtroPedido ===
                        'todos' ||
                        pedido.estado ===
                        filtroPedido;


                    const productos =
                        (
                            pedido.productos ||
                            []
                        )
                            .map(
                                p =>
                                    p.nombre
                            )
                            .join(' ');


                    const contenido =
                        `${pedido.numero || ''}
                         ${pedido.clienteNombre || ''}
                         ${pedido.clienteTelefono || ''}
                         ${pedido.origen || ''}
                         ${productos}`
                            .toLowerCase();


                    return (
                        estadoCorrecto &&
                        (
                            !texto ||
                            contenido.includes(texto)
                        )
                    );

                }
            );


        lista.sort(
            (a, b) =>
                new Date(b.fecha) -
                new Date(a.fecha)
        );


        $('emptyPedidos').hidden =
            lista.length !== 0;


        lista.forEach(
            pedido => {

                const fila =
                    document.createElement(
                        'tr'
                    );


                const productos =
                    (
                        pedido.productos ||
                        []
                    )
                        .map(
                            producto =>
                                `${producto.nombre}
                                ×${producto.cantidad}`
                        )
                        .join(', ');


                const iniciales =
                    obtenerIniciales(
                        pedido.clienteNombre ||
                        'Cliente'
                    );


                fila.innerHTML = `

                    <td>

                        <div class="pedido-info">

                            <div class="pedido-avatar">
                                ${escaparHTML(
                                    iniciales
                                )}
                            </div>

                            <div>

                                <div class="pedido-numero">
                                    ${escaparHTML(
                                        pedido.numero
                                    )}
                                </div>

                                <div class="pedido-subtitulo">
                                    ${escaparHTML(
                                        pedido.origen ||
                                        'Pedido'
                                    )}
                                </div>

                            </div>

                        </div>

                    </td>


                    <td>

                        <strong>
                            ${escaparHTML(
                                pedido.clienteNombre ||
                                'Sin cliente'
                            )}
                        </strong>

                        <div class="pedido-subtitulo">
                            ${escaparHTML(
                                pedido.clienteTelefono ||
                                'Sin teléfono'
                            )}
                        </div>

                    </td>


                    <td>

                        <div class="productos-resumen">
                            ${escaparHTML(
                                productos ||
                                'Sin productos'
                            )}
                        </div>

                    </td>


                    <td>

                        <span class="total-pedido">
                            ${dinero(
                                pedido.total
                            )}
                        </span>

                    </td>


                    <td>

                        ${formatearFechaHora(
                            pedido.fecha
                        )}

                    </td>


                    <td>

                        <span
                            class="estado-pedido estado-${escaparHTML(
                                pedido.estado
                            )}">

                            ${estadoTexto(
                                pedido.estado
                            )}

                        </span>

                    </td>


                    <td>

                        <div class="acciones-pedido">

                            <button
                                type="button"
                                class="btn-accion btn-ver-pedido"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Ver pedido">

                                👁

                            </button>


                            <button
                                type="button"
                                class="btn-accion btn-editar-pedido"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Editar pedido">

                                ✏

                            </button>


                            <button
                                type="button"
                                class="btn-accion btn-eliminar-pedido eliminar"
                                data-id="${escaparHTML(
                                    pedido.id
                                )}"
                                title="Eliminar pedido">

                                🗑

                            </button>

                        </div>

                    </td>

                `;


                tbody.appendChild(fila);

            }
        );


        $('resultadoPedidos')
            .textContent =
            `${lista.length} ${
                lista.length === 1
                    ? 'pedido'
                    : 'pedidos'
            }`;


        $('footerPedidos')
            .textContent =
            `${lista.length} de ${
                pedidos.length
            } pedidos`;

    }


    function obtenerIniciales(
        nombre
    ) {

        const partes =
            String(nombre)
                .trim()
                .split(/\s+/);


        if (!partes.length) {
            return 'CL';
        }


        return (
            partes[0]?.[0] || ''
        ) +
        (
            partes[1]?.[0] || ''
        );

    }


    /* ============================================================
       ESTADÍSTICAS
    ============================================================ */

    function actualizarEstadisticasPedidos() {

        const total =
            pedidos.length;


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


        const ventas =
            pedidos
                .filter(
                    p =>
                        p.estado !==
                        'cancelado'
                )
                .reduce(
                    (
                        suma,
                        pedido
                    ) =>
                        suma +
                        Number(
                            pedido.total ||
                            0
                        ),
                    0
                );


        $('statPedidos')
            .textContent =
            total;


        $('statPedidosPendientes')
            .textContent =
            pendientes;


        $('statPedidosEntregados')
            .textContent =
            entregados;


        $('statVentas')
            .textContent =
            dinero(ventas);


        $('countPedidosTodos')
            .textContent =
            total;


        $('countPedidosPendientes')
            .textContent =
            pendientes;


        $('countPedidosPreparando')
            .textContent =
            preparando;


        $('countPedidosEntregados')
            .textContent =
            entregados;

    }


    /* ============================================================
       DETALLE
    ============================================================ */

    function mostrarDetallePedido(
        pedido
    ) {

        pedidoDetalleActual =
            pedido;


        $('detallePedidoNumero')
            .textContent =
            pedido.numero ||
            'Pedido';


        $('detallePedidoEstado')
            .textContent =
            estadoTexto(
                pedido.estado
            );


        $('detallePedidoEstado')
            .className =
            `detail-badge estado-${
                pedido.estado
            }`;


        $('detallePedidoCliente')
            .textContent =
            pedido.clienteNombre ||
            '—';


        $('detallePedidoTelefono')
            .textContent =
            pedido.clienteTelefono ||
            '—';


        $('detallePedidoFecha')
            .textContent =
            formatearFechaHora(
                pedido.fecha
            );


        $('detallePedidoOrigen')
            .textContent =
            pedido.origen ||
            '—';


        $('detallePedidoDireccion')
            .textContent =
            pedido.direccion ||
            'No especificada';


        $('detallePedidoTotal')
            .textContent =
            dinero(pedido.total);


        $('detallePedidoNotas')
            .textContent =
            pedido.notas ||
            'Sin notas registradas.';


        const contenedor =
            $('detallePedidoProductos');


        contenedor.innerHTML = '';


        (
            pedido.productos ||
            []
        )
            .forEach(
                producto => {

                    const item =
                        document.createElement(
                            'div'
                        );


                    item.className =
                        'detalle-producto';


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


                    contenedor.appendChild(
                        item
                    );

                }
            );


        $('dialogPedidoDetalle')
            ?.showModal();

    }


    /* ============================================================
       ELIMINAR
    ============================================================ */

    function eliminarPedido(
        pedido
    ) {

        if (!pedido) {
            return;
        }


        const confirmar =
            confirm(
                `¿Deseas eliminar el pedido ${pedido.numero}?`
            );


        if (!confirmar) {
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


    /* ============================================================
       WHATSAPP
    ============================================================ */

    on(
        'btnWhatsAppPedido',
        'click',
        () => {

            if (
                !pedidoDetalleActual ||
                !pedidoDetalleActual.clienteTelefono
            ) {

                toast(
                    'El cliente no tiene teléfono registrado.',
                    'error'
                );

                return;

            }


            const pedido =
                pedidoDetalleActual;


            let telefono =
                String(
                    pedido.clienteTelefono
                )
                    .replace(/\D/g, '');


            if (
                telefono.length === 8
            ) {

                telefono =
                    '502' +
                    telefono;

            }


            let mensaje =
                `Hola ${
                    pedido.clienteNombre ||
                    ''
                },%0A%0A`;


            mensaje +=
                `Detalle del pedido ${
                    pedido.numero
                }:%0A%0A`;


            (
                pedido.productos ||
                []
            )
                .forEach(
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
                            }%0A`;

                    }
                );


            mensaje +=
                `%0ATotal: ${
                    dinero(
                        pedido.total
                    )
                }`;


            window.open(
                `https://wa.me/${telefono}?text=${mensaje}`,
                '_blank'
            );

        }
    );


    /* ============================================================
       NAVEGACIÓN
    ============================================================ */

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


    /* ============================================================
       BOTONES
    ============================================================ */

    on(
        'btnNuevo',
        'click',
        () => abrirPanelPedido()
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
        'btnFloating',
        'click',
        () => abrirPanelPedido()
    );


    on(
        'overlay',
        'click',
        cerrarPanelPedido
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
        'btnAgregarProducto',
        'click',
        () =>
            agregarFilaProducto()
    );


    on(
        'pedidoForm',
        'submit',
        guardarPedido
    );


    on(
        'pedidoCliente',
        'change',
        calcularTotalesPedido
    );


    /* ============================================================
       ACCIONES TABLA
    ============================================================ */

    on(
        'pedidosBody',
        'click',
        evento => {

            const boton =
                evento.target.closest(
                    'button[data-id]'
                );


            if (!boton) {
                return;
            }


            const pedido =
                pedidos.find(
                    p =>
                        String(p.id) ===
                        String(
                            boton.dataset.id
                        )
                );


            if (!pedido) {
                return;
            }


            if (
                boton.classList.contains(
                    'btn-ver-pedido'
                )
            ) {

                mostrarDetallePedido(
                    pedido
                );

            }


            if (
                boton.classList.contains(
                    'btn-editar-pedido'
                )
            ) {

                abrirPanelPedido(
                    pedido
                );

            }


            if (
                boton.classList.contains(
                    'btn-eliminar-pedido'
                )
            ) {

                eliminarPedido(
                    pedido
                );

            }

        }
    );


    /* ============================================================
       BUSCADOR
    ============================================================ */

    on(
        'searchPedidos',
        'input',
        () => {

            const campo =
                $('searchPedidos');


            if (
                campo.value.trim()
            ) {

                $('btnLimpiarPedidos')
                    ?.classList
                    .add('visible');

            } else {

                $('btnLimpiarPedidos')
                    ?.classList
                    .remove('visible');

            }


            mostrarPedidos();

        }
    );


    on(
        'btnLimpiarPedidos',
        'click',
        () => {

            $('searchPedidos')
                .value = '';


            filtroPedido =
                'todos';


            document
                .querySelectorAll(
                    '.filter-button[data-estado]'
                )
                .forEach(
                    boton =>
                        boton.classList
                            .remove('active')
                );


            document
                .querySelector(
                    '.filter-button[data-estado="todos"]'
                )
                ?.classList
                .add('active');


            $('btnLimpiarPedidos')
                ?.classList
                .remove('visible');


            mostrarPedidos();

        }
    );


    /* ============================================================
       FILTROS
    ============================================================ */

    document
        .querySelectorAll(
            '.filter-button[data-estado]'
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    'click',
                    () => {

                        filtroPedido =
                            boton.dataset.estado ||
                            'todos';


                        document
                            .querySelectorAll(
                                '.filter-button[data-estado]'
                            )
                            .forEach(
                                b =>
                                    b.classList
                                        .remove(
                                            'active'
                                        )
                            );


                        boton
                            .classList
                            .add('active');


                        mostrarPedidos();

                    }
                );

            }
        );


    /* ============================================================
       DETALLE
    ============================================================ */

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

            if (!pedidoDetalleActual) {
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

            if (!pedidoDetalleActual) {
                return;
            }


            $('dialogPedidoDetalle')
                ?.close();


            eliminarPedido(
                pedidoDetalleActual
            );

        }
    );


    /* ============================================================
       EXPORTAR
    ============================================================ */

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


        const enlace =
            document.createElement(
                'a'
            );


        enlace.href = url;

        enlace.download = nombre;


        document.body.appendChild(
            enlace
        );


        enlace.click();

        enlace.remove();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );

    }


    function exportarPedidos() {

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


    on(
        'btnExportarPedidos',
        'click',
        exportarPedidos
    );


    on(
        'btnExportarNav',
        'click',
        exportarPedidos
    );


    /* ============================================================
       TEMA
    ============================================================ */

    function aplicarTema() {

        const tema =
            localStorage.getItem(
                STORAGE_TEMA
            );


        const oscuro =
            tema === 'dark' ||
            tema === 'oscuro';


        document.body
            .classList
            .toggle(
                'dark',
                oscuro
            );


        const icono =
            oscuro
                ? '☀'
                : '☾';


        if ($('themeIcon')) {

            $('themeIcon')
                .textContent =
                icono;

        }


        if ($('btnTemaDesktop')) {

            $('btnTemaDesktop')
                .textContent =
                icono;

        }


        if ($('themeText')) {

            $('themeText')
                .textContent =
                oscuro
                    ? 'Modo claro'
                    : 'Modo oscuro';

        }

    }


    function cambiarTema() {

        const oscuro =
            !document.body
                .classList
                .contains('dark');


        document.body
            .classList
            .toggle(
                'dark',
                oscuro
            );


        localStorage.setItem(
            STORAGE_TEMA,
            oscuro
                ? 'dark'
                : 'light'
        );


        aplicarTema();

    }


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
                ?.classList
                .toggle('open')
    );


    /* ============================================================
       ACTUALIZACIÓN ENTRE PESTAÑAS
    ============================================================ */

    window.addEventListener(
        'storage',
        evento => {

            if (
                evento.key ===
                STORAGE_PEDIDOS
            ) {

                pedidos =
                    cargarPedidos();


                mostrarPedidos();

                actualizarEstadisticasPedidos();

            }


            if (
                evento.key ===
                STORAGE_CLIENTES
            ) {

                clientes =
                    cargarClientes();


                cargarClientesEnSelect();

            }


            if (
                evento.key ===
                STORAGE_TEMA
            ) {

                aplicarTema();

            }

        }
    );


    /* ============================================================
       TECLADO
    ============================================================ */

    document.addEventListener(
        'keydown',
        evento => {

            if (
                evento.key ===
                'Escape'
            ) {

                if (
                    pedidoPanel
                        ?.classList
                        .contains(
                            'is-open'
                        )
                ) {

                    cerrarPanelPedido();

                }


                if (
                    $('dialogPedidoDetalle')
                        ?.open
                ) {

                    $('dialogPedidoDetalle')
                        .close();

                }

            }


            if (
                evento.ctrlKey &&
                evento.key.toLowerCase() ===
                'n'
            ) {

                evento.preventDefault();

                abrirPanelPedido();

            }


            if (
                evento.ctrlKey &&
                evento.key.toLowerCase() ===
                'k'
            ) {

                evento.preventDefault();

                $('searchPedidos')
                    ?.focus();

            }

        }
    );


    /* ============================================================
       INICIO
    ============================================================ */

    aplicarTema();

    cargarClientesEnSelect();

    mostrarPedidos();

    actualizarEstadisticasPedidos();

});