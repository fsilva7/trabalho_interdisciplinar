<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id']) || !isset($data['status'])) {
        throw new Exception('Dados incompletos');
    }
    $id = $data['id'];
    $status = $data['status'];
    $observacoes = isset($data['observacoes']) ? $data['observacoes'] : null;
    $stmt = $conn->prepare('UPDATE appointments SET status = ?, observacoes = ?, ultima_atualizacao = NOW() WHERE id = ?');
    $stmt->execute([$status, $observacoes, $id]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn = null;
