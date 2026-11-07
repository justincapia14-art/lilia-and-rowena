<?php
namespace App\Controllers;

use App\Models\Product;
use App\Models\Category;

class HomeController
{
    private Product $productModel;
    private Category $categoryModel;

    public function __construct()
    {
        $this->productModel = new Product();
        $this->categoryModel = new Category();
    }

    /**
     * Display the conversion-focused homepage
     */
    public function index(): void
    {
        $featuredProducts = $this->productModel->getFeatured(6);
        $categories = $this->categoryModel->getAll();

        // Render homepage view
        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/home.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Display catalog with optional category filtering
     */
    public function catalog(): void
    {
        $categoryId = isset($_GET['category']) ? (int)$_GET['category'] : null;
        $products = $this->productModel->getAll($categoryId);
        $categories = $this->categoryModel->getAll();

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/catalog.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Display single product detail page with customization calculator
     */
    public function productDetail(): void
    {
        $productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $product = $this->productModel->findById($productId);

        if (!$product) {
            header('Location: index.php?route=catalog');
            exit;
        }

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/product_detail.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }
}
