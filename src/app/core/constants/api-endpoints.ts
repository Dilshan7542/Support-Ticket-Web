export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    refreshToken: '/api/v1/auth/refresh-token',
    logout: '/api/v1/auth/logout'
  },
  tickets: {
    create: '/api/v1/tickets/create',
    list: '/api/v1/tickets/list',
    detail: '/api/v1/tickets/detail',
    updateStatus: '/api/v1/tickets/update-status',
    addReply: '/api/v1/tickets/add-reply',
    assign: '/api/v1/tickets/assign',
    uploadAttachment: '/api/v1/tickets/upload-attachment',
    downloadAttachment: '/api/v1/tickets/attachments/download'
  },
  departments: {
    create: '/api/v1/departments/create',
    list: '/api/v1/departments/list',
    detail: '/api/v1/departments/detail',
    update: '/api/v1/departments/update'
  },
  dashboard: {
    summary: '/api/v1/dashboard/summary'
  },
  activityLogs: {
    list: '/api/v1/activity-logs/list',
    detail: '/api/v1/activity-logs/detail'
  },
  health: {
    status: '/api/v1/health/status'
  }
} as const;
