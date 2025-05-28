import prisma from '@/lib/prisma';
import { User } from '@prisma/client'; // Assuming User type is available

interface AuditLogData {
  userId?: string | null;
  userEmail?: string | null; // For cases where user object might not be readily available
  action: string;          // Standardized action string, e.g., "USER_LOGIN", "CREATE_SECTOR"
  entityType?: string;
  entityId?: string;
  details?: any;           // JSON object for additional info
  ipAddress?: string;
}

/**
 * Creates an audit log entry.
 * @param data - The data for the audit log.
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    let emailToLog = data.userEmail;

    // If userId is provided and userEmail is not, try to fetch user's email
    if (data.userId && !data.userEmail) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true },
      });
      if (user) {
        emailToLog = user.email;
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: data.userId ?? undefined, // Handle null explicitly for Prisma
        userEmail: emailToLog ?? undefined,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
        ipAddress: data.ipAddress,
        // timestamp is handled by @default(now())
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error, 'Original log data:', data);
    // Depending on your error handling strategy, you might want to re-throw or handle silently
  }
}

// Example Action Constants (consider centralizing these)
export const AUDIT_ACTIONS = {
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTERED: 'USER_REGISTERED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  
  SECTOR_CREATED: 'SECTOR_CREATED',
  SECTOR_UPDATED: 'SECTOR_UPDATED',
  SECTOR_DELETED: 'SECTOR_DELETED',

  SYSTEM_SETTING_UPDATED: 'SYSTEM_SETTING_UPDATED',
  // ... add more actions as your application grows
}; 