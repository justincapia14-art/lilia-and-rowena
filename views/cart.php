<div class="cart-page-container">
    <div class="cart-header">
        <h1 class="page-title">Your Furniture Shopping Cart</h1>
        <p class="page-desc">Review your selected pieces and custom woodworking specifications before checkout.</p>
    </div>

    <?php if (!empty($_SESSION['cart_message'])): ?>
        <div class="alert-success">
            <?= htmlspecialchars($_SESSION['cart_message']); unset($_SESSION['cart_message']); ?>
        </div>
    <?php endif; ?>

    <?php if (empty($cartItems)): ?>
        <div class="empty-cart-card">
            <h2>Your cart is currently empty</h2>
            <p>Ready to upgrade your home? Explore our handcrafted solid wood catalog.</p>
            <a href="index.php?route=catalog" class="btn-primary">Explore Furniture Collection</a>
        </div>
    <?php else: ?>
        <div class="cart-layout">
            <!-- Items List Left -->
            <div class="cart-items-panel">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Piece</th>
                            <th>Specifications</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($cartItems as $key => $item): 
                            $unitPrice = $item['basePrice'] + ($item['extraCost'] ?? 0);
                            $lineTotal = $unitPrice * $item['quantity'];
                        ?>
                            <tr>
                                <td class="product-col">
                                    <img src="<?= htmlspecialchars($item['imagePath'] ?: 'images/product_dining_table.jpg') ?>" 
                                         alt="<?= htmlspecialchars($item['productName']) ?>" 
                                         class="cart-thumb"
                                         onerror="this.src='images/product_dining_table.jpg'">
                                    <div>
                                        <strong><?= htmlspecialchars($item['productName']) ?></strong>
                                        <span class="cart-cat"><?= htmlspecialchars($item['categoryName']) ?></span>
                                    </div>
                                </td>
                                <td>
                                    <?php if ($item['isCustomized'] && !empty($item['customization'])): 
                                        $c = $item['customization'];
                                    ?>
                                        <div class="custom-specs-badge">
                                            <strong>Customized Dimensions:</strong><br>
                                            <?= $c['length'] ?>L x <?= $c['width'] ?>W x <?= $c['height'] ?>H cm<br>
                                            <em>Finish: <?= htmlspecialchars($c['colorFinish']) ?></em>
                                            <?php if (!empty($c['notes'])): ?>
                                                <br><small>Note: <?= htmlspecialchars($c['notes']) ?></small>
                                            <?php endif; ?>
                                        </div>
                                    <?php else: ?>
                                        <span class="standard-spec-badge">Standard Dimensions</span>
                                    <?php endif; ?>
                                </td>
                                <td>₱<?= number_format($unitPrice, 2) ?></td>
                                <td>
                                    <form action="index.php?route=cart_update" method="POST" class="inline-qty-form" data-ux-loading-text="Updating cart...">
                                        <input type="hidden" name="cart_key" value="<?= htmlspecialchars($key) ?>">
                                        <input type="number" name="quantity" value="<?= $item['quantity'] ?>" min="1" max="10" class="qty-field" onchange="this.form.submit()">
                                    </form>
                                </td>
                                <td class="price-strong">₱<?= number_format($lineTotal, 2) ?></td>
                                <td>
                                    <form action="index.php?route=cart_remove&amp;key=<?= urlencode($key) ?>" method="POST" style="display:inline;"
                                          data-ux-confirm-title="Remove Cart Item"
                                          data-ux-confirm-message="Are you sure you want to remove this item from your cart?"
                                          data-ux-confirm-button="Remove Item"
                                          data-ux-confirm-variant="danger"
                                          data-ux-loading-text="Removing item...">
                                        <button type="submit" class="btn-remove" title="Remove item" style="background:none;border:none;cursor:pointer;">✕</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <div class="cart-table-footer">
                    <a href="index.php?route=catalog" class="btn-text">← Continue Shopping</a>
                </div>
            </div>

            <!-- Order Summary Right -->
            <div class="cart-summary-panel">
                <h3 class="summary-title">Order Summary</h3>

                <div class="summary-line">
                    <span>Furniture Subtotal</span>
                    <span>₱<?= number_format($subtotal, 2) ?></span>
                </div>

                <div class="summary-line">
                    <span>Direct Delivery & Setup</span>
                    <span><?= $shippingFee === 0 ? '<strong class="free-text">FREE</strong>' : '₱' . number_format($shippingFee, 2) ?></span>
                </div>

                <div class="summary-divider"></div>

                <div class="summary-line total-line">
                    <span>Total Purchase Value</span>
                    <span>₱<?= number_format($grandTotal, 2) ?></span>
                </div>

                <div class="downpayment-highlight-box">
                    <div class="highlight-header">
                        <span>Due Today (50% Downpayment):</span>
                        <strong>₱<?= number_format($requiredDownpayment, 2) ?></strong>
                    </div>
                    <small>Balance of ₱<?= number_format($grandTotal - $requiredDownpayment, 2) ?> paid upon direct delivery inspection.</small>
                </div>

                <a href="index.php?route=checkout" class="btn-primary btn-block">
                    Proceed to Checkout →
                </a>

                <div class="summary-trust">
                    <p>✓ Inspected by Master Carpenter</p>
                    <p>✓ Direct-from-Workshop Warranty</p>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>
