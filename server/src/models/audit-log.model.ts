import { z } from 'zod';

export const AuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  action: z.enum(['EVALUATION_STARTED', 'EVALUATION_COMPLETED', 'EVALUATION_FAILED', 'SIGNATURE_CREATED', 'SIGNATURE_VERIFIED', 'TIMEOUT_OCCURRED', 'RETRY_ATTEMPTED']),
  milestone_id: z.string(),
  escrow_address: z.string(),
  evaluator_pubkey: z.string(),
  status: z.enum(['SUCCESS', 'ERROR', 'TIMEOUT', 'RETRY']),
  details: z.record(z.any()),
  error_message: z.string().optional(),
  duration_ms: z.number(),
  model_version: z.string(),
  evaluator_version: z.string(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

const auditLogs: AuditLog[] = [];

export class AuditLogService {
  static log(logData: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Math.floor(Date.now() / 1000),
      ...logData,
    };

    auditLogs.push(log);

    // Keep only last 10000 logs in memory
    if (auditLogs.length > 10000) {
      auditLogs.shift();
    }

    console.log(`[AUDIT] ${log.action} - ${log.milestone_id}: ${log.status}`);
    return log;
  }

  static getLogs(milestone_id?: string): AuditLog[] {
    if (milestone_id) {
      return auditLogs.filter(log => log.milestone_id === milestone_id);
    }
    return auditLogs;
  }

  static getRecentLogs(limit: number = 100): AuditLog[] {
    return auditLogs.slice(-limit);
  }
}
