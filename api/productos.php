<?php
// api/productos.php: GET lista, POST crea, PUT edita (?id=) y DELETE borra
// GET es público para la tienda; las demás acciones piden sesión de admin

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/conexion.php';

// Igual que el DEFAULT de la tabla, por si no llega URL de imagen
define('IMAGEN_DEFAULT', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400');

function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

$conexion = Conexion::conexionDB();
$metodo = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// Para GET no se requiere sesión, pero para POST, PUT y DELETE sí
if ($metodo !== 'GET') {
    session_start();
    if (!isset($_SESSION['id_admin'])) {
        responder(['ok' => false, 'error' => 'No autorizado: inicia sesión como administrador'], 401);
    }
}

try {
    switch ($metodo) {

        case 'GET':
            // Crea la consulta SQL obteniendo los datos de los productos y calculando los días para vencer
            // vigentes=1 se usa en la tienda para no mostrar vencidos
            $sql = "SELECT id, nombre, categoria, lote, precio::float8 AS precio, stock,
                           fecha_vencimiento, imagen_url,
                           (fecha_vencimiento - CURRENT_DATE) AS dias_para_vencer
                    FROM productos";
            if (isset($_GET['vigentes'])) {
                $sql .= " WHERE fecha_vencimiento >= CURRENT_DATE";
            }
            $sql .= " ORDER BY fecha_vencimiento ASC";

            // Ejecuta la consulta y obtiene los resultados
            $stmt = $conexion->query($sql);
            $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Recorre los productos y convierte los campos numericos de texto a entero o flotante para que js los reciba correctamente
            foreach ($productos as &$p) {
                $p['id'] = (int)$p['id'];
                $p['precio'] = (float)$p['precio'];
                $p['stock'] = (int)$p['stock'];
                $p['dias_para_vencer'] = (int)$p['dias_para_vencer'];
            }

            responder($productos);

        case 'POST':
            $datos = json_decode(file_get_contents('php://input'), true);

            // Verifica que todos los campos obligatorios estén presentes
            if (!isset($datos['nombre'], $datos['categoria'], $datos['lote'], $datos['precio'], $datos['stock'], $datos['fecha_vencimiento'])) {
                responder(['ok' => false, 'error' => 'Faltan campos obligatorios'], 400);
            }

            // Inserta el nuevo producto en la base de datos
            $stmt = $conexion->prepare(
                "INSERT INTO productos (nombre, categoria, lote, precio, stock, fecha_vencimiento, imagen_url)
                 VALUES (:nombre, :categoria, :lote, :precio, :stock, :fecha_vencimiento, :imagen_url)"
            );
            $stmt->execute([
                ':nombre'            => $datos['nombre'],
                ':categoria'         => $datos['categoria'],
                ':lote'              => $datos['lote'],
                ':precio'            => $datos['precio'],
                ':stock'             => $datos['stock'],
                ':fecha_vencimiento' => $datos['fecha_vencimiento'],
                ':imagen_url'        => !empty($datos['imagen_url']) ? $datos['imagen_url'] : IMAGEN_DEFAULT
            ]);

            responder(['ok' => true, 'id' => (int)$conexion->lastInsertId('productos_id_seq')], 201);

        case 'PUT':
            // Verifica que se haya proporcionado un id para actualizar
            if (!$id) {
                responder(['ok' => false, 'error' => 'Falta el parámetro id'], 400);
            }

            // Verifica que el producto exista antes de intentar actualizarlo
            $stmt = $conexion->prepare("SELECT 1 FROM productos WHERE id = :id");
            $stmt->execute([':id' => $id]);
            if (!$stmt->fetchColumn()) {
                responder(['ok' => false, 'error' => 'Producto no encontrado'], 404);
            }

            $datos = json_decode(file_get_contents('php://input'), true);

            // Verifica que todos los campos obligatorios estén presentes
            if (!isset($datos['nombre'], $datos['categoria'], $datos['lote'], $datos['precio'], $datos['stock'], $datos['fecha_vencimiento'])) {
                responder(['ok' => false, 'error' => 'Faltan campos obligatorios'], 400);
            }

            // Actualiza el producto en la base de datos
            $stmt = $conexion->prepare(
                "UPDATE productos
                 SET nombre = :nombre, categoria = :categoria, lote = :lote,
                     precio = :precio, stock = :stock,
                     fecha_vencimiento = :fecha_vencimiento, imagen_url = :imagen_url
                 WHERE id = :id"
            );
            $stmt->execute([
                ':nombre'            => $datos['nombre'],
                ':categoria'         => $datos['categoria'],
                ':lote'              => $datos['lote'],
                ':precio'            => $datos['precio'],
                ':stock'             => $datos['stock'],
                ':fecha_vencimiento' => $datos['fecha_vencimiento'],
                ':imagen_url'        => !empty($datos['imagen_url']) ? $datos['imagen_url'] : IMAGEN_DEFAULT,
                ':id'                => $id
            ]);

            responder(['ok' => true]);

        case 'DELETE':
            if (!$id) {
                responder(['ok' => false, 'error' => 'Falta el parámetro id'], 400);
            }

            // Verifica que el producto exista antes de intentar borrarlo
            $stmt = $conexion->prepare("SELECT 1 FROM productos WHERE id = :id");
            $stmt->execute([':id' => $id]);
            if (!$stmt->fetchColumn()) {
                responder(['ok' => false, 'error' => 'Producto no encontrado'], 404);
            }

            // Borra el producto de la base de datos
            $stmt = $conexion->prepare("DELETE FROM productos WHERE id = :id");
            $stmt->execute([':id' => $id]);

            responder(['ok' => true]);

        default:
            responder(['ok' => false, 'error' => "Método $metodo no permitido"], 405);
    }

} catch (PDOException $exp) {
    responder(['ok' => false, 'error' => 'Error en la base de datos: ' . $exp->getMessage()], 500);
}
