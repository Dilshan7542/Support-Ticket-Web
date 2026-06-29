export interface ActivityLog {
  id: string | number;
  traceId?: string;
  userId?: string | number | null;
  httpMethod?: string;
  endpoint?: string;
  action: string;
  actorId?: string | number;
  targetId?: string | number;
  details?: string;
  responseStatus?: number;
  encryptionEnabled?: boolean;
  executionTimeMs?: number;
  createdAt?: string;
}
