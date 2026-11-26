<?php
// api/auth.php: GET dice si hay sesión, POST entra y DELETE cierra
// La clave se compara con el hash guardado en usuarios_admin

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/conexion.php';

session_start();

function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtiene la conexión activa a postgres y el método http de la petición
$conexion = Conexion::conexionDB();
$metodo = $_SERVER['REQUEST_METHOD'];

try {
    switch ($metodo) {
        
        // Consulta si ya hay una sesión iniciada
        case 'GET':
            $autenticado = isset($_SESSION['id_admin']);

            //Responde si hay sesion iniciada con los datos del usurio, o null si no lo está
            responder([
                'autenticado' => $autenticado,
                'usuario' => $autenticado ? [
                    'usuario' => $_SESSION['usuario'],
                    'nombre_completo' => $_SESSION['nombre_completo']
                ] : null
            ]);
        
        // Procesa el login de un administrador
        case 'POST':
            // Lee los datos json de la petición y lo convierte en un array asociativo de php
            $datos = json_decode(file_get_contents('php://input'), true);
            
            //Verifica que ambos campos existan
            if (!isset($datos['usuario'], $datos['clave'])) {
                responder(['ok' => false, 'error' => 'Faltan campos obligatorios'], 400);
            }

            $stmt = $conexion->prepare(
                "SELECT id, usuario, clave, nombre_completo
                 FROM usuarios_admin
                 WHERE usuario = :usuario"
            );
            $stmt->execute([':usuario' => $datos['usuario']]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);

            // password_verify revisa la clave contra el hash de la BD
            if (!$admin || !password_verify($datos['clave'], $admin['clave'])) {
                responder(['ok' => false, 'error' => 'Usuario o contraseña incorrectos'], 401);
            }

            // Con esto queda iniciada la sesión
            $_SESSION['id_admin'] = (int)$admin['id'];
            $_SESSION['usuario'] = $admin['usuario'];
            $_SESSION['nombre_completo'] = $admin['nombre_completo'];

            responder([
                'ok' => true,
                'usuario' => [
                    'usuario' => $admin['usuario'],
                    'nombre_completo' => $admin['nombre_completo']
                ]
            ]);
        
        // Cierra la sesión
        case 'DELETE':
            session_destroy();
            responder(['ok' => true]);

        default:
            responder(['ok' => false, 'error' => "Método $metodo no permitido"], 405);
    }

} catch (PDOException $exp) {
    responder(['ok' => false, 'error' => 'Error en la base de datos: ' . $exp->getMessage()], 500);
}
