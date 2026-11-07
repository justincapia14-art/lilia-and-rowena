import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCustomerUnreadCount,
  getAdminUnreadBreakdown,
  markConversationMessagesRead,
  formatFullDeliveryAddress,
  setCustomerDefaultAddress,
  OrderMessageRecord,
  CustomerAddressRecord
} from './profileAndNotifications';

const sampleMessages: OrderMessageRecord[] = [
  {
    MessageID: 1,
    CustomerID: 1,
    OrderID: 1001,
    AdminID: null,
    SenderRole: 'Customer',
    SenderName: 'Maria Teresa Santos',
    Topic: 'Order Follow-Up (#1001)',
    MessageText: 'Good day! How is our table progressing?',
    CreatedAt: '2026-11-06 09:15:00',
    IsRead: 0
  },
  {
    MessageID: 2,
    CustomerID: 1,
    OrderID: 1001,
    AdminID: 1,
    SenderRole: 'Admin',
    SenderName: 'Rowena & Lilia (Workshop Admin)',
    Topic: 'Order Follow-Up (#1001)',
    MessageText: 'Final walnut coat is being applied today!',
    CreatedAt: '2026-11-06 09:22:00',
    IsRead: 0
  },
  {
    MessageID: 3,
    CustomerID: 2,
    OrderID: 1002,
    AdminID: null,
    SenderRole: 'Customer',
    SenderName: 'Atty. Roberto Mendoza',
    Topic: 'Add Custom Request (#1002)',
    MessageText: 'Can we add 2 bolster pillows?',
    CreatedAt: '2026-11-06 10:05:00',
    IsRead: 0
  }
];

test('Customer unread count only counts unread Admin replies in their own conversation', () => {
  // Customer 1 has 1 unread Admin message (MessageID 2) and 1 own message (MessageID 1)
  assert.equal(getCustomerUnreadCount(sampleMessages, 1), 1);
  // Customer 2 has 0 unread Admin messages (only their own message MessageID 3)
  assert.equal(getCustomerUnreadCount(sampleMessages, 2), 0);
});

test('Admin unread breakdown counts only unread Customer messages per customer and order', () => {
  const breakdown = getAdminUnreadBreakdown(sampleMessages);
  assert.equal(breakdown.totalUnread, 2);
  assert.equal(breakdown.byCustomer[1], 1);
  assert.equal(breakdown.byCustomer[2], 1);
  assert.equal(breakdown.byOrder[1001], 1);
  assert.equal(breakdown.byOrder[1002], 1);
});

test('Marking conversation read updates only the opposite party unread messages', () => {
  const afterCustomerRead = markConversationMessagesRead(sampleMessages, 1, 'customer');
  assert.equal(getCustomerUnreadCount(afterCustomerRead, 1), 0);
  // Admin still has Customer 1's message unread
  assert.equal(getAdminUnreadBreakdown(afterCustomerRead).byCustomer[1], 1);

  const afterAdminRead = markConversationMessagesRead(afterCustomerRead, 1, 'admin');
  assert.equal(getAdminUnreadBreakdown(afterAdminRead).byCustomer[1] || 0, 0);
  assert.equal(getAdminUnreadBreakdown(afterAdminRead).totalUnread, 1);
});

test('Address formatting and default switching preserve customer ownership and order snapshots', () => {
  const addresses: CustomerAddressRecord[] = [
    {
      addressId: 101,
      customerId: 1,
      recipientName: 'Maria Teresa Santos',
      phone: '0917-123-4567',
      houseStreet: 'Unit 14B, Tower 2, Serendra',
      barangay: 'Fort Bonifacio',
      city: 'Taguig City',
      province: 'Metro Manila',
      postalCode: '1634',
      deliveryInstructions: 'Lobby concierge drop-off',
      label: 'Home',
      isDefault: true
    },
    {
      addressId: 102,
      customerId: 1,
      recipientName: 'Maria Teresa Santos',
      phone: '0917-123-4567',
      houseStreet: '18F One Corporate Centre, Julia Vargas Ave',
      barangay: 'San Antonio',
      city: 'Pasig City',
      province: 'Metro Manila',
      postalCode: '1605',
      label: 'Work',
      isDefault: false
    }
  ];

  const orderSnapshotAddress = formatFullDeliveryAddress(addresses[0]);
  assert.equal(
    orderSnapshotAddress,
    'Unit 14B, Tower 2, Serendra, Brgy. Fort Bonifacio, Taguig City, Metro Manila, 1634 (Lobby concierge drop-off)'
  );

  const updated = setCustomerDefaultAddress(addresses, 1, 102);
  assert.equal(updated[0].isDefault, false);
  assert.equal(updated[1].isDefault, true);
  // Snapshot taken at order placement remains unchanged even after default or address edits
  assert.ok(orderSnapshotAddress.includes('Unit 14B, Tower 2, Serendra'));
});
