<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['id']) && isset($data['status'])) {
        $id = $data['id'];
        $status = $data['status'];
        
        $sql = "UPDATE appointments SET status = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        if ($stmt->execute([$status, $id])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao atualizar o status']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}

$conn = null;
