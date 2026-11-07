<div class="success-page-container">
    <div class="success-card">
        <div class="success-icon">✓</div>
        <h1 class="success-title">Order Confirmed!</h1>
        <p class="success-subtitle">
            Thank you, <strong><?= htmlspecialchars($order['CustomerName']) ?></strong>! Your bespoke furniture order has been registered in the Lilia & Rowena workshop system.
        </p>

        <div class="order-ticket">
            <div class="ticket-row">
                <span>Order Reference:</span>
                <strong>#<?= str_pad($order['OrderID'], 4, '0', STR_PAD_LEFT) ?></strong>
            </div>
            <div class="ticket-row">
                <span>Order Date:</span>
                <span><?= $order['OrderDate'] ?></span>
            </div>
            <div class="ticket-row">
                <span>Estimated Completion / Due Date:</span>
                <strong><?= $order['DueDate'] ?></strong>
            </div>
            <div class="ticket-row">
                <span>Production Status:</span>
                <span class="status-badge status-<?= strtolower(str_replace(' ', '-', $order['Status'])) ?>">
                    <?= htmlspecialchars($order['Status']) ?>
                </span>
            </div>
            <div class="ticket-row">
                <span>Assigned Delivery Driver:</span>
                <span><?= htmlspecialchars($order['delivery']['DriverName'] ?? 'Queued for Driver Assignment') ?></span>
            </div>
            <div class="ticket-row">
                <span>Delivery Address:</span>
                <span><?= htmlspecialchars($order['delivery']['DeliveryAddress'] ?? $order['Email']) ?></span>
            </div>
        </div>

        <div class="success-actions">
            <a href="index.php?route=track&order_id=<?= $order['OrderID'] ?>" class="btn-primary">
                Track Live Workshop Status →
            </a>
            <a href="index.php?route=home" class="btn-text">
                Return to Homepage
            </a>
        </div>
    </div>
</div>
