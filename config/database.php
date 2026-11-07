<?php
/**
 * Database Configuration File
 * Lilia and Rowena Furniture Shop Management and Sales System
 * 
 * Target DBMS: MySQL 8+ / MariaDB 10.4+ (Default XAMPP settings)
 */

return [
    'host'     => 'localhost',
    'port'     => 3306,
    'dbname'   => 'furniture_shop',
    'username' => 'root',
    'password' => '', // Default XAMPP password is empty
    'charset'  => 'utf8mb4',
    'options'  => [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]
];
