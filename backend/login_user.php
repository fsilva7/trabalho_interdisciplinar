<?php
// backend/login_user.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['user'], $data['pass'])) {
        throw new Exception('Dados incompletos');
    }
    $user = $data['user'];
    $pass = $data['pass'];
    $stmt = $conn->prepare('SELECT password FROM admin_users WHERE username = ? OR email = ?');
    $stmt->execute([$user, $user]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($pass, $row['password'])) {
        throw new Exception('Usuário ou senha inválidos!');
    }
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn = null;
