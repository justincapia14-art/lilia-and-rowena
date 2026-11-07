<div class="track-page-container">
    <div class="track-header">
        <h1 class="page-title">Track Workshop & Delivery Status</h1>
        <p class="page-desc">Enter your Order Number to check carpenter progress, finishing stages, and driver dispatch.</p>
    </div>

    <!-- Lookup Form -->
    <div class="track-search-card">
        <form action="index.php" method="GET" class="track-search-form">
            <input type="hidden" name="route" value="track">
            <div class="form-group-inline">
                <label for="orderInput">Order Number:</label>
                <input type="number" id="orderInput" name="order_id" placeholder="e.g. 1001 or 1" value="<?= $orderId ? $orderId : '' ?>" required>
                <button type="submit" class="btn-primary">Track Order</button>
            </div>
        </form>
    </div>

    <?php if ($orderId > 0 && !$order): ?>
        <div class="alert-error" style="max-width: 650px; margin: 2rem auto;">
            Order #<?= $orderId ?> was not found in our database. Please verify the order number on your receipt.
        </div>
    <?php elseif ($order): ?>
        <div class="order-details-card">
            <div class="order-summary-header">
                <div>
                    <h2>Order #<?= str_pad($order['OrderID'], 4, '0', STR_PAD_LEFT) ?></h2>
                    <span class="order-date">Placed on <?= $order['OrderDate'] ?> · Due by <?= $order['DueDate'] ?></span>
                </div>
                <div>
                    <span class="status-pill status-<?= strtolower(str_replace(' ', '-', $order['Status'])) ?>">
                        Status: <?= htmlspecialchars($order['Status']) ?>
                    </span>
                </div>
            </div>

            <!-- Visual Progress Timeline -->
            <div class="progress-steps-row">
                <?php
                $stages = ['Pending', 'Confirmed', 'In Production', 'Ready', 'Delivered'];
                $currentIdx = array_search($order['Status'], $stages);
                if ($currentIdx === false) $currentIdx = 0;
                ?>
                <?php foreach ($stages as $idx => $stg): ?>
                    <div class="timeline-step <?= $idx <= $currentIdx ? 'completed' : '' ?> <?= $idx === $currentIdx ? 'current' : '' ?>">
                        <div class="step-circle"><?= $idx <= $currentIdx ? '✓' : ($idx + 1) ?></div>
                        <span class="step-title"><?= $stg ?></span>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Ordered Items & Specs -->
            <h3 class="subsection-title">Furniture Pieces in Production:</h3>
            <div class="tracked-items-list">
                <?php foreach ($order['items'] as $it): ?>
                    <div class="tracked-item-row">
                        <div class="item-name-col">
                            <strong><?= htmlspecialchars($it['ProductName']) ?></strong>
                            <span>Item Type: <?= htmlspecialchars($it['ItemType']) ?></span>
                            <?php if ($it['ItemType'] === 'Customized'): ?>
                                <small class="custom-specs-text">
                                    Dimensions: <?= $it['Length'] ?>cm L x <?= $it['Width'] ?>cm W x <?= $it['Height'] ?>cm H | Finish: <?= htmlspecialchars($it['ColorFinish']) ?>
                                </small>
                            <?php endif; ?>
                        </div>
                        <div>
                            <span>Qty: <?= $it['Quantity'] ?></span>
                        </div>
                        <div>
                            <strong>₱<?= number_format($it['UnitPrice'] * $it['Quantity'], 2) ?></strong>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Delivery & Payment Info -->
            <div class="order-grid-meta">
                <div class="meta-box">
                    <h4>In-House Delivery Info:</h4>
                    <p><strong>Receiver:</strong> <?= htmlspecialchars($order['delivery']['ReceiverName'] ?? $order['CustomerName']) ?></p>
                    <p><strong>Address:</strong> <?= htmlspecialchars($order['delivery']['DeliveryAddress'] ?? 'On file') ?></p>
                    <p><strong>Driver:</strong> <?= htmlspecialchars($order['delivery']['DriverName'] ?? 'Assigned prior to dispatch') ?></p>
                    <p><strong>Driver Phone:</strong> <?= htmlspecialchars($order['delivery']['DriverPhone'] ?? 'Available upon dispatch') ?></p>
                </div>

                <div class="meta-box">
                    <h4>Payment Records:</h4>
                    <?php if (!empty($order['payments'])): ?>
                        <?php foreach ($order['payments'] as $p): ?>
                            <p>• <strong><?= $p['PaymentType'] ?>:</strong> ₱<?= number_format($p['Amount'], 2) ?> (<?= $p['PaymentDate'] ?>)</p>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <p>No payment recorded yet.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>
