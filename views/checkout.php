<div class="checkout-page-container">
    <div class="checkout-header">
        <h1 class="page-title">Direct Workshop Checkout</h1>
        <p class="page-desc">Please provide delivery address details for our in-house driver and dispatch team.</p>
    </div>

    <?php if (!empty($error)): ?>
        <div class="alert-error">
            <?= htmlspecialchars($error) ?>
        </div>
    <?php endif; ?>

    <div class="checkout-layout">
        <!-- Delivery Form Left -->
        <div class="checkout-form-panel">
            <form action="index.php?route=place_order" method="POST" id="checkoutForm">
                <h3 class="form-section-title">1. Recipient & Contact Information</h3>
                
                <div class="form-group">
                    <label for="fullName">Full Name *</label>
                    <input type="text" id="fullName" name="full_name" required 
                           value="<?= htmlspecialchars($customer['FullName'] ?? '') ?>" 
                           placeholder="e.g. Maria Teresa Santos">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input type="email" id="email" name="email" required 
                               value="<?= htmlspecialchars($customer['Email'] ?? '') ?>" 
                               placeholder="e.g. maria@example.com">
                    </div>

                    <div class="form-group">
                        <label for="phoneNumber">Mobile Number *</label>
                        <input type="tel" id="phoneNumber" name="phone_number" required 
                               value="<?= htmlspecialchars($customer['PhoneNumber'] ?? '') ?>" 
                               placeholder="e.g. 0917-123-4567">
                    </div>
                </div>

                <h3 class="form-section-title">2. Delivery Destination & Notes</h3>

                <div class="form-group">
                    <label for="deliveryAddress">Complete Delivery Address *</label>
                    <textarea id="deliveryAddress" name="address" rows="3" required 
                              placeholder="House/Unit #, Street, Barangay, City, Province"><?= htmlspecialchars($customer['Address'] ?? '') ?></textarea>
                </div>

                <h3 class="form-section-title">3. Payment Terms (Cash on Delivery / Downpayment)</h3>
                
                <div class="payment-terms-box">
                    <label class="radio-label">
                        <input type="radio" name="payment_type" value="Downpayment" checked>
                        <div>
                            <strong>50% Downpayment + 50% Balance Upon Delivery (Recommended)</strong>
                            <p>Pay 50% downpayment via bank transfer/GCash to initiate wood preparation. Pay remainder in cash upon driver delivery inspection.</p>
                        </div>
                    </label>
                </div>

                <button type="submit" class="btn-primary btn-large btn-block" style="margin-top: 1.5rem;">
                    Confirm & Place Furniture Order (₱<?= number_format($requiredDownpayment, 2) ?> Downpayment)
                </button>
            </form>
        </div>

        <!-- Order Summary Right -->
        <div class="checkout-summary-panel">
            <h3 class="summary-title">Order Overview (<?= count($cartItems) ?> items)</h3>

            <div class="checkout-items-list">
                <?php foreach ($cartItems as $item): 
                    $itemTotal = ($item['basePrice'] + ($item['extraCost'] ?? 0)) * $item['quantity'];
                ?>
                    <div class="mini-item-row">
                        <img src="<?= htmlspecialchars($item['imagePath'] ?: 'images/product_dining_table.jpg') ?>" 
                             alt="<?= htmlspecialchars($item['productName']) ?>" 
                             class="mini-thumb"
                             onerror="this.src='images/product_dining_table.jpg'">
                        <div class="mini-info">
                            <strong><?= htmlspecialchars($item['productName']) ?></strong>
                            <span>Qty: <?= $item['quantity'] ?> <?= $item['isCustomized'] ? '· Customized' : '' ?></span>
                        </div>
                        <span class="mini-price">₱<?= number_format($itemTotal, 2) ?></span>
                    </div>
                <?php endforeach; ?>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-line">
                <span>Subtotal</span>
                <span>₱<?= number_format($subtotal, 2) ?></span>
            </div>
            <div class="summary-line">
                <span>Delivery</span>
                <span><?= $shippingFee === 0 ? 'FREE' : '₱' . number_format($shippingFee, 2) ?></span>
            </div>
            <div class="summary-line total-line">
                <span>Total Amount</span>
                <span>₱<?= number_format($grandTotal, 2) ?></span>
            </div>

            <div class="downpayment-highlight-box">
                <span>50% Downpayment Due:</span>
                <strong>₱<?= number_format($requiredDownpayment, 2) ?></strong>
            </div>
        </div>
    </div>
</div>
