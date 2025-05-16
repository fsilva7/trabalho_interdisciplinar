<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    // Add new columns to appointments table
    $alterQueries = [
        "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS observacoes TEXT AFTER status",
        "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS ultima_atualizacao TIMESTAMP AFTER observacoes",
        
        // Update ultima_atualizacao for existing records
        "UPDATE appointments SET ultima_atualizacao = created_at WHERE ultima_atualizacao IS NULL"
    ];

    foreach ($alterQueries as $query) {
        $conn->exec($query);
    }

    echo json_encode(['success' => true, 'message' => 'Database schema updated successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn = null;
