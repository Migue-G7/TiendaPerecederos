// Panel CRUD: el front llama a api/productos.php y PHP hace lo que toque en PostgreSQL

let inventario = [];

const tablaAdmin = document.getElementById('tabla-admin');
const formProducto = document.getElementById('form-producto');
const tituloForm = document.getElementById('titulo-form');
const btnCancelar = document.getElementById('btn-cancelar');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const inputImagen = document.getElementById('imagen_url');
const vistaPrevia = document.getElementById('vista-previa');
const vistaPreviaImg = document.getElementById('vista-previa-img');

// Foto de respaldo si la URL no carga
const IMAGEN_RESPALDO = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80';

const formatoMoneda = (valor) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);

// Días hasta el vencimiento; se ajusta la hora para no contar de más
function calcularDiasRestantes(fechaVencimientoStr) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaVenc = new Date(fechaVencimientoStr + 'T00:00:00');
    fechaVenc.setHours(0, 0, 0, 0);

    const diferenciaMs = fechaVenc.getTime() - hoy.getTime();
    return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
}

// Recorre el inventario y actualiza los contadores de productos vigentes, por vencer, vencidos y agotados
function actualizarEstadisticas() {
    let vigentes = 0, porVencer = 0, vencidos = 0, agotados = 0;

    inventario.forEach(p => {
        const dias = calcularDiasRestantes(p.fecha_vencimiento);
        // Agotado se cuenta primero para no duplicar el producto
        if (p.stock <= 0) {
            agotados++;
        } else if (dias < 0) {
            vencidos++;
        } else if (dias <= 3) {
            porVencer++;
        } else {
            vigentes++;
        }
    });

    document.getElementById('stat-total').textContent = inventario.length;
    document.getElementById('stat-vigentes').textContent = vigentes;
    document.getElementById('stat-por-vencer').textContent = porVencer;
    document.getElementById('stat-vencidos').textContent = vencidos;
    document.getElementById('stat-agotados').textContent = agotados;
}

