import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JobOrderRecord,
  computeDashboardSummary,
  filterAndSortJobOrders,
  isDeadlineToday,
  isOrderCreatedToday,
  isOrderOverdue
} from './jobOrderFilters';

const TODAY = '2026-11-07';

const sampleJobOrders: JobOrderRecord[] = [
  {
    orderId: 1001,
    jobOrderCode: 'JO-2026-1001',
    customerId: 1,
    customerName: 'Maria Teresa Santos',
    productName: 'Mahogany 6-Seater Dining Set',
    quantity: 1,
    status: 'In Production',
    totalAmount: 30450,
    totalPaid: 15225,
    priority: 'Urgent',
    orderDate: '2026-10-24',
    assignedStaff: 'Master Carding Santos',
    deadline: '2026-11-07',
    deadlineTime: '08:00'
  },
  {
    orderId: 1002,
    jobOrderCode: 'JO-2026-1002',
    customerId: 2,
    customerName: 'Atty. Roberto Mendoza',
    productName: 'Scandinavian Sky Blue Lounge Sofa',
    quantity: 1,
    status: 'Order Confirmed',
    totalAmount: 34000,
    totalPaid: 17000,
    priority: 'High',
    orderDate: '2026-11-07',
    assignedStaff: 'Master Eddie Manalo',
    deadline: '2026-11-12',
    deadlineTime: '14:00'
  },
  {
    orderId: 1003,
    jobOrderCode: 'JO-2026-1003',
    customerId: 1,
    customerName: 'Engr. Danica Gomez',
    productName: 'Minimalist Teak King Bedframe',
    quantity: 1,
    status: 'Pending',
    totalAmount: 42500,
    totalPaid: 21250,
    priority: 'Urgent',
    orderDate: '2026-10-20',
    assignedStaff: 'Dante Cruz',
    deadline: '2026-11-04',
    deadlineTime: '17:00'
  },
  {
    orderId: 1004,
    jobOrderCode: 'JO-2026-1004',
    customerId: 2,
    customerName: 'Dr. Ronald Ramos',
    productName: 'Executive Ergonomic Oak Desk',
    quantity: 2,
    status: 'Completed',
    totalAmount: 49000,
    totalPaid: 49000,
    priority: 'Normal',
    orderDate: '2026-10-15',
    assignedStaff: 'Rene Ocampo',
    deadline: '2026-11-01',
    deadlineTime: '11:00'
  }
];

test('distinguishes Deadline Today from Orders Today and Overdue Orders', () => {
  // Order 1001: created Oct 24, deadline Nov 7 (TODAY) -> Deadline Today = true, Orders Today = false
  assert.equal(isDeadlineToday(sampleJobOrders[0], TODAY), true);
  assert.equal(isOrderCreatedToday(sampleJobOrders[0], TODAY), false);

  // Order 1002: created Nov 7 (TODAY), deadline Nov 12 -> Deadline Today = false, Orders Today = true
  assert.equal(isDeadlineToday(sampleJobOrders[1], TODAY), false);
  assert.equal(isOrderCreatedToday(sampleJobOrders[1], TODAY), true);

  // Order 1003: unfinished (Pending) with past deadline Nov 4 -> Overdue = true
  assert.equal(isOrderOverdue(sampleJobOrders[2], TODAY), true);

  // Order 1004: finished (Completed) with past deadline Nov 1 -> Overdue = false
  assert.equal(isOrderOverdue(sampleJobOrders[3], TODAY), false);
});

test('computes accurate dashboard KPI summary counts', () => {
  const summary = computeDashboardSummary(sampleJobOrders, TODAY);
  assert.equal(summary.totalOrders, 4);
  assert.equal(summary.deadlineToday, 1);
  assert.equal(summary.ordersToday, 1);
  assert.equal(summary.overdueOrders, 1);
  assert.equal(summary.pendingOrders, 1);
  assert.equal(summary.completedOrders, 1);
  assert.equal(summary.activeOrders, 3);
  assert.equal(summary.unpaidOrders, 3);
});

test('filters by tab, search query, priority, and sorts by deadline ascending', () => {
  const dueTodayList = filterAndSortJobOrders(sampleJobOrders, {
    tab: 'deadline_today',
    todayManila: TODAY
  });
  assert.equal(dueTodayList.length, 1);
  assert.equal(dueTodayList[0].orderId, 1001);

  const overdueList = filterAndSortJobOrders(sampleJobOrders, {
    tab: 'overdue',
    todayManila: TODAY
  });
  assert.equal(overdueList.length, 1);
  assert.equal(overdueList[0].orderId, 1003);

  const searchResult = filterAndSortJobOrders(sampleJobOrders, {
    tab: 'all',
    todayManila: TODAY,
    search: 'Roberto'
  });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].orderId, 1002);

  const sortedAll = filterAndSortJobOrders(sampleJobOrders, {
    tab: 'all',
    todayManila: TODAY,
    sortBy: 'deadline_asc'
  });
  assert.deepEqual(
    sortedAll.map((o) => o.orderId),
    [1004, 1003, 1001, 1002]
  );
});
