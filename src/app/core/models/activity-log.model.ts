export interface ActivityLog {
  id: string | number;
  action: string;
  actorId?: string | number;
  targetId?: string | number;
  details?: string;
  createdAt?: string;
}