async function cargarInventario() {
    try {
        const respuesta = await fetch('api/productos.php');
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        inventario = await respuesta.json();
        renderizarTabla();
    } catch (error) {
        // Si se abre el HTML directamente desde el sistema de archivos, se muestra un mensaje especial
        const abiertoComoArchivo = location.protocol === 'file:';

        tablaAdmin.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--peligro);">
            ${abiertoComoArchivo
                ? '⚠️ Estás abriendo el archivo HTML directamente.<br>Debes abrirlo con Apache:<br><strong>http://localhost/tienda_perecederos/admin.html</strong>'
                : `⚠️ No se pudo cargar el inventario (${error.message}). Verifica el servidor y la base de datos.`}
        </td></tr>`;
    }
}

// Renderiza la tabla de productos en el panel de administración
function renderizarTabla() {
    tablaAdmin.innerHTML = '';

    if (inventario.length === 0) {
        tablaAdmin.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No hay productos registrados en el inventario.</td></tr>`;
        return;
    }

    // Los que vencen antes se muestran arriba
    const inventarioOrdenado = [...inventario].sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

    // Recorre los productos ordenados y crea una fila para cada uno
    inventarioOrdenado.forEach(p => {
        const dias = calcularDiasRestantes(p.fecha_vencimiento);
        
        let badge = '';
        if (p.stock <= 0) {
            badge = `<span class="badge badge-agotado">Agotado</span>`;
        } else if (dias < 0) {
            badge = `<span class="badge badge-vencido">Vencido (${Math.abs(dias)}d)</span>`;
        } else if (dias <= 3) {
            badge = `<span class="badge badge-alerta">Por vencer (${dias}d)</span>`;
        } else {
            badge = `<span class="badge badge-fresco">Vigente (${dias}d)</span>`;
        }

        const imgUrl = p.imagen_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80';

        // Crea una fila de tabla con los datos del producto y la imagen
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center;">
                    <img src="${imgUrl}" class="img-miniatura" alt="${p.nombre}"
                         onerror="this.onerror=null;this.src='${IMAGEN_RESPALDO}'">
                    <strong>${p.nombre}</strong>
                </div>
            </td>
            <td>${p.categoria}<br><small style="color:#666;">Lote: ${p.lote}</small></td>
            <td style="font-weight:600; color:var(--verde-primario);">${formatoMoneda(p.precio)}</td>
            <td>${p.stock > 0 ? p.stock : '<strong style="color:var(--peligro)">0</strong>'}</td>
            <td>${p.fecha_vencimiento}</td>
            <td>${badge}</td>
            <td>
                <button class="btn btn-accion btn-editar" onclick="prepararEdicion(${p.id})">✏️</button>
                <button class="btn btn-accion btn-peligro" onclick="eliminarProducto(${p.id})">🗑️</button>
            </td>
        `;
        tablaAdmin.appendChild(tr);
    });

    actualizarEstadisticas();
}

// Muestra la vista previa de la imagen cuando se escribe la URL en el formulario
function actualizarVistaPrevia() {
    const url = inputImagen.value.trim();

    if (!url) {
        vistaPrevia.classList.remove('mostrar');
        vistaPreviaImg.removeAttribute('src');
        return;
    }

    vistaPreviaImg.src = url;
    vistaPrevia.classList.add('mostrar');
}

vistaPreviaImg.addEventListener('error', () => {
    // Si la foto nueva falla, se cae a la de respaldo (una sola vez)
    if (inputImagen.value.trim() && !vistaPreviaImg.dataset.fallback) {
        vistaPreviaImg.dataset.fallback = '1';
        vistaPreviaImg.src = IMAGEN_RESPALDO;
    }
});

inputImagen.addEventListener('input', () => {
    delete vistaPreviaImg.dataset.fallback;
    actualizarVistaPrevia();
});

// Maneja el envío del formulario para crear o editar un producto
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtiene el id del producto si se está editando; si no, es un nuevo producto
    const idField = document.getElementById('producto-id').value;
    const productoNuevo = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        lote: document.getElementById('lote').value,
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        fecha_vencimiento: document.getElementById('fecha_vencimiento').value,
        imagen_url: inputImagen.value
    };

    try {
        const esEdicion = Boolean(idField);
        // Al editar, el id va en la URL y el método es PUT
        const respuesta = await fetch(
            esEdicion ? `api/productos.php?id=${idField}` : 'api/productos.php',
            {
                method: esEdicion ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productoNuevo)
            }
        );

        const datos = await respuesta.json();
        if (!respuesta.ok || !datos.ok) {
            throw new Error(datos.error || `HTTP ${respuesta.status}`);
        }

        // Si se guarda correctamente, se limpia el formulario y se recarga el inventario
        resetearFormulario();
        await cargarInventario();
    } catch (error) {
        alert(`❌ No se pudo guardar el producto: ${error.message}`);
    }
});

// Prepara el formulario para editar un producto existente
window.prepararEdicion = (id) => {
    const producto = inventario.find(p => p.id === id);
    if (!producto) return;

    document.getElementById('producto-id').value = producto.id;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('categoria').value = producto.categoria;
    document.getElementById('lote').value = producto.lote;
    document.getElementById('precio').value = producto.precio;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('fecha_vencimiento').value = producto.fecha_vencimiento;
    inputImagen.value = producto.imagen_url || '';

    tituloForm.textContent = `✏️ Editando: ${producto.nombre}`;
    btnCancelar.style.display = 'block';

    delete vistaPreviaImg.dataset.fallback;
    actualizarVistaPrevia();
    vistaPrevia.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Elimina un producto del inventario después de confirmar con el usuario
window.eliminarProducto = async (id) => {
    const producto = inventario.find(p => p.id === id);
    if (!producto) return;

    if (confirm(`⚠️ ¿Estás seguro de que deseas eliminar permanentemente el producto:\n"${producto.nombre}" (Lote: ${producto.lote})?`)) {
        try {
            const respuesta = await fetch(`api/productos.php?id=${id}`, { method: 'DELETE' });
            const datos = await respuesta.json();
            if (!respuesta.ok || !datos.ok) {
                throw new Error(datos.error || `HTTP ${respuesta.status}`);
            }

            // Si se borra el producto que se estaba editando, se limpia el form
            if(document.getElementById('producto-id').value == id) {
                resetearFormulario();
            }
            await cargarInventario();
        } catch (error) {
            alert(`❌ No se pudo eliminar el producto: ${error.message}`);
        }
    }
};

// Resetea el formulario a su estado inicial para registrar un nuevo producto
function resetearFormulario() {
    formProducto.reset();
    document.getElementById('producto-id').value = '';
    tituloForm.textContent = '➕ Registrar Producto';
    btnCancelar.style.display = 'none';
    actualizarVistaPrevia();
}

btnCancelar.addEventListener('click', resetearFormulario);


// Verifica si el usuario está autenticado; si no, lo redirige al login
async function verificarAutenticacion() {
    try {
        const respuesta = await fetch('api/auth.php');
        const sesion = await respuesta.json();

        if (!sesion.autenticado) {
            location.replace('login.html');
            return false;
        }

        document.getElementById('nombre-admin').textContent = `👤 ${sesion.usuario.nombre_completo}`;
    } catch (error) {
        location.replace('login.html');
        return false;
    }
    return true;
}

async function cerrarSesion() {
    try {
        await fetch('api/auth.php', { method: 'DELETE' });
    } catch (error) {
        // Aunque falle el logout, se devuelve al login
    }
    location.replace('login.html');
}

btnCerrarSesion.addEventListener('click', cerrarSesion);

document.addEventListener('DOMContentLoaded', async () => {
    if (await verificarAutenticacion()) {
        cargarInventario();
    }
});
