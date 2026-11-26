// Catálogo de la tienda: los datos vienen de api/productos.php

let productos = [];

const contenedorCatalogo = document.getElementById('catalogo-cliente');
const inputBuscador = document.getElementById('buscador');
const selectCategoria = document.getElementById('filtro-categoria');
const contadorProductos = document.getElementById('contador-productos');

const EMOJIS_CATEGORIA = {
    'Lácteos': '🥛',
    'Cárnicos': '🥩',
    'Frutas y Verduras': '🍎',
    'Panadería': '🥐'
};

// Foto de respaldo si la URL del producto no carga
const IMAGEN_RESPALDO = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80';

// Formatea un número como moneda colombiana
const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(valor);
};

function renderizarProductos(productos) {
    contenedorCatalogo.innerHTML = '';

    // Si no hay productos que mostrar, se muestra un mensaje
    if (productos.length === 0) {
        contenedorCatalogo.innerHTML = `
            <div class="estado-vacio">
                <h2>😕 No encontramos productos</h2>
                <p>Intenta con otros términos de búsqueda o selecciona otra categoría.</p>
            </div>
        `;
        return;
    }

    // Recorre los productos y crea una tarjeta para cada uno
    productos.forEach(p => {
        let badgeClase = 'badge-fresco';
        let textoEstado = `Fresco (${p.dias_para_vencer} días)`;

        // Si le quedan 3 días o menos, hay que consumirlo pronto
        if (p.dias_para_vencer <= 3) {
            badgeClase = 'badge-alerta';
            textoEstado = `¡Consumo rápido! (${p.dias_para_vencer} días)`;
        }

        // Si ya está vencido, se marca como tal
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta-producto';
        
        // Se usa innerHTML para crear la estructura de la tarjeta con los datos del producto
        tarjeta.innerHTML = `
            <div class="badge-contenedor">
                <span class="badge ${badgeClase}">${textoEstado}</span>
            </div>
            <div class="tarjeta-img-contenedor">
                <img src="${p.imagen_url}" alt="${p.nombre}" loading="lazy"
                     onerror="this.onerror=null;this.src='${IMAGEN_RESPALDO}'">
            </div>
            <div class="tarjeta-cuerpo">
                <div>
                    <span class="categoria-label">${EMOJIS_CATEGORIA[p.categoria] || '🧺'} ${p.categoria}</span>
                    <h3 class="tarjeta-titulo">${p.nombre}</h3>
                    <div class="tarjeta-detalles">
                        Lote: <strong>${p.lote}</strong><br>
                        Vence: ${p.fecha_vencimiento}
                    </div>
                </div>
                <div class="precio-contenedor">
                    <span class="precio">${formatoMoneda(p.precio)}</span>
                    <span class="stock">${p.stock} und.</span>
                </div>
            </div>
        `;

        contenedorCatalogo.appendChild(tarjeta);
    });
}

function filtrarCatalogo() {
    // Minúsculas para que la búsqueda no sea sensible a mayúsculas
    const textoBusqueda = inputBuscador.value.toLowerCase().trim();
    const categoriaSeleccionada = selectCategoria.value;

    // Filtra los productos según el texto de búsqueda y la categoría seleccionada
    const productosFiltrados = productos.filter(p => {
        const coincideNombre = p.nombre.toLowerCase().includes(textoBusqueda);
        const coincideCategoria = (categoriaSeleccionada === 'Todas') || (p.categoria === categoriaSeleccionada);
        
        return coincideNombre && coincideCategoria;
    });

    renderizarProductos(productosFiltrados);
    contadorProductos.textContent = `Mostrando ${productosFiltrados.length} de ${productos.length} productos`;
}

async function cargarProductos() {
    try {
        // El parámetro vigentes=1 hace que PHP no envíe los vencidos
        const respuesta = await fetch('api/productos.php?vigentes=1');
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        productos = await respuesta.json();
        renderizarProductos(productos);
        contadorProductos.textContent = `🥦 ${productos.length} productos frescos disponibles`;
    } catch (error) {

        // Si se abre el HTML directamente desde el sistema de archivos, se muestra un mensaje especial
        const abiertoComoArchivo = location.protocol === 'file:';

        contenedorCatalogo.innerHTML = `
            <div class="estado-vacio">
                <h2>⚠️ No se pudo cargar el catálogo</h2>
                ${abiertoComoArchivo
                    ? `<p>Estás abriendo el archivo HTML directamente.<br>Debes abrirlo con Apache:<br><strong>http://localhost/tienda_perecederos/index.html</strong></p>`
                    : `<p>${error.message}. Verifica que el servidor y la base de datos estén activos.</p>`}
            </div>
        `;
    }
}

inputBuscador.addEventListener('input', filtrarCatalogo);
selectCategoria.addEventListener('change', filtrarCatalogo);
document.addEventListener('DOMContentLoaded', cargarProductos);
