<?php
/**
 * Determine the currently authenticated user's role and ID from the session.
 * - Customer only sees their own private conversation ($activeCustomerId === $_SESSION['customer_id']).
 * - Admin sees a Customer Conversation List and can switch between each customer's private conversation.
 */
$loggedInRole = $_SESSION['user_role'] ?? (isset($_SESSION['admin_id']) ? 'admin' : (isset($_SESSION['customer_id']) ? 'customer' : 'guest'));
$loggedInUserId = ($loggedInRole === 'admin')
    ? (int)($_SESSION['admin_id'] ?? 0)
    : (($loggedInRole === 'customer') ? (int)($_SESSION['customer_id'] ?? 0) : 0);

$activeCustomerId = isset($activeCustomerId) ? (int)$activeCustomerId : ($loggedInRole === 'customer' ? $loggedInUserId : 1);
?>
<div class="section-container" style="padding-top: 2.5rem; max-width: 960px;">
    <div class="section-header-row" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 1.25rem;">
        <div>
            <span class="section-kicker">Private 1-on-1 Workshop Messenger (Table: Order_Message)</span>
            <h1 class="section-title">Message Admin · Private Order Follow-Up &amp; Custom Add-Ons</h1>
            <p class="section-subtitle">
                Each customer has a separate, private conversation with Rowena &amp; Lilia's workshop team.
            </p>
        </div>
        <div>
            <span class="hero-est-tag" style="background: #dcfce7; color: #15803d; border-color: #bbf7d0;">● Private Conversation #<?= $activeCustomerId ?></span>
        </div>
    </div>

    <?php if ($loggedInRole === 'admin' && !empty($conversations)): ?>
        <div style="background: #f0f7ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 0.9rem 1.1rem; margin-bottom: 1rem;">
            <strong style="font-size: 0.78rem; color: #075985; display: block; margin-bottom: 0.5rem;">Select Customer Conversation (Admin Inbox):</strong>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <?php foreach ($conversations as $conv): ?>
                    <?php $cid = (int)$conv['CustomerID']; ?>
                    <a href="index.php?route=messages&amp;customer_id=<?= $cid ?>"
                       class="<?= $cid === $activeCustomerId ? 'btn-sm-primary' : 'btn-sm-soft' ?>">
                        👤 <?= htmlspecialchars($conv['FullName']) ?> (#<?= $cid ?> · <?= (int)$conv['MessageCount'] ?> msgs)
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>

    <div style="background: #ffffff; border: 1px solid #bae6fd; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(2, 132, 199, 0.06);">
        <!-- Messenger-Style Private Message Feed -->
        <div id="phpLiveChatFeed" class="chat-feed-box" style="height: 420px; margin-bottom: 0; border: none; border-radius: 0;">
            <?php if (empty($messages)): ?>
                <p style="text-align: center; color: #64748b; padding: 2rem;">No messages in this private conversation yet. Send a message below to start!</p>
            <?php else: ?>
                <?php foreach ($messages as $msg): ?>
                    <?php
                    $msgSenderRole = strtolower(trim($msg['SenderRole'] ?? 'customer'));
                    $msgSenderId = isset($msg['SenderID'])
                        ? (int)$msg['SenderID']
                        : ($msgSenderRole === 'admin' ? (int)($msg['AdminID'] ?? 0) : (int)($msg['CustomerID'] ?? 0));

                    // Compare message sender's ID and role with the currently authenticated user's ID and role
                    $isOwnMessage = ($loggedInUserId > 0 && $loggedInRole === $msgSenderRole && $loggedInUserId === $msgSenderId);
                    $rowClass = $isOwnMessage ? 'chat-row own-row' : 'chat-row other-row';
                    $bubbleClass = $isOwnMessage ? 'chat-bubble msg-own' : 'chat-bubble msg-other';
                    $senderLabel = $isOwnMessage
                        ? htmlspecialchars($msg['SenderName']) . ' (You)'
                        : htmlspecialchars($msg['SenderName']) . ' (' . htmlspecialchars($msg['SenderRole']) . ')';
                    ?>
                    <div class="<?= $rowClass ?>">
                        <div class="<?= $bubbleClass ?>">
                            <div class="chat-bubble-meta">
                                <strong><?= $senderLabel ?></strong>
                                <span><?= htmlspecialchars($msg['Topic']) ?> · <?= htmlspecialchars($msg['CreatedAt']) ?></span>
                            </div>
                            <div><?= nl2br(htmlspecialchars($msg['MessageText'])) ?></div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <!-- Send Message Form (For Customers, CustomerID is derived strictly from $_SESSION on the server) -->
        <form action="index.php?route=messages_send" method="POST" style="padding: 1.25rem; background: #ffffff; border-top: 1px solid #e2e8f0;">
            <?php if ($loggedInRole === 'admin'): ?>
                <input type="hidden" name="customer_id" value="<?= $activeCustomerId ?>" />
            <?php endif; ?>
            <div class="form-row-2" style="margin-bottom: 0.75rem;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="phpChatOrder">Related Order # (Optional)</label>
                    <select id="phpChatOrder" name="order_id">
                        <?php if ($activeCustomerId === 1): ?>
                            <option value="1001">Order #1001 — Mahogany 6-Seater Dining Set</option>
                        <?php elseif ($activeCustomerId === 2): ?>
                            <option value="1002">Order #1002 — Scandinavian Sky Blue Lounge Sofa</option>
                        <?php endif; ?>
                        <option value="">General Inquiry / New Custom Request</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="phpChatTopic">Inquiry / Request Type</label>
                    <select id="phpChatTopic" name="topic">
                        <option value="Order Follow-Up">Order Status Follow-Up</option>
                        <option value="Add Extra Item / Custom Spec">Add Extra Piece / Modify Dimensions</option>
                        <option value="Delivery Schedule Request">Delivery Schedule / Driver Coordination</option>
                        <option value="General Workshop Inquiry">General Workshop Inquiry</option>
                    </select>
                </div>
            </div>

            <div style="display: flex; gap: 0.65rem;">
                <input type="text" name="message_text" required placeholder="Type your private message..." style="flex: 1; padding: 0.7rem 0.9rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.86rem;" />
                <button type="submit" class="btn-primary">Send Message →</button>
            </div>
        </form>
    </div>
</div>

