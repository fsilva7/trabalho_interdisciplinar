<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    // Tenta executar uma query simples
    $result = $conn->query("SELECT current_timestamp");
    $timestamp = $result->fetchColumn();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Conexão com banco de dados OK',
        'timestamp' => $timestamp,
        'php_version' => PHP_VERSION,
        'pdo_drivers' => PDO::getAvailableDrivers()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
