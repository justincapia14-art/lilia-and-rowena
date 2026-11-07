<?php
namespace App\Models;

use App\Config\Database;
use PDO;

/**
 * Product Model
 * Maps to table: Product (ProductID, CategoryID, ProductName, Description, BasePrice, ImagePath, IsCustomizable)
 */
class Product
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Fetch all products with their category name
     */
    public function getAll(?int $categoryId = null): array
    {
        if ($categoryId !== null && $categoryId > 0) {
            $sql = "SELECT p.*, c.CategoryName 
                    FROM Product p
                    INNER JOIN Category c ON p.CategoryID = c.CategoryID
                    WHERE p.CategoryID = :categoryId
                    ORDER BY p.ProductID DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['categoryId' => $categoryId]);
        } else {
            $sql = "SELECT p.*, c.CategoryName 
                    FROM Product p
                    INNER JOIN Category c ON p.CategoryID = c.CategoryID
                    ORDER BY p.ProductID DESC";
            $stmt = $this->db->query($sql);
        }
        return $stmt->fetchAll();
    }

    /**
     * Fetch featured products for the homepage
     */
    public function getFeatured(int $limit = 6): array
    {
        $sql = "SELECT p.*, c.CategoryName 
                FROM Product p
                INNER JOIN Category c ON p.CategoryID = c.CategoryID
                ORDER BY p.ProductID ASC
                LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Find single product by ProductID
     */
    public function findById(int $productId): ?array
    {
        $sql = "SELECT p.*, c.CategoryName 
                FROM Product p
                INNER JOIN Category c ON p.CategoryID = c.CategoryID
                WHERE p.ProductID = :id
                LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $productId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
