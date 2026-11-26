// Login: manda usuario y clave a api/auth.php, que maneja la sesión PHP

// Guarda referencias a los elementos del DOM que se usarán
const formLogin = document.getElementById('form-login');
const inputUsuario = document.getElementById('usuario');
const inputClave = document.getElementById('clave');
const mensajeError = document.getElementById('mensaje-error');
const btnIngresar = document.getElementById('btn-ingresar');

function mostrarError(texto) {
    mensajeError.textContent = texto;
    mensajeError.style.display = 'block';
}

// Verifica si ya hay una sesión activa al cargar la página
async function verificarSesionActual() {
    try {
        const respuesta = await fetch('api/auth.php');
        if (!respuesta.ok) return;

        const sesion = await respuesta.json();
        if (sesion.autenticado) {
            location.replace('admin.html');
        }
    } catch (error) {
        // Si no se puede consultar la sesión, simplemente se muestra el login
    }
}

// 
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = inputUsuario.value.trim();
    const clave = inputClave.value;

    // El botón se bloquea mientras espera la respuesta
    btnIngresar.disabled = true;
    btnIngresar.textContent = 'Verificando...';
    mensajeError.style.display = 'none';

    // Envía los datos al servidor para verificar las credenciales
    try {
        // Envía una solicitud POST a api/auth.php con usuario y clave
        const respuesta = await fetch('api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, clave })
        });

        // Si la respuesta no es OK, lanza un error
        const datos = await respuesta.json();
        if (!respuesta.ok || !datos.ok) {
            throw new Error(datos.error || `HTTP ${respuesta.status}`);
        }

        location.replace('admin.html');
    } catch (error) {
        mostrarError(`❌ ${error.message}`);
        btnIngresar.disabled = false;
        btnIngresar.textContent = '🔑 Ingresar';
    }
});

verificarSesionActual();
