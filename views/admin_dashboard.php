<div class="section-container" style="padding-top: 2.5rem;">
    <div class="section-header-row" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 1.25rem;">
        <div>
            <span class="section-kicker">Admin Management Console (Database Table: Admin)</span>
            <h1 class="section-title">Workshop &amp; Inventory Administration</h1>
            <p class="section-subtitle">Logged in as Admin: <strong><?= htmlspecialchars($_SESSION['admin_email'] ?? 'admin@liliaandrowena.com') ?></strong></p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
            <a href="index.php?route=home" class="btn-secondary">View Storefront</a>
            <a href="index.php?route=logout" class="btn-primary" style="background-color: #dc2626;">Logout Admin</a>
        </div>
    </div>

    <?php if (!empty($adminMessage)): ?>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 0.85rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.88rem; font-weight: 600;">
            ✓ <?= htmlspecialchars($adminMessage) ?>
        </div>
    <?php endif; ?>

    <!-- 1. CUSTOMER ORDERS MANAGEMENT -->
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 1rem;">1. Customer Orders &amp; Production Status (Table: Customer_Order)</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.84rem;">
                <thead>
                    <tr style="background: #f0f7ff; text-align: left; border-bottom: 1px solid #bae6fd;">
                        <th style="padding: 0.75rem;">Order #</th>
                        <th style="padding: 0.75rem;">Customer</th>
                        <th style="padding: 0.75rem;">Order Date</th>
                        <th style="padding: 0.75rem;">Due Date</th>
                        <th style="padding: 0.75rem;">Total Value</th>
                        <th style="padding: 0.75rem;">Paid</th>
                        <th style="padding: 0.75rem;">Status</th>
                        <th style="padding: 0.75rem;">Update Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orders as $ord): ?>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 0.75rem;"><strong>#<?= $ord['OrderID'] ?></strong></td>
                            <td style="padding: 0.75rem;">
                                <?= htmlspecialchars($ord['CustomerName']) ?><br>
                                <small style="color: #64748b;"><?= htmlspecialchars($ord['PhoneNumber']) ?></small>
                            </td>
                            <td style="padding: 0.75rem;"><?= $ord['OrderDate'] ?></td>
                            <td style="padding: 0.75rem;"><?= $ord['DueDate'] ?></td>
                            <td style="padding: 0.75rem;">₱<?= number_format((float)$ord['TotalAmount'], 2) ?></td>
                            <td style="padding: 0.75rem;">₱<?= number_format((float)$ord['TotalPaid'], 2) ?></td>
                            <td style="padding: 0.75rem;">
                                <span class="btn-sm-soft"><?= htmlspecialchars($ord['Status']) ?></span>
                            </td>
                            <td style="padding: 0.75rem;">
                                <form action="index.php?route=admin_update_order" method="POST" style="display: flex; gap: 0.4rem;">
                                    <input type="hidden" name="order_id" value="<?= $ord['OrderID'] ?>">
                                    <select name="status" style="padding: 0.35rem 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.78rem;">
                                        <?php foreach (['Pending', 'Confirmed', 'In Production', 'Ready', 'Delivered', 'Completed', 'Cancelled'] as $st): ?>
                                            <option value="<?= $st ?>" <?= $ord['Status'] === $st ? 'selected' : '' ?>><?= $st ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    <button type="submit" class="btn-sm-primary">Save</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- 2. RAW MATERIALS & SUPPLIERS (Tables: Material & Supplier) -->
    <div class="form-row-2" style="gap: 1.5rem; margin-bottom: 2rem;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 0.85rem;">2. Raw Materials Stock (Table: Material)</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                <thead>
                    <tr style="background: #f8fafc; text-align: left; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 0.5rem;">Material</th>
                        <th style="padding: 0.5rem;">Type</th>
                        <th style="padding: 0.5rem;">Stock</th>
                        <th style="padding: 0.5rem;">Supplier</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($materials as $m): ?>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 0.5rem;"><strong><?= htmlspecialchars($m['MaterialName']) ?></strong></td>
                            <td style="padding: 0.5rem;"><?= htmlspecialchars($m['MaterialType']) ?></td>
                            <td style="padding: 0.5rem;"><?= $m['StockQuantity'] ?> <?= htmlspecialchars($m['Unit']) ?></td>
                            <td style="padding: 0.5rem;"><?= htmlspecialchars($m['SupplierName']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- 3. WORKSHOP EMPLOYEES (Table: Employee) -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 0.85rem;">3. Workshop Workers (Table: Employee)</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                <thead>
                    <tr style="background: #f8fafc; text-align: left; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 0.5rem;">Full Name</th>
                        <th style="padding: 0.5rem;">Role</th>
                        <th style="padding: 0.5rem;">Phone</th>
                        <th style="padding: 0.5rem;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($employees as $emp): ?>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 0.5rem;"><strong><?= htmlspecialchars($emp['FullName']) ?></strong></td>
                            <td style="padding: 0.5rem;"><?= htmlspecialchars($emp['Role']) ?></td>
                            <td style="padding: 0.5rem;"><?= htmlspecialchars($emp['PhoneNumber']) ?></td>
                            <td style="padding: 0.5rem;"><span class="btn-sm-soft"><?= htmlspecialchars($emp['Status']) ?></span></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- 4. PRIVATE CUSTOMER CONVERSATIONS & ORDER FOLLOW-UPS (Table: Order_Message) -->
    <?php
    $loggedInAdminId = (int)($_SESSION['admin_id'] ?? 1);
    $selectedCustomerId = isset($selectedCustomerId) ? (int)$selectedCustomerId : 1;
    ?>
    <div style="background: #ffffff; border: 1px solid #bae6fd; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 0.4rem;">4. Private Customer-Admin Conversations (Table: Order_Message)</h3>
        <p style="font-size: 0.82rem; color: #475569; margin-bottom: 1rem;">
            Each customer has a separate, private conversation. Select a customer below to view only their messages and send a private reply.
        </p>

        <!-- Customer Conversation Switcher List -->
        <?php if (!empty($conversations)): ?>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; padding-bottom: 0.85rem; border-bottom: 1px solid #e2e8f0;">
                <?php foreach ($conversations as $conv): ?>
                    <?php $cid = (int)$conv['CustomerID']; ?>
                    <a href="index.php?route=admin_dashboard&amp;customer_id=<?= $cid ?>"
                       class="<?= $cid === $selectedCustomerId ? 'btn-sm-primary' : 'btn-sm-soft' ?>">
                        👤 <?= htmlspecialchars($conv['FullName']) ?> (Customer #<?= $cid ?> · <?= (int)$conv['MessageCount'] ?> messages)
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div class="chat-feed-box" style="height: 320px; background: #f8fafc;">
            <?php if (empty($messages)): ?>
                <p style="text-align: center; color: #64748b; padding: 2rem;">No messages in Customer #<?= $selectedCustomerId ?>'s conversation yet.</p>
            <?php else: ?>
                <?php foreach ($messages as $m): ?>
                    <?php
                    $msgSenderRole = strtolower(trim($m['SenderRole'] ?? 'customer'));
                    $msgSenderId = isset($m['SenderID'])
                        ? (int)$m['SenderID']
                        : ($msgSenderRole === 'admin' ? (int)($m['AdminID'] ?? 0) : (int)($m['CustomerID'] ?? 0));

                    // Admin is logged in here: Admin's own messages go on the RIGHT, Customer messages go on the LEFT
                    $isOwnAdminMessage = ($msgSenderRole === 'admin' && $msgSenderId === $loggedInAdminId);
                    $rowClass = $isOwnAdminMessage ? 'chat-row own-row' : 'chat-row other-row';
                    $bubbleClass = $isOwnAdminMessage ? 'chat-bubble msg-own' : 'chat-bubble msg-other';
                    $senderLabel = $isOwnAdminMessage
                        ? htmlspecialchars($m['SenderName']) . ' (You)'
                        : htmlspecialchars($m['SenderName']) . ' (' . htmlspecialchars($m['SenderRole']) . ')';
                    ?>
                    <div class="<?= $rowClass ?>">
                        <div class="<?= $bubbleClass ?>">
                            <div class="chat-bubble-meta">
                                <strong><?= $senderLabel ?> · Order #<?= htmlspecialchars((string)($m['OrderID'] ?? 'General')) ?></strong>
                                <span><?= htmlspecialchars($m['Topic']) ?> · <?= htmlspecialchars($m['CreatedAt']) ?></span>
                            </div>
                            <div><?= nl2br(htmlspecialchars($m['MessageText'])) ?></div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <form action="index.php?route=messages_send" method="POST" style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <input type="hidden" name="sender_role" value="Admin">
            <input type="hidden" name="customer_id" value="<?= $selectedCustomerId ?>">
            <input type="hidden" name="order_id" value="<?= $selectedCustomerId === 2 ? '1002' : '1001' ?>">
            <input type="hidden" name="topic" value="Workshop Admin Reply">
            <input type="text" name="message_text" required placeholder="Type official Admin reply to Customer #<?= $selectedCustomerId ?>..." style="flex: 1; padding: 0.55rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.82rem;">
            <button type="submit" class="btn-sm-primary">Send Private Reply to Customer #<?= $selectedCustomerId ?> →</button>
        </form>
    </div>
</div>

