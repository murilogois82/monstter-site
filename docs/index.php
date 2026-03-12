<?php
/**
 * Monstter - KingHost Deployment Router
 * Este arquivo lida com o roteamento do lado do cliente (React/Wouter)
 * em servidores PHP como o da KingHost.
 */

$request = $_SERVER['REQUEST_URI'];
$base_path = '/'; // Ajuste se o site estiver em um subdiretório

// Remove o base_path do início da requisição
if (strpos($request, $base_path) === 0) {
    $request = substr($request, strlen($base_path));
}

// Limpa query strings
$request = explode('?', $request)[0];

// Se o arquivo solicitado existe fisicamente, serve o arquivo
if ($request !== '' && file_exists(__DIR__ . '/' . $request)) {
    return false;
}

// Caso contrário, serve o index.html para o React lidar com a rota
include __DIR__ . '/index.html';
?>
