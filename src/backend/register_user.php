<?php
// backend/register_user.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['user'], $data['email'], $data['pass'])) {
        throw new Exception('Dados incompletos');
    }
    $user = $data['user'];
    $email = $data['email'];
    $pass = password_hash($data['pass'], PASSWORD_DEFAULT);
    // Verifica se já existe
    $stmt = $conn->prepare('SELECT 1 FROM users WHERE nome = ? OR email = ?');
    $stmt->execute([$user, $email]);
    if ($stmt->fetch()) {
        throw new Exception('Usuário ou e-mail já existe!');
    }
    $stmt = $conn->prepare('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)');
    $stmt->execute([$user, $email, $pass]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn = null;
