<?php
namespace App\Config;

use PDO;
use PDOException;

/**
 * Database Connection Handler (Singleton Pattern)
 * Provides a clean and safe PDO connection to the `furniture_shop` database.
 */
class Database
{
    private static ?PDO $instance = null;

    /**
     * Get the active PDO database connection
     * @return PDO
     */
    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $config = require __DIR__ . '/../../config/database.php';

            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                $config['host'],
                $config['port'],
                $config['dbname'],
                $config['charset']
            );

            try {
                self::$instance = new PDO(
                    $dsn,
                    $config['username'],
                    $config['password'],
                    $config['options']
                );
            } catch (PDOException $e) {
                // Return a friendly error message without exposing sensitive credentials
                die('Database Connection Error: Could not connect to furniture_shop. Please make sure MySQL is running in XAMPP and the database is imported. Details: ' . $e->getMessage());
            }
        }

        return self::$instance;
    }
}
