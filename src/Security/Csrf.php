<?php
namespace App\Security;

/**
 * CSRF Token Generator and Validator
 * Protects all state-changing Admin and Customer POST requests.
 */
class Csrf
{
    public static function getToken(): string
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            @session_start();
        }
        if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public static function inputField(): string
    {
        $token = htmlspecialchars(self::getToken(), ENT_QUOTES, 'UTF-8');
        return '<input type="hidden" name="csrf_token" value="' . $token . '">';
    }

    public static function verify(?string $submittedToken): bool
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            @session_start();
        }
        $sessionToken = $_SESSION['csrf_token'] ?? '';
        if (!is_string($sessionToken) || $sessionToken === '' || !is_string($submittedToken) || $submittedToken === '') {
            return false;
        }
        return hash_equals($sessionToken, $submittedToken);
    }
}
