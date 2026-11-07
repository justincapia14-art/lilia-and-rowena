<?php
namespace App\Controllers;

use App\Models\Product;

class CartController
{
    private Product $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }
    }

    /**
     * Show shopping cart page
     */
    public function index(): void
    {
        $cartItems = $_SESSION['cart'];
        $subtotal = 0;

        foreach ($cartItems as $item) {
            $price = $item['basePrice'] + ($item['extraCost'] ?? 0);
            $subtotal += ($price * $item['quantity']);
        }

        $shippingFee = ($subtotal >= 15000 || $subtotal === 0) ? 0 : 850;
        $grandTotal = $subtotal + $shippingFee;
        $requiredDownpayment = round($grandTotal * 0.5, 2);

        require __DIR__ . '/../../views/layouts/header.php';
        require __DIR__ . '/../../views/cart.php';
        require __DIR__ . '/../../views/layouts/footer.php';
    }

    /**
     * Add product to cart (Standard or Customized)
     */
    public function add(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: index.php?route=catalog');
            exit;
        }

        $productId = (int)($_POST['product_id'] ?? 0);
        $product = $this->productModel->findById($productId);

        if (!$product) {
            header('Location: index.php?route=catalog');
            exit;
        }

        $quantity = max(1, (int)($_POST['quantity'] ?? 1));
        $isCustom = isset($_POST['is_customized']) && $_POST['is_customized'] === '1';

        $customization = null;
        $extraCost = 0.0;

        if ($isCustom) {
            $length = !empty($_POST['length']) ? (float)$_POST['length'] : null;
            $width  = !empty($_POST['width']) ? (float)$_POST['width'] : null;
            $height = !empty($_POST['height']) ? (float)$_POST['height'] : null;
            $colorFinish = trim($_POST['color_finish'] ?? 'Natural Wood');
            $notes = trim($_POST['notes'] ?? '');

            // Calculate extra cost for custom sizing & finish
            if ($length && $length > 120) {
                $extraCost += ($length - 120) * 15;
            }
            if ($width && $width > 80) {
                $extraCost += ($width - 80) * 12;
            }
            if ($height && $height > 75) {
                $extraCost += ($height - 75) * 10;
            }

            if (stripos($colorFinish, 'Walnut') !== false || stripos($colorFinish, 'Teak') !== false) {
                $extraCost += 1500;
            }

            $customization = [
                'length'      => $length,
                'width'       => $width,
                'height'      => $height,
                'colorFinish' => $colorFinish,
                'notes'       => $notes,
            ];
        }

        // Cart item unique key (to separate custom variants of same product)
        $cartKey = $isCustom 
            ? 'p_' . $productId . '_' . md5(json_encode($customization))
            : 'p_' . $productId . '_standard';

        if (isset($_SESSION['cart'][$cartKey])) {
            $_SESSION['cart'][$cartKey]['quantity'] += $quantity;
        } else {
            $_SESSION['cart'][$cartKey] = [
                'key'           => $cartKey,
                'productId'     => $productId,
                'productName'   => $product['ProductName'],
                'categoryName'  => $product['CategoryName'],
                'basePrice'     => (float)$product['BasePrice'],
                'extraCost'     => $extraCost,
                'imagePath'     => $product['ImagePath'],
                'quantity'      => $quantity,
                'isCustomized'  => $isCustom,
                'customization' => $customization,
            ];
        }

        $_SESSION['cart_message'] = "Added '{$product['ProductName']}' to your shopping cart!";
        header('Location: index.php?route=cart');
        exit;
    }

    /**
     * Update quantity of an item in the cart
     */
    public function update(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $key = $_POST['cart_key'] ?? '';
            $qty = (int)($_POST['quantity'] ?? 1);

            if (isset($_SESSION['cart'][$key])) {
                if ($qty <= 0) {
                    unset($_SESSION['cart'][$key]);
                } else {
                    $_SESSION['cart'][$key]['quantity'] = $qty;
                }
            }
        }
        header('Location: index.php?route=cart');
        exit;
    }

    /**
     * Remove item from cart
     */
    public function remove(): void
    {
        $key = $_GET['key'] ?? '';
        if (isset($_SESSION['cart'][$key])) {
            unset($_SESSION['cart'][$key]);
        }
        header('Location: index.php?route=cart');
        exit;
    }
}
