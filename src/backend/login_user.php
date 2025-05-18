<?php
// backend/login_user.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['email'], $data['pass'])) {
        throw new Exception('Dados incompletos');
    }
    $email = $data['email'];
    $pass = $data['pass'];
    $stmt = $conn->prepare('SELECT senha FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($pass, $row['senha'])) {
        throw new Exception('Email ou senha inválidos!');
    }
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn = null;
