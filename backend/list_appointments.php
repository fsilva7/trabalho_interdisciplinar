<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'db.php';

try {
    $sql = "SELECT a.id, c.nome, c.telefone, a.data, a.hora, a.servico, a.status 
            FROM agendamentos a 
            JOIN clientes c ON a.cliente_id = c.id 
            ORDER BY data, hora";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatar as datas para o padrão brasileiro
    foreach ($appointments as &$appointment) {
        $date = new DateTime($appointment['data']);
        $appointment['data'] = $date->format('d/m/Y');
    }
    
    echo json_encode($appointments);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao buscar agendamentos: ' . $e->getMessage()]);
}

$conn = null;
