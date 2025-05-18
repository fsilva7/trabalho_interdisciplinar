<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id'])) {
        throw new Exception('ID do agendamento não fornecido');
    }

    $id = $data['id'];
    
    $conn->beginTransaction();

    // Primeiro, obter o cliente_id do agendamento
    $stmt = $conn->prepare("SELECT cliente_id FROM agendamentos WHERE id = ?");
    $stmt->execute([$id]);
    $cliente_id = $stmt->fetchColumn();

    if (!$cliente_id) {
        throw new Exception('Agendamento não encontrado');
    }

    // Deletar o agendamento
    $stmt = $conn->prepare("DELETE FROM agendamentos WHERE id = ?");
    $stmt->execute([$id]);

    // Deletar o cliente se não tiver outros agendamentos
    $stmt = $conn->prepare("SELECT COUNT(*) FROM agendamentos WHERE cliente_id = ?");
    $stmt->execute([$cliente_id]);
    $count = $stmt->fetchColumn();

    if ($count == 0) {
        $stmt = $conn->prepare("DELETE FROM clientes WHERE id = ?");
        $stmt->execute([$cliente_id]);
    }

    $conn->commit();
    
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn = null;
