export interface OrderMessageRecord {
  MessageID: number;
  CustomerID: number;
  OrderID?: number | null;
  AdminID?: number | null;
  SenderRole: 'Customer' | 'Admin';
  SenderName: string;
  Topic: string;
  MessageText: string;
  CreatedAt: string;
  IsRead: boolean | number;
}

export interface CustomerAddressRecord {
  addressId: number;
  customerId: number;
  recipientName: string;
  phone: string;
  houseStreet: string;
  barangay: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryInstructions?: string;
  label: 'Home' | 'Work';
  isDefault: boolean;
}

/**
 * Calculate unread message count for a specific Customer.
 * Rules:
 * - Only count messages belonging to this customer's conversation (CustomerID === customerId).
 * - Never count messages sent by the customer themselves (only count SenderRole === 'Admin').
 * - Only count messages where IsRead is false / 0.
 */
export function getCustomerUnreadCount(
  messages: OrderMessageRecord[],
  customerId: number
): number {
  const cid = Number(customerId);
  if (!cid || cid <= 0) return 0;
  let count = 0;
  for (const m of messages) {
    if (
      Number(m.CustomerID) === cid &&
      String(m.SenderRole).toLowerCase() === 'admin' &&
      !Boolean(Number(m.IsRead))
    ) {
      count++;
    }
  }
  return count;
}

/**
 * Calculate unread message counts for Admin across all customer conversations and orders.
 * Rules:
 * - Never count messages sent by Admin (only count SenderRole === 'Customer').
 * - Only count messages where IsRead is false / 0.
 */
export function getAdminUnreadBreakdown(messages: OrderMessageRecord[]): {
  totalUnread: number;
  byCustomer: Record<number, number>;
  byOrder: Record<number, number>;
} {
  let totalUnread = 0;
  const byCustomer: Record<number, number> = {};
  const byOrder: Record<number, number> = {};

  for (const m of messages) {
    if (
      String(m.SenderRole).toLowerCase() === 'customer' &&
      !Boolean(Number(m.IsRead))
    ) {
      totalUnread++;
      const cid = Number(m.CustomerID);
      if (cid > 0) {
        byCustomer[cid] = (byCustomer[cid] || 0) + 1;
      }
      const oid = Number(m.OrderID || 0);
      if (oid > 0) {
        byOrder[oid] = (byOrder[oid] || 0) + 1;
      }
    }
  }

  return { totalUnread, byCustomer, byOrder };
}

/**
 * Mark messages as read in a customer's conversation when opened by viewerRole ('customer' | 'admin').
 * - When 'customer' opens the conversation, Admin's messages to that customer are marked IsRead = 1.
 * - When 'admin' opens the conversation, Customer's messages in that conversation are marked IsRead = 1.
 */
export function markConversationMessagesRead(
  messages: OrderMessageRecord[],
  customerId: number,
  viewerRole: 'customer' | 'admin'
): OrderMessageRecord[] {
  const cid = Number(customerId);
  const role = viewerRole.toLowerCase();
  return messages.map((m) => {
    if (Number(m.CustomerID) !== cid) return m;
    const sender = String(m.SenderRole).toLowerCase();
    if (role === 'customer' && sender === 'admin' && !Boolean(Number(m.IsRead))) {
      return { ...m, IsRead: 1 };
    }
    if (role === 'admin' && sender === 'customer' && !Boolean(Number(m.IsRead))) {
      return { ...m, IsRead: 1 };
    }
    return m;
  });
}

/**
 * Format a structured Shopee-style CustomerAddressRecord into a single delivery address snapshot string.
 */
export function formatFullDeliveryAddress(addr: CustomerAddressRecord): string {
  const parts = [
    addr.houseStreet.trim(),
    addr.barangay ? `Brgy. ${addr.barangay.replace(/^brgy\.?\s*/i, '').trim()}` : '',
    addr.city.trim(),
    addr.province.trim(),
    addr.postalCode.trim()
  ].filter(Boolean);
  const base = parts.join(', ');
  if (addr.deliveryInstructions && addr.deliveryInstructions.trim()) {
    return `${base} (${addr.deliveryInstructions.trim()})`;
  }
  return base;
}

/**
 * Set a specific address as default for a customer, ensuring all other addresses for that customer have isDefault = false.
 */
export function setCustomerDefaultAddress(
  addresses: CustomerAddressRecord[],
  customerId: number,
  targetAddressId: number
): CustomerAddressRecord[] {
  const cid = Number(customerId);
  const aid = Number(targetAddressId);
  const exists = addresses.some((a) => a.customerId === cid && a.addressId === aid);
  if (!exists) return addresses;

  return addresses.map((a) => {
    if (a.customerId !== cid) return a;
    return {
      ...a,
      isDefault: a.addressId === aid
    };
  });
}
