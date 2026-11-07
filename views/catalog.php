<div class="catalog-page-container">
    <div class="catalog-header">
        <h1 class="page-title">Handcrafted Solid Wood Furniture Catalog</h1>
        <p class="page-desc">Every piece is built to order from kiln-dried hardwood. Choose standard specifications or configure custom dimensions to fit your home.</p>
    </div>

    <!-- Category Filter Tabs -->
    <div class="category-filter-bar">
        <a href="index.php?route=catalog" class="cat-pill <?= empty($categoryId) ? 'active' : '' ?>">All Furniture (<?= count($products) ?>)</a>
        <?php foreach ($categories as $cat): ?>
            <a href="index.php?route=catalog&category=<?= $cat['CategoryID'] ?>" 
               class="cat-pill <?= ($categoryId == $cat['CategoryID']) ? 'active' : '' ?>">
                <?= htmlspecialchars($cat['CategoryName']) ?>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Product Grid -->
    <div class="product-grid">
        <?php if (empty($products)): ?>
            <div class="empty-state">
                <p>No products found in this category.</p>
                <a href="index.php?route=catalog" class="btn-primary">View All Furniture</a>
            </div>
        <?php else: ?>
            <?php foreach ($products as $item): ?>
                <div class="product-card">
                    <div class="product-image-wrap">
                        <img src="<?= htmlspecialchars($item['ImagePath'] ?: 'images/product_dining_table.jpg') ?>" 
                             alt="<?= htmlspecialchars($item['ProductName']) ?>" 
                             class="product-image"
                             onerror="this.src='images/product_dining_table.jpg'">
                        <?php if ($item['IsCustomizable']): ?>
                            <span class="custom-tag">Custom Sizing</span>
                        <?php endif; ?>
                    </div>
                    
                    <div class="product-info">
                        <span class="product-category"><?= htmlspecialchars($item['CategoryName']) ?></span>
                        <h3 class="product-name"><?= htmlspecialchars($item['ProductName']) ?></h3>
                        <p class="product-desc"><?= htmlspecialchars($item['Description']) ?></p>
                        
                        <div class="product-price-row">
                            <div>
                                <span class="price-label">Base Price</span>
                                <span class="product-price">₱<?= number_format($item['BasePrice'], 2) ?></span>
                            </div>
                            
                            <a href="index.php?route=product&id=<?= $item['ProductID'] ?>" class="btn-sm-primary">
                                <?= $item['IsCustomizable'] ? 'Customize Dimensions' : 'View Piece' ?>
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
</div>
