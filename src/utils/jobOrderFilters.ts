export type JobOrderStatus =
  | 'Pending'
  | 'Order Confirmed'
  | 'Confirmed'
  | 'In Production'
  | 'For Delivery'
  | 'Ready'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export type JobOrderPriority = 'Normal' | 'High' | 'Urgent';

export type JobOrderTab =
  | 'deadline_today'
  | 'orders_today'
  | 'overdue'
  | 'active'
  | 'unpaid'
  | 'all';

export interface JobOrderRecord {
  orderId: number;
  jobOrderCode: string;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  productName: string;
  quantity: number;
  status: JobOrderStatus;
  totalAmount: number;
  totalPaid: number;
  priority: JobOrderPriority;
  orderDate: string; // YYYY-MM-DD
  assignedStaff: string;
  deadline: string; // YYYY-MM-DD
  deadlineTime?: string;
}

export function normalizeOrderStatus(status: string): JobOrderStatus {
  const s = String(status || '').trim();
  if (s === 'Confirmed') return 'Order Confirmed';
  if (s === 'Ready') return 'For Delivery';
  if (s === 'Delivered') return 'Completed';
  const valid: JobOrderStatus[] = [
    'Pending',
    'Order Confirmed',
    'In Production',
    'For Delivery',
    'Completed',
    'Cancelled'
  ];
  return (valid.includes(s as JobOrderStatus) ? s : 'Pending') as JobOrderStatus;
}

export function isOrderFinished(status: string): boolean {
  const norm = normalizeOrderStatus(status);
  return norm === 'Completed' || norm === 'Cancelled';
}

export function isDeadlineToday(order: JobOrderRecord, todayManila: string): boolean {
  if ( normalizeOrderStatus(order.status) === 'Cancelled') return false;
  return String(order.deadline || '').slice(0, 10) === todayManila;
}

export function isOrderCreatedToday(order: JobOrderRecord, todayManila: string): boolean {
  return String(order.orderDate || '').slice(0, 10) === todayManila;
}

export function isOrderOverdue(order: JobOrderRecord, todayManila: string): boolean {
  if (isOrderFinished(order.status)) return false;
  const due = String(order.deadline || '').slice(0, 10);
  if (!due) return false;
  return due < todayManila;
}

export function isOrderActive(order: JobOrderRecord): boolean {
  const norm = normalizeOrderStatus(order.status);
  return (
    norm === 'Pending' ||
    norm === 'Order Confirmed' ||
    norm === 'In Production' ||
    norm === 'For Delivery'
  );
}

export function isOrderUnpaid(order: JobOrderRecord): boolean {
  if (normalizeOrderStatus(order.status) === 'Cancelled') return false;
  const balance = Math.max(0, Number(order.totalAmount || 0) - Number(order.totalPaid || 0));
  return balance > 0;
}

export function computeDashboardSummary(orders: JobOrderRecord[], todayManila: string) {
  let totalOrders = 0;
  let deadlineToday = 0;
  let overdueOrders = 0;
  let pendingOrders = 0;
  let completedOrders = 0;
  let ordersToday = 0;
  let activeOrders = 0;
  let unpaidOrders = 0;

  for (const ord of orders) {
    totalOrders++;
    const normStatus = normalizeOrderStatus(ord.status);
    if (isDeadlineToday(ord, todayManila)) deadlineToday++;
    if (isOrderOverdue(ord, todayManila)) overdueOrders++;
    if (normStatus === 'Pending') pendingOrders++;
    if (normStatus === 'Completed') completedOrders++;
    if (isOrderCreatedToday(ord, todayManila)) ordersToday++;
    if (isOrderActive(ord)) activeOrders++;
    if (isOrderUnpaid(ord)) unpaidOrders++;
  }

  return {
    totalOrders,
    deadlineToday,
    overdueOrders,
    pendingOrders,
    completedOrders,
    ordersToday,
    activeOrders,
    unpaidOrders
  };
}

export interface JobOrderFilterOptions {
  tab: JobOrderTab;
  todayManila: string;
  search?: string;
  statusFilter?: string;
  priorityFilter?: string;
  deadlineFilter?: string;
  sortBy?: 'deadline_asc' | 'deadline_desc' | 'id_desc' | 'priority_desc';
}

export function filterAndSortJobOrders(
  orders: JobOrderRecord[],
  options: JobOrderFilterOptions
): JobOrderRecord[] {
  const {
    tab,
    todayManila,
    search = '',
    statusFilter = 'ALL',
    priorityFilter = 'ALL',
    deadlineFilter = 'ALL',
    sortBy = 'deadline_asc'
  } = options;

  const q = search.trim().toLowerCase();

  const filtered = orders.filter((ord) => {
    // 1. Tab filter
    if (tab === 'deadline_today' && !isDeadlineToday(ord, todayManila)) return false;
    if (tab === 'orders_today' && !isOrderCreatedToday(ord, todayManila)) return false;
    if (tab === 'overdue' && !isOrderOverdue(ord, todayManila)) return false;
    if (tab === 'active' && !isOrderActive(ord)) return false;
    if (tab === 'unpaid' && !isOrderUnpaid(ord)) return false;

    // 2. Status filter
    if (statusFilter && statusFilter !== 'ALL') {
      if (normalizeOrderStatus(ord.status) !== normalizeOrderStatus(statusFilter)) {
        return false;
      }
    }

    // 3. Priority filter
    if (priorityFilter && priorityFilter !== 'ALL') {
      if (String(ord.priority).toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }
    }

    // 4. Deadline filter
    if (deadlineFilter === 'DUE_TODAY' && !isDeadlineToday(ord, todayManila)) return false;
    if (deadlineFilter === 'OVERDUE' && !isOrderOverdue(ord, todayManila)) return false;

    // 5. Search query (Job Order ID, code, customer name, product)
    if (q) {
      const haystack = [
        String(ord.orderId),
        ord.jobOrderCode,
        ord.customerName,
        ord.customerPhone || '',
        ord.customerEmail || '',
        ord.productName,
        ord.assignedStaff || ''
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const priorityRank: Record<string, number> = {
    Urgent: 3,
    High: 2,
    Normal: 1
  };

  return [...filtered].sort((a, b) => {
    if (sortBy === 'id_desc') {
      return b.orderId - a.orderId;
    }
    if (sortBy === 'priority_desc') {
      const diff = (priorityRank[b.priority] || 1) - (priorityRank[a.priority] || 1);
      if (diff !== 0) return diff;
    }
    const dateA = `${a.deadline || '9999-12-31'} ${a.deadlineTime || '17:00'}`;
    const dateB = `${b.deadline || '9999-12-31'} ${b.deadlineTime || '17:00'}`;
    if (sortBy === 'deadline_desc') {
      return dateB.localeCompare(dateA);
    }
    const cmp = dateA.localeCompare(dateB);
    if (cmp !== 0) return cmp;
    return (priorityRank[b.priority] || 1) - (priorityRank[a.priority] || 1);
  });
}
