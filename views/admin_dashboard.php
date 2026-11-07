<?php
use App\Security\Csrf;
use App\Models\JobOrder;

$activeTab = $filters['tab'] ?? 'deadline_today';
$searchQuery = $filters['search'] ?? '';
$statusFilter = $filters['status'] ?? 'ALL';
$priorityFilter = $filters['priority'] ?? 'ALL';
$deadlineFilter = $filters['deadline_filter'] ?? 'ALL';
$sortBy = $filters['sort'] ?? 'deadline_asc';
$todayManila = $summaryCounts['todayManila'] ?? JobOrder::todayManila();

// Compute dynamic financial totals for currently displayed Job Orders
$tabTotalAmount = 0.0;
$tabTotalPaid = 0.0;
$tabTotalDue = 0.0;
foreach ($jobOrders as $jo) {
    $amt = (float)($jo['TotalAmount'] ?? 0);
    $paid = (float)($jo['TotalPaid'] ?? 0);
    $tabTotalAmount += $amt;
    $tabTotalPaid += $paid;
    $tabTotalDue += max(0.0, $amt - $paid);
}

$tabLabels = [
    'deadline_today' => 'Deadline Today',
    'orders_today'   => 'Orders Today',
    'overdue'        => 'Overdue Orders',
    'active'         => 'Active Orders',
    'unpaid'         => 'Unpaid Orders',
    'all'            => 'All Orders'
];
?>
<div class="oms-admin-shell">
    <!-- LEFT SIDEBAR NAVIGATION (LILIA AND ROWENA FURNITURE OMS) -->
    <aside class="oms-sidebar" aria-label="Admin Sidebar Navigation">
        <div class="oms-sidebar-brand">
            <div class="oms-brand-badge">L&amp;R</div>
            <div>
                <strong class="oms-brand-name">LILIA &amp; ROWENA</strong>
                <span class="oms-brand-sub">Furniture Order Management</span>
            </div>
        </div>

        <nav class="oms-sidebar-nav">
            <a href="index.php?route=admin_dashboard&amp;tab=deadline_today" class="oms-nav-item <?= $activeTab === 'deadline_today' ? 'active' : '' ?>">
                <span>Deadline Today</span>
                <span class="oms-nav-count"><?= (int)($summaryCounts['deadlineToday'] ?? 0) ?></span>
            </a>
            <a href="index.php?route=admin_dashboard&amp;tab=all" class="oms-nav-item <?= $activeTab !== 'deadline_today' ? 'active' : '' ?>">
                <span>Job Orders</span>
                <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
                    <?php if (!empty($totalAdminUnread) && (int)$totalAdminUnread > 0): ?>
                        <span class="unread-red-badge" title="<?= (int)$totalAdminUnread ?> unread customer message(s)"><?= (int)$totalAdminUnread ?></span>
                    <?php endif; ?>
                    <span class="oms-nav-count"><?= (int)($summaryCounts['totalOrders'] ?? 0) ?></span>
                </span>
            </a>
            <a href="#adminConversationsSection" class="oms-nav-item">
                <span>Customer Messages</span>
                <?php if (!empty($totalAdminUnread) && (int)$totalAdminUnread > 0): ?>
                    <span class="unread-red-badge" title="<?= (int)$totalAdminUnread ?> unread customer message(s)"><?= (int)$totalAdminUnread ?></span>
                <?php endif; ?>
            </a>
            <a href="#adminMaterialsSection" class="oms-nav-item">
                <span>Materials &amp; Staff</span>
            </a>
            <a href="index.php?route=home" class="oms-nav-item">
                <span>Storefront Home</span>
            </a>
        </nav>

        <div class="oms-sidebar-footer">
            <div class="oms-admin-identity">
                <strong><?= htmlspecialchars($_SESSION['admin_email'] ?? 'admin@liliaandrowena.com') ?></strong>
                <span>Authorized Workshop Admin · Asia/Manila</span>
            </div>
            <a href="index.php?route=logout" class="oms-signout-btn">⏻ Sign Out Admin</a>
        </div>
    </aside>

    <!-- MAIN ADMIN WORKSPACE -->
    <div class="oms-main-content">
        <!-- TOP HEADER BAR -->
        <div class="oms-topbar">
            <div>
                <span class="oms-kicker">JOB ORDERS TRACKING: <?= strtoupper(htmlspecialchars($tabLabels[$activeTab] ?? 'DEADLINE TODAY')) ?></span>
                <h1 class="oms-page-title">Job Orders &amp; Deadline Management</h1>
                <p class="oms-page-subtitle">
                    <strong><?= (int)($summaryCounts['deadlineToday'] ?? 0) ?> deadline today orders</strong>
                    <span aria-hidden="true">·</span>
                    <span>Manila Date (PHT): <code><?= htmlspecialchars($todayManila) ?></code></span>
                </p>
            </div>
            <div class="oms-topbar-actions">
                <a href="index.php?route=admin_dashboard&amp;tab=<?= urlencode($activeTab) ?>" class="btn-sm-soft">↻ Refresh Data</a>
                <a href="index.php?route=home" class="btn-sm-soft">View Storefront</a>
                <a href="index.php?route=logout" class="btn-sm-primary" style="background-color: #dc2626;">Logout</a>
            </div>
        </div>

        <?php if (!empty($adminMessage)): ?>
            <div class="oms-alert-success">
                ✓ <?= htmlspecialchars($adminMessage) ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($adminError)): ?>
            <div class="oms-alert-error">
                <?= htmlspecialchars($adminError) ?>
            </div>
        <?php endif; ?>

        <!-- 4. DASHBOARD SUMMARY CARDS (All numbers from MySQL database) -->
        <div class="oms-kpi-grid">
            <a href="index.php?route=admin_dashboard&amp;tab=all" class="oms-kpi-card">
                <span class="oms-kpi-label">Total Orders</span>
                <strong class="oms-kpi-value"><?= (int)($summaryCounts['totalOrders'] ?? 0) ?></strong>
                <span class="oms-kpi-foot">All recorded job orders</span>
            </a>

            <a href="index.php?route=admin_dashboard&amp;tab=deadline_today" class="oms-kpi-card kpi-due-today">
                <span class="oms-kpi-label">Deadline Today</span>
                <strong class="oms-kpi-value"><?= (int)($summaryCounts['deadlineToday'] ?? 0) ?></strong>
                <span class="oms-kpi-foot">Due today (<?= htmlspecialchars($todayManila) ?>)</span>
            </a>

            <a href="index.php?route=admin_dashboard&amp;tab=overdue" class="oms-kpi-card kpi-overdue">
                <span class="oms-kpi-label">Overdue Orders</span>
                <strong class="oms-kpi-value"><?= (int)($summaryCounts['overdueOrders'] ?? 0) ?></strong>
                <span class="oms-kpi-foot">Unfinished past deadline</span>
            </a>

            <a href="index.php?route=admin_dashboard&amp;tab=active&amp;status=Pending" class="oms-kpi-card kpi-pending">
                <span class="oms-kpi-label">Pending Orders</span>
                <strong class="oms-kpi-value"><?= (int)($summaryCounts['pendingOrders'] ?? 0) ?></strong>
                <span class="oms-kpi-foot">Awaiting confirmation</span>
            </a>

            <a href="index.php?route=admin_dashboard&amp;tab=all&amp;status=Completed" class="oms-kpi-card kpi-completed">
                <span class="oms-kpi-label">Completed Orders</span>
                <strong class="oms-kpi-value"><?= (int)($summaryCounts['completedOrders'] ?? 0) ?></strong>
                <span class="oms-kpi-foot">Finished &amp; delivered</span>
            </a>
        </div>

        <!-- 2 & 3. JOB ORDERS TRACKING & DEADLINE TODAY BOARD -->
        <div class="oms-board-card">
            <!-- 6 TABS: Deadline Today, Orders Today, Overdue Orders, Active Orders, Unpaid Orders, All Orders -->
            <div class="oms-tabs-bar" role="tablist">
                <a href="index.php?route=admin_dashboard&amp;tab=deadline_today" class="oms-tab-link <?= $activeTab === 'deadline_today' ? 'active tab-danger' : '' ?>">
                    <span>Deadline Today</span>
                    <span class="oms-tab-badge badge-danger"><?= (int)($summaryCounts['deadlineToday'] ?? 0) ?></span>
                </a>
                <a href="index.php?route=admin_dashboard&amp;tab=orders_today" class="oms-tab-link <?= $activeTab === 'orders_today' ? 'active' : '' ?>">
                    <span>Orders Today</span>
                    <span class="oms-tab-badge"><?= (int)($summaryCounts['ordersToday'] ?? 0) ?></span>
                </a>
                <a href="index.php?route=admin_dashboard&amp;tab=overdue" class="oms-tab-link <?= $activeTab === 'overdue' ? 'active tab-danger' : '' ?>">
                    <span>Overdue Orders</span>
                    <span class="oms-tab-badge badge-danger"><?= (int)($summaryCounts['overdueOrders'] ?? 0) ?></span>
                </a>
                <a href="index.php?route=admin_dashboard&amp;tab=active" class="oms-tab-link <?= $activeTab === 'active' ? 'active' : '' ?>">
                    <span>Active Orders</span>
                    <span class="oms-tab-badge"><?= (int)($summaryCounts['activeOrders'] ?? 0) ?></span>
                </a>
                <a href="index.php?route=admin_dashboard&amp;tab=unpaid" class="oms-tab-link <?= $activeTab === 'unpaid' ? 'active' : '' ?>">
                    <span>Unpaid Orders</span>
                    <span class="oms-tab-badge"><?= (int)($summaryCounts['unpaidOrders'] ?? 0) ?></span>
                </a>
                <a href="index.php?route=admin_dashboard&amp;tab=all" class="oms-tab-link <?= $activeTab === 'all' ? 'active' : '' ?>">
                    <span>All Orders</span>
                    <span class="oms-tab-badge"><?= (int)($summaryCounts['totalOrders'] ?? 0) ?></span>
                </a>
            </div>

            <!-- FINANCIAL SUMMARY BAR (Matches PrintOMS reference) -->
            <div class="oms-financial-strip">
                <div>
                    <span>Total Amount:</span>
                    <strong>₱<?= number_format($tabTotalAmount, 2) ?></strong>
                </div>
                <span class="oms-strip-sep">|</span>
                <div>
                    <span>Total Due:</span>
                    <strong style="color: #dc2626;">₱<?= number_format($tabTotalDue, 2) ?></strong>
                </div>
                <span class="oms-strip-sep">|</span>
                <div>
                    <span>Paid:</span>
                    <strong style="color: #15803d;">₱<?= number_format($tabTotalPaid, 2) ?></strong>
                </div>
            </div>

            <!-- SEARCH, FILTER & SORT CONTROLS -->
            <form action="index.php" method="GET" class="oms-filter-bar">
                <input type="hidden" name="route" value="admin_dashboard">
                <input type="hidden" name="tab" value="<?= htmlspecialchars($activeTab) ?>">

                <div class="oms-search-input-wrap">
                    <input type="text" name="search" value="<?= htmlspecialchars($searchQuery) ?>" placeholder="Search by Job Order ID (e.g. JO-2026-1001 or 1001), customer name, phone, or furniture..." aria-label="Search Job Orders">
                </div>

                <select name="status" aria-label="Filter by Order Status">
                    <option value="ALL" <?= $statusFilter === 'ALL' ? 'selected' : '' ?>>All Statuses</option>
                    <?php foreach (JobOrder::ALLOWED_STATUSES as $stOption): ?>
                        <option value="<?= htmlspecialchars($stOption) ?>" <?= $statusFilter === $stOption ? 'selected' : '' ?>><?= htmlspecialchars($stOption) ?></option>
                    <?php endforeach; ?>
                </select>

                <select name="priority" aria-label="Filter by Priority">
                    <option value="ALL" <?= $priorityFilter === 'ALL' ? 'selected' : '' ?>>All Priorities</option>
                    <?php foreach (JobOrder::ALLOWED_PRIORITIES as $prOption): ?>
                        <option value="<?= htmlspecialchars($prOption) ?>" <?= $priorityFilter === $prOption ? 'selected' : '' ?>><?= htmlspecialchars($prOption) ?></option>
                    <?php endforeach; ?>
                </select>

                <select name="deadline_filter" aria-label="Filter by Deadline">
                    <option value="ALL" <?= $deadlineFilter === 'ALL' ? 'selected' : '' ?>>All Deadlines</option>
                    <option value="DUE_TODAY" <?= $deadlineFilter === 'DUE_TODAY' ? 'selected' : '' ?>>Due Today Only</option>
                    <option value="OVERDUE" <?= $deadlineFilter === 'OVERDUE' ? 'selected' : '' ?>>Overdue Only</option>
                    <option value="UPCOMING" <?= $deadlineFilter === 'UPCOMING' ? 'selected' : '' ?>>Upcoming Deadlines</option>
                </select>

                <select name="sort" aria-label="Sort Orders">
                    <option value="deadline_asc" <?= $sortBy === 'deadline_asc' ? 'selected' : '' ?>>Deadline: Earliest ↑</option>
                    <option value="deadline_desc" <?= $sortBy === 'deadline_desc' ? 'selected' : '' ?>>Deadline: Latest ↓</option>
                    <option value="priority_desc" <?= $sortBy === 'priority_desc' ? 'selected' : '' ?>>Priority: Urgent First</option>
                    <option value="id_desc" <?= $sortBy === 'id_desc' ? 'selected' : '' ?>>Order ID: Newest First</option>
                </select>

                <button type="submit" class="btn-sm-primary">Apply Filters</button>
                <a href="index.php?route=admin_dashboard&amp;tab=<?= urlencode($activeTab) ?>" class="btn-sm-soft">Reset</a>
            </form>

            <!-- JOB ORDERS TABLE (11 Required Columns) -->
            <div class="oms-table-wrap">
                <table class="oms-job-table">
                    <thead>
                        <tr>
                            <th>Job Order ID</th>
                            <th>Customer Name</th>
                            <th>Furniture Product</th>
                            <th>Qty</th>
                            <th>Order Status</th>
                            <th>Total Amount</th>
                            <th>Priority</th>
                            <th>Order Date</th>
                            <th>Assigned Staff</th>
                            <th>Deadline ↑</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($jobOrders)): ?>
                            <tr>
                                <td colspan="11" style="text-align: center; padding: 2.5rem 1rem; color: #64748b;">
                                    <strong>No Job Orders match the current filter (<?= htmlspecialchars($tabLabels[$activeTab] ?? 'All') ?>).</strong><br>
                                    <span style="font-size: 0.8rem;">Switch to <a href="index.php?route=admin_dashboard&amp;tab=all" style="color: #0284c7; font-weight: 700;">All Orders</a> or reset your search filters.</span>
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($jobOrders as $ord): ?>
                                <?php
                                $oid = (int)$ord['OrderID'];
                                $normStatus = $ord['NormalizedStatus'] ?? JobOrder::normalizeStatus((string)$ord['Status']);
                                $priority = (string)($ord['Priority'] ?? 'Normal');
                                $isOverdue = !empty($ord['IsOverdue']);
                                $isDueToday = !empty($ord['IsDeadlineToday']);

                                $rowClass = '';
                                if ($isOverdue) {
                                    $rowClass = 'oms-row-overdue';
                                } elseif ($priority === 'Urgent' || $isDueToday) {
                                    $rowClass = 'oms-row-urgent';
                                }

                                $statusBadgeClass = 'oms-status-pending';
                                if ($normStatus === 'Order Confirmed') $statusBadgeClass = 'oms-status-confirmed';
                                elseif ($normStatus === 'In Production') $statusBadgeClass = 'oms-status-production';
                                elseif ($normStatus === 'For Delivery') $statusBadgeClass = 'oms-status-delivery';
                                elseif ($normStatus === 'Completed') $statusBadgeClass = 'oms-status-completed';
                                elseif ($normStatus === 'Cancelled') $statusBadgeClass = 'oms-status-cancelled';

                                $priorityBadgeClass = 'oms-priority-normal';
                                if ($priority === 'Urgent') $priorityBadgeClass = 'oms-priority-urgent';
                                elseif ($priority === 'High') $priorityBadgeClass = 'oms-priority-high';
                                ?>
                                <tr class="<?= $rowClass ?>">
                                    <!-- 1. Job Order ID -->
                                    <td>
                                        <strong class="oms-jo-code"><?= htmlspecialchars($ord['JobOrderCode']) ?></strong>
                                        <small class="oms-sub-meta">Order #<?= $oid ?> · <?= (int)$ord['ItemCount'] ?> item(s)</small>
                                    </td>

                                    <!-- 2. Customer Name -->
                                    <td>
                                        <strong><?= htmlspecialchars($ord['CustomerName']) ?></strong>
                                        <small class="oms-sub-meta">Tel: <?= htmlspecialchars($ord['CustomerPhone']) ?></small>
                                    </td>

                                    <!-- 3. Furniture Product -->
                                    <td>
                                        <div class="oms-product-cell"><?= htmlspecialchars($ord['ProductSummary']) ?></div>
                                        <?php if (!empty($ord['JobNotes'])): ?>
                                            <small class="oms-sub-meta"><?= htmlspecialchars($ord['JobNotes']) ?></small>
                                        <?php endif; ?>
                                    </td>

                                    <!-- 4. Quantity -->
                                    <td style="font-variant-numeric: tabular-nums; font-weight: 700;">
                                        <?= (int)$ord['TotalQuantity'] ?> pcs
                                    </td>

                                    <!-- 5. Order Status -->
                                    <td>
                                        <span class="oms-status-pill <?= $statusBadgeClass ?>"><?= htmlspecialchars($normStatus) ?></span>
                                    </td>

                                    <!-- 6. Total Amount -->
                                    <td style="font-variant-numeric: tabular-nums;">
                                        <strong>₱<?= number_format((float)$ord['TotalAmount'], 2) ?></strong>
                                        <?php if ((float)$ord['BalanceDue'] > 0): ?>
                                            <small class="oms-sub-meta" style="color: #dc2626;">Bal: ₱<?= number_format((float)$ord['BalanceDue'], 2) ?></small>
                                        <?php else: ?>
                                            <small class="oms-sub-meta" style="color: #15803d;">Fully Paid</small>
                                        <?php endif; ?>
                                    </td>

                                    <!-- 7. Priority -->
                                    <td>
                                        <span class="oms-priority-pill <?= $priorityBadgeClass ?>">
                                            <?= $priority === 'Urgent' ? 'Urgent' : ($priority === 'High' ? 'High' : 'Normal') ?>
                                        </span>
                                    </td>

                                    <!-- 8. Order Date -->
                                    <td style="font-variant-numeric: tabular-nums;">
                                        <?= htmlspecialchars((string)$ord['OrderDate']) ?>
                                        <?php if (!empty($ord['IsCreatedToday'])): ?>
                                            <small class="oms-sub-meta" style="color: #0284c7; font-weight: 700;">Created Today</small>
                                        <?php endif; ?>
                                    </td>

                                    <!-- 9. Assigned Staff -->
                                    <td>
                                        <span class="oms-staff-chip">
                                            <?= htmlspecialchars($ord['AssignedStaffName'] ?: 'Unassigned') ?>
                                        </span>
                                    </td>

                                    <!-- 10. Deadline -->
                                    <td style="font-variant-numeric: tabular-nums;">
                                        <strong><?= htmlspecialchars((string)($ord['DueDate'] ?: 'Not Set')) ?></strong>
                                        <small class="oms-sub-meta"><?= htmlspecialchars(substr((string)($ord['DeadlineTime'] ?? '17:00'), 0, 5)) ?></small>
                                        <?php if ($isOverdue): ?>
                                            <span class="oms-dl-tag tag-overdue">OVERDUE</span>
                                        <?php elseif ($isDueToday): ?>
                                            <span class="oms-dl-tag tag-today">DUE TODAY</span>
                                        <?php endif; ?>
                                    </td>

                                    <!-- 11. Actions (View Details + Update Status, Deadline, Priority, Staff with CSRF) -->
                                    <td>
                                        <div style="display: flex; flex-direction: column; gap: 0.35rem; min-width: 210px;">
                                            <form action="index.php?route=admin_update_order" method="POST" class="oms-inline-edit-form">
                                                <?= Csrf::inputField() ?>
                                                <input type="hidden" name="order_id" value="<?= $oid ?>">
                                                <input type="hidden" name="return_tab" value="<?= htmlspecialchars($activeTab) ?>">

                                                <div style="display: flex; gap: 0.25rem;">
                                                    <select name="status" title="Order Status" style="flex: 1; padding: 0.25rem; font-size: 0.72rem; border: 1px solid #cbd5e1; border-radius: 4px;">
                                                        <?php foreach (JobOrder::ALLOWED_STATUSES as $st): ?>
                                                            <option value="<?= htmlspecialchars($st) ?>" <?= $normStatus === $st ? 'selected' : '' ?>><?= htmlspecialchars($st) ?></option>
                                                        <?php endforeach; ?>
                                                    </select>
                                                    <select name="priority" title="Priority" style="width: 78px; padding: 0.25rem; font-size: 0.72rem; border: 1px solid #cbd5e1; border-radius: 4px;">
                                                        <?php foreach (JobOrder::ALLOWED_PRIORITIES as $pr): ?>
                                                            <option value="<?= htmlspecialchars($pr) ?>" <?= $priority === $pr ? 'selected' : '' ?>><?= htmlspecialchars($pr) ?></option>
                                                        <?php endforeach; ?>
                                                    </select>
                                                </div>

                                                <div style="display: flex; gap: 0.25rem; margin-top: 0.25rem;">
                                                    <input type="date" name="due_date" value="<?= htmlspecialchars((string)$ord['DueDate']) ?>" title="Deadline Date" style="flex: 1; padding: 0.22rem; font-size: 0.72rem; border: 1px solid #cbd5e1; border-radius: 4px;">
                                                    <select name="assigned_employee_id" title="Assigned Staff" style="width: 95px; padding: 0.22rem; font-size: 0.72rem; border: 1px solid #cbd5e1; border-radius: 4px;">
                                                        <option value="">Staff...</option>
                                                        <?php foreach ($employees as $emp): ?>
                                                            <option value="<?= (int)$emp['EmployeeID'] ?>" <?= (int)($ord['AssignedEmployeeID'] ?? 0) === (int)$emp['EmployeeID'] ? 'selected' : '' ?>>
                                                                <?= htmlspecialchars($emp['FullName']) ?>
                                                            </option>
                                                        <?php endforeach; ?>
                                                    </select>
                                                    <button type="submit" class="btn-sm-primary" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;">Save</button>
                                                </div>
                                            </form>
                                            <?php
                                            $custIdForRow = (int)($ord['CustomerID'] ?? 0);
                                            $rowUnread = (int)($unreadByCustomer[$custIdForRow] ?? 0);
                                            ?>
                                            <a href="index.php?route=admin_dashboard&amp;tab=<?= urlencode($activeTab) ?>&amp;view_order_id=<?= $oid ?>#jobOrderDetailBox" class="btn-sm-soft" style="display: flex; align-items: center; justify-content: center; gap: 0.4rem; text-align: center; font-size: 0.72rem; padding: 0.25rem 0.5rem;">
                                                <span>Order Details &amp; Messages</span>
                                                <?php if ($rowUnread > 0): ?>
                                                    <span class="unread-red-badge" title="<?= $rowUnread ?> unread message(s)"><?= $rowUnread ?></span>
                                                <?php endif; ?>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- DETAILED ORDER VIEW & ORDER MANAGEMENT MESSAGES PANEL (When Admin clicks View Order Details & Messages) -->
        <?php if (!empty($viewOrderDetail)): ?>
            <?php
            $loggedInAdminId = (int)($_SESSION['admin_id'] ?? 1);
            $detailCustId = (int)($viewOrderDetail['CustomerID'] ?? 1);
            ?>
            <div id="jobOrderDetailBox" class="oms-board-card" style="padding: 1.5rem; margin-bottom: 2rem; border: 2px solid #0284c7;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <span class="oms-kicker">Job Order Specification &amp; Customer Messages</span>
                        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem;">Job Order #JO-2026-<?= str_pad((string)$viewOrderDetail['OrderID'], 4, '0', STR_PAD_LEFT) ?> — <?= htmlspecialchars($viewOrderDetail['CustomerName']) ?></h3>
                    </div>
                    <a href="index.php?route=admin_dashboard&amp;tab=<?= urlencode($activeTab) ?>" class="btn-sm-soft">✕ Close Details</a>
                </div>
                <div class="form-row-2" style="font-size: 0.84rem; gap: 1.25rem; margin-bottom: 1.25rem;">
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <strong>Customer &amp; Delivery Information</strong>
                        <p style="margin-top: 0.4rem;">• <strong>Customer:</strong> <?= htmlspecialchars($viewOrderDetail['CustomerName']) ?> (<?= htmlspecialchars($viewOrderDetail['Email']) ?>)</p>
                        <p>• <strong>Phone:</strong> <?= htmlspecialchars($viewOrderDetail['PhoneNumber']) ?></p>
                        <p>• <strong>Order Date:</strong> <?= htmlspecialchars((string)$viewOrderDetail['OrderDate']) ?> · <strong>Deadline:</strong> <?= htmlspecialchars((string)$viewOrderDetail['DueDate']) ?></p>
                        <p>• <strong>Status:</strong> <?= htmlspecialchars((string)$viewOrderDetail['Status']) ?> · <strong>Priority:</strong> <?= htmlspecialchars((string)($viewOrderDetail['Priority'] ?? 'Normal')) ?></p>
                    </div>
                    <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <strong>Ordered Furniture Pieces</strong>
                        <?php foreach (($viewOrderDetail['items'] ?? []) as $item): ?>
                            <p style="margin-top: 0.4rem;">
                                • <strong><?= htmlspecialchars($item['ProductName'] ?? 'Custom Piece') ?></strong> (<?= htmlspecialchars($item['ItemType']) ?>) — Qty: <?= (int)$item['Quantity'] ?> × ₱<?= number_format((float)$item['UnitPrice'], 2) ?>
                                <?php if (!empty($item['ColorFinish']) || !empty($item['Length'])): ?>
                                    <br><small style="color: #0369a1;">Specs: <?= htmlspecialchars((string)$item['Length']) ?>L × <?= htmlspecialchars((string)$item['Width']) ?>W × <?= htmlspecialchars((string)$item['Height']) ?>H cm · <?= htmlspecialchars((string)$item['ColorFinish']) ?></small>
                                <?php endif; ?>
                            </p>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Order Conversation inside Order Management -->
                <div style="background: #f8fafc; border: 1px solid #bae6fd; border-radius: 10px; padding: 1.15rem;">
                    <h4 style="margin: 0 0 0.65rem; font-size: 1rem; color: #0f172a;">Order Management Conversation with <?= htmlspecialchars($viewOrderDetail['CustomerName']) ?></h4>
                    <div class="chat-feed-box" style="height: 220px; background: #ffffff; margin-bottom: 0.85rem;">
                        <?php if (empty($orderMessages)): ?>
                            <p style="text-align: center; color: #64748b; padding: 1.5rem;">No messages for this customer order yet.</p>
                        <?php else: ?>
                            <?php foreach ($orderMessages as $m): ?>
                                <?php
                                $msgSenderRole = strtolower(trim($m['SenderRole'] ?? 'customer'));
                                $isOwnAdminMessage = ($msgSenderRole === 'admin');
                                $rowClass = $isOwnAdminMessage ? 'chat-row own-row' : 'chat-row other-row';
                                $bubbleClass = $isOwnAdminMessage ? 'chat-bubble msg-own' : 'chat-bubble msg-other';
                                $senderLabel = $isOwnAdminMessage
                                    ? htmlspecialchars($m['SenderName']) . ' (You)'
                                    : htmlspecialchars($m['SenderName']) . ' (Customer)';
                                ?>
                                <div class="<?= $rowClass ?>">
                                    <div class="<?= $bubbleClass ?>">
                                        <div class="chat-bubble-meta">
                                            <strong><?= $senderLabel ?> · Order #<?= htmlspecialchars((string)($m['OrderID'] ?? $viewOrderDetail['OrderID'])) ?></strong>
                                            <span><?= htmlspecialchars($m['Topic']) ?> · <?= htmlspecialchars($m['CreatedAt']) ?></span>
                                        </div>
                                        <div><?= nl2br(htmlspecialchars($m['MessageText'])) ?></div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    <form action="index.php?route=messages_send" method="POST" style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                        <?= Csrf::inputField() ?>
                        <input type="hidden" name="sender_role" value="Admin">
                        <input type="hidden" name="customer_id" value="<?= $detailCustId ?>">
                        <input type="hidden" name="order_id" value="<?= (int)$viewOrderDetail['OrderID'] ?>">
                        <input type="hidden" name="topic" value="Order #<?= (int)$viewOrderDetail['OrderID'] ?> Update">
                        <input type="text" name="message_text" required placeholder="Send update regarding Job Order #JO-2026-<?= str_pad((string)$viewOrderDetail['OrderID'], 4, '0', STR_PAD_LEFT) ?>..." style="flex: 1; padding: 0.55rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.82rem;">
                        <button type="submit" class="btn-sm-primary">Send Order Reply →</button>
                    </form>
                </div>
            </div>
        <?php endif; ?>

        <!-- CUSTOMER MESSAGES & ORDER FOLLOW-UP SECTION INSIDE ORDER MANAGEMENT -->
        <div id="adminConversationsSection" style="background: #f0f7ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.85rem;">
                <div>
                    <span class="oms-kicker" style="color: #0284c7;">PRIVATE 1-ON-1 CUSTOMER CONVERSATIONS (Table: Order_Message)</span>
                    <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin: 0;">Customer Messages &amp; Order Follow-Up</h3>
                    <p style="font-size: 0.82rem; color: #475569; margin: 0.25rem 0 0;">
                        Select a customer conversation below to view their order messages and send a private reply.
                    </p>
                </div>
                <span class="hero-est-tag" style="background: #dcfce7; color: #15803d; border-color: #bbf7d0;">● Conversation #<?= (int)($selectedCustomerId ?? 1) ?> Active</span>
            </div>

            <?php if (!empty($conversations)): ?>
                <div style="background: #ffffff; border: 1px solid #bae6fd; border-radius: 8px; padding: 0.75rem 0.9rem; margin-bottom: 0.9rem;">
                    <strong style="font-size: 0.74rem; color: #075985; display: block; margin-bottom: 0.45rem;">Select Customer Conversation:</strong>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <?php foreach ($conversations as $conv): ?>
                            <?php
                            $cid = (int)$conv['CustomerID'];
                            $cUnread = (int)($conv['UnreadCount'] ?? 0);
                            ?>
                            <a href="index.php?route=admin_dashboard&amp;tab=<?= urlencode($activeTab) ?>&amp;customer_id=<?= $cid ?>#adminConversationsSection"
                               class="<?= $cid === (int)($selectedCustomerId ?? 1) ? 'btn-sm-primary' : 'btn-sm-soft' ?>"
                               style="display: inline-flex; align-items: center; gap: 0.4rem;">
                                <span><?= htmlspecialchars($conv['FullName']) ?> (Customer #<?= $cid ?> · <?= (int)$conv['MessageCount'] ?> msgs)</span>
                                <?php if ($cUnread > 0): ?>
                                    <span class="unread-red-badge"><?= $cUnread ?></span>
                                <?php endif; ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endif; ?>

            <div class="chat-feed-box" style="height: 220px; background: #ffffff; margin-bottom: 0.85rem;">
                <?php if (empty($messages)): ?>
                    <p style="text-align: center; color: #64748b; padding: 1.5rem;">No messages in this customer's conversation yet.</p>
                <?php else: ?>
                    <?php foreach ($messages as $m): ?>
                        <?php
                        $msgSenderRole = strtolower(trim($m['SenderRole'] ?? 'customer'));
                        $isOwnAdminMessage = ($msgSenderRole === 'admin');
                        $rowClass = $isOwnAdminMessage ? 'chat-row own-row' : 'chat-row other-row';
                        $bubbleClass = $isOwnAdminMessage ? 'chat-bubble msg-own' : 'chat-bubble msg-other';
                        $senderLabel = $isOwnAdminMessage
                            ? htmlspecialchars($m['SenderName']) . ' (You)'
                            : htmlspecialchars($m['SenderName']) . ' (Customer)';
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
                <?= Csrf::inputField() ?>
                <input type="hidden" name="sender_role" value="Admin">
                <input type="hidden" name="customer_id" value="<?= (int)($selectedCustomerId ?? 1) ?>">
                <input type="hidden" name="order_id" value="<?= ((int)($selectedCustomerId ?? 1) === 2) ? '1002' : '1001' ?>">
                <input type="hidden" name="topic" value="Workshop Admin Reply">
                <input type="text" name="message_text" required placeholder="Reply privately to Customer #<?= (int)($selectedCustomerId ?? 1) ?>..." style="flex: 1; padding: 0.55rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.82rem; background: #ffffff;">
                <button type="submit" class="btn-sm-primary">Send Admin Reply →</button>
            </form>
        </div>

        <!-- 2. RAW MATERIALS & WORKSHOP EMPLOYEES -->
        <div id="adminMaterialsSection" class="form-row-2" style="gap: 1.5rem; margin-bottom: 2rem;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                <h3 style="font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 0.85rem;">Raw Materials Stock (Table: Material)</h3>
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
                                <td style="padding: 0.5rem;"><?= htmlspecialchars((string)$m['StockQuantity']) ?> <?= htmlspecialchars($m['Unit']) ?></td>
                                <td style="padding: 0.5rem;"><?= htmlspecialchars($m['SupplierName']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                <h3 style="font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 0.85rem;">Workshop Staff (Table: Employee)</h3>
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
    </div>
</div>
