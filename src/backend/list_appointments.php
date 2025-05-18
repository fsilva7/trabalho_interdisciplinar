<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'db.php';

try {
    // Get filter parameters
    $searchQuery = isset($_GET['search']) ? $_GET['search'] : '';
    $statusFilter = isset($_GET['status']) ? $_GET['status'] : '';
    $dateFilter = isset($_GET['date']) ? $_GET['date'] : '';

    $sql = "SELECT 
                a.id, a.nome, a.telefone, a.data, a.hora, a.sector,
                a.total_price, a.total_duration, a.status, a.observacoes,
                a.ultima_atualizacao, GROUP_CONCAT(s.service_name) as services
            FROM appointments a 
            LEFT JOIN appointment_services s ON a.id = s.appointment_id
            WHERE 1=1";
    
    $params = array();
    
    // Add search filter
    if ($searchQuery) {
        $sql .= " AND (a.nome LIKE ? OR a.telefone LIKE ?)";
        $params[] = "%$searchQuery%";
        $params[] = "%$searchQuery%";
    }
    
    // Add status filter
    if ($statusFilter) {
        $sql .= " AND a.status = ?";
        $params[] = $statusFilter;
    }
    
    // Add date filter
    if ($dateFilter) {
        $sql .= " AND DATE(a.data) = ?";
        $params[] = date('Y-m-d', strtotime(str_replace('/', '-', $dateFilter)));
    }
    
    $sql .= " GROUP BY a.id ORDER BY a.data DESC, a.hora DESC";
    
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
