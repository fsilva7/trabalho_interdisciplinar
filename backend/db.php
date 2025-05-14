<?php
$host = 'localhost';
$db = 'sistema_agendamentos';
$user = 'postgres';
$pass = 'postgres';
$port = '5432';
$dsn = "pgsql:host=$host;port=$port;dbname=$db";

try {
    $conn = new PDO($dsn, $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Erro de conexão com o banco de dados: ' . $e->getMessage()]);
    exit;
}
