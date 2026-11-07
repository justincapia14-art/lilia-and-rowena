<div class="product-detail-container">
    <div class="breadcrumb">
        <a href="index.php?route=home">Home</a> &gt; 
        <a href="index.php?route=catalog">Catalog</a> &gt; 
        <span><?= htmlspecialchars($product['ProductName']) ?></span>
    </div>

    <div class="detail-split">
        <!-- Visual Gallery Left -->
        <div class="detail-gallery">
            <img src="<?= htmlspecialchars($product['ImagePath'] ?: 'images/product_dining_table.jpg') ?>" 
                 alt="<?= htmlspecialchars($product['ProductName']) ?>" 
                 class="detail-main-img"
                 onerror="this.src='images/product_dining_table.jpg'">
            <div class="detail-badges-row">
                <span class="badge-item">🪵 100% Solid Kiln-Dried Hardwood</span>
                <span class="badge-item">🔨 Hand-Finished Mortise & Tenon</span>
                <span class="badge-item">🛡️ 5-Year Warranty</span>
            </div>
        </div>

        <!-- Purchase & Customization Module Right -->
        <div class="detail-info-panel">
            <span class="product-category-tag"><?= htmlspecialchars($product['CategoryName']) ?></span>
            <h1 class="detail-title"><?= htmlspecialchars($product['ProductName']) ?></h1>
            <p class="detail-desc"><?= htmlspecialchars($product['Description']) ?></p>

            <div class="detail-price-box">
                <span class="price-heading">Starting Base Price:</span>
                <span class="detail-price" id="displayTotal">₱<?= number_format($product['BasePrice'], 2) ?></span>
                <span class="price-sub">Base price: ₱<span id="basePrice"><?= (float)$product['BasePrice'] ?></span> | Extra Customization: ₱<span id="extraCost">0</span></span>
            </div>

            <!-- Add to Cart / Customization Form -->
            <form action="index.php?route=cart_add" method="POST" class="customization-form" id="customForm">
                <input type="hidden" name="product_id" value="<?= $product['ProductID'] ?>">

                <?php if ($product['IsCustomizable']): ?>
                    <div class="customization-card">
                        <div class="custom-toggle-header">
                            <label class="switch-container">
                                <input type="checkbox" name="is_customized" id="isCustomCheckbox" value="1" checked>
                                <span class="switch-slider"></span>
                            </label>
                            <strong>Enable Custom Sizing & Finishes</strong>
                        </div>
                        <p class="custom-hint">Adjust dimensions to fit your living room, dining space, or bedroom exactly.</p>

                        <div class="dimensions-grid" id="dimensionInputs">
                            <div class="form-group">
                                <label for="customLength">Length (cm)</label>
                                <input type="number" id="customLength" name="length" value="120" min="60" max="300" step="5">
                                <small>Standard: 120cm</small>
                            </div>

                            <div class="form-group">
                                <label for="customWidth">Width (cm)</label>
                                <input type="number" id="customWidth" name="width" value="80" min="40" max="200" step="5">
                                <small>Standard: 80cm</small>
                            </div>

                            <div class="form-group">
                                <label for="customHeight">Height (cm)</label>
                                <input type="number" id="customHeight" name="height" value="75" min="30" max="120" step="5">
                                <small>Standard: 75cm</small>
                            </div>
                        </div>

                        <div class="form-group finish-group">
                            <label for="colorFinish">Select Wood Stain & Finish</label>
                            <select id="colorFinish" name="color_finish">
                                <option value="Natural Teak Oil">Natural Teak Oil (Clean Wood Grain)</option>
                                <option value="Warm Walnut Stain">Warm Walnut Stain (+$1,500 premium)</option>
                                <option value="Scandinavian Light Ash">Scandinavian Light Ash</option>
                                <option value="Matte Off-White Lacquer">Matte Off-White Lacquer</option>
                                <option value="Deep Espresso Mahogany">Deep Espresso Mahogany</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="customNotes">Special Carpenter Notes (Optional)</label>
                            <textarea id="customNotes" name="notes" rows="2" placeholder="e.g. Rounded edges for kids, cable grommet on right side..."></textarea>
                        </div>
                    </div>
                <?php endif; ?>

                <div class="quantity-row">
                    <div class="qty-picker">
                        <label for="quantityInput">Quantity:</label>
                        <input type="number" id="quantityInput" name="quantity" value="1" min="1" max="10">
                    </div>

                    <button type="submit" class="btn-primary btn-large">
                        Add to Shopping Cart 🛒
                    </button>
                </div>
            </form>

            <div class="craft-guarantee-box">
                <h4>Payment & Delivery Guarantee:</h4>
                <p>• Only <strong>50% downpayment</strong> required to start workshop production.</p>
                <p>• Remaining balance paid via <strong>Cash on Delivery (COD)</strong> upon inspection.</p>
                <p>• White-Glove delivery by our own in-house furniture driver.</p>
            </div>
        </div>
    </div>
</div>
