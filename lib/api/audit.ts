/**
 * Simple audit logging utility for tracking important operations
 * In production, this should be replaced with a proper logging service
 * like Sentry, DataDog, or a custom audit log database table
 */

export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  details?: Record<string, unknown>;
}

// In-memory storage for development - replace with database in production
const auditLog: AuditLogEntry[] = [];
const MAX_LOG_ENTRIES = 1000;

/**
 * Log an audit event
 */
export function logAudit(entry: Omit<AuditLogEntry, "timestamp">): void {
  const fullEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[AUDIT]", JSON.stringify(fullEntry, null, 2));
  }

  // Add to in-memory store (for development only)
  auditLog.push(fullEntry);

  // Keep log size manageable
  if (auditLog.length > MAX_LOG_ENTRIES) {
    auditLog.shift();
  }
}

/**
 * Log order status change
 */
export function logOrderStatusChange(
  orderId: string,
  oldStatus: string,
  newStatus: string,
  userId: string,
): void {
  logAudit({
    action: "ORDER_STATUS_CHANGE",
    entityType: "Order",
    entityId: orderId,
    userId,
    details: {
      oldStatus,
      newStatus,
    },
  });
}

/**
 * Log user role change
 */
export function logUserRoleChange(
  targetUserId: string,
  oldRole: string,
  newRole: string,
  adminUserId: string,
): void {
  logAudit({
    action: "USER_ROLE_CHANGE",
    entityType: "User",
    entityId: targetUserId,
    userId: adminUserId,
    details: {
      oldRole,
      newRole,
    },
  });
}

/**
 * Log product deletion
 */
export function logProductDeletion(productId: string, vendorId: string): void {
  logAudit({
    action: "PRODUCT_DELETED",
    entityType: "Product",
    entityId: productId,
    userId: vendorId,
  });
}

/**
 * Get recent audit entries (for development/debugging)
 */
export function getRecentAuditEntries(count: number = 100): AuditLogEntry[] {
  return auditLog.slice(-count);
}
