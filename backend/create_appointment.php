<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Dados inválidos');
    }

    $nome = $data['nome'];
    $telefone = $data['telefone'];
    $data_agendamento = $data['data'];
    $hora = $data['hora'];
    $servico = $data['servico'];
    $status = $data['status'];

    $conn->beginTransaction();

    // Inserir cliente
    $stmt = $conn->prepare("INSERT INTO clientes (nome, telefone) VALUES (?, ?)");
    $stmt->execute([$nome, $telefone]);
    $cliente_id = $conn->lastInsertId();

    // Inserir agendamento
    $stmt = $conn->prepare("INSERT INTO agendamentos (cliente_id, data, hora, servico, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$cliente_id, $data_agendamento, $hora, $servico, $status]);

    $conn->commit();
    
    echo json_encode(['success' => true, 'message' => 'Agendamento criado com sucesso']);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn = null;
?>