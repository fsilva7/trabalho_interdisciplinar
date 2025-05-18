<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['nome'], $data['telefone'], $data['data'], $data['hora'], $data['services'], $data['totalPrice'], $data['totalDuration'], $data['sector'])) {
        throw new Exception('Dados incompletos');
    }

    // Start transaction
    $conn->beginTransaction();

    // Insert appointment
    $stmt = $conn->prepare('INSERT INTO appointments (nome, telefone, data, hora, sector, total_price, total_duration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $data['nome'],
        $data['telefone'],
        $data['data'],
        $data['hora'],
        $data['sector'],
        $data['totalPrice'],
        $data['totalDuration'],
        'pendente'
    ]);
    
    $appointmentId = $conn->lastInsertId();

    // Insert services
    $stmtServices = $conn->prepare('INSERT INTO appointment_services (appointment_id, service_name, price, duration) VALUES (?, ?, ?, ?)');
    
    foreach ($data['services'] as $service) {
        $stmtServices->execute([
            $appointmentId,
            $service['name'],
            $service['price'],
            $service['duration']
        ]);
    }

    // Commit transaction
    $conn->commit();
    
    echo json_encode(['success' => true, 'appointment_id' => $appointmentId]);
} catch (Exception $e) {
    // Rollback transaction on error
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn = null;
?>