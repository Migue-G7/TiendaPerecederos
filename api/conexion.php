<?php

class Conexion{
    //Funcion publica para establecer la conexion a la base de datos
    public static function conexionDB(){
        //Se almacenan los parametors de conexion a la base de datos
        $host = "localhost";
        $username = "postgres";
        $pasword = "2717miguel";
        $dbname = "tienda_perecederos";

        try{
            $conn = new PDO("pgsql:host=$host;dbname=$dbname", $username, $pasword);
            // Así los errores llegan al catch y la API responde JSON
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
        catch(PDOException $exp){
            // En JSON para no mezclar texto con la respuesta de la API
            http_response_code(500);
            echo json_encode(["ok" => false, "error" => "No se pudo conectar a la base de datos: " . $exp->getMessage()]);
            exit;
        }  
        
        return $conn;
    }   
}
?>