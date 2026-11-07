<?php
namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Category Model
 * Maps to table: Category (CategoryID, CategoryName, Description)
 */
class Category
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Fetch all furniture categories
     */
    public function getAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM Category ORDER BY CategoryName ASC");
        return $stmt->fetchAll();
    }

    /**
     * Find category by ID
     */
    public function findById(int $categoryId): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM Category WHERE CategoryID = :id LIMIT 1");
        $stmt->execute(['id' => $categoryId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
