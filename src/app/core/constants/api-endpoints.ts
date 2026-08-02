export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    createUser: '/api/v1/auth/create-user',
    refreshToken: '/api/v1/auth/refresh-token',
    logout: '/api/v1/auth/logout'
  },
  security: {
    keyExchange: '/api/v1/security/key-exchange'
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
    update: '/api/v1/departments/update',
    users: '/api/v1/departments/users'
  },
  vendors: {
    create: '/api/v1/vendors/create',
    list: '/api/v1/vendors/list',
    detail: '/api/v1/vendors/detail',
    update: '/api/v1/vendors/update'
  },
  dashboard: {
    summary: '/api/v1/dashboard/summary'
  },
  activityLogs: {
    list: '/api/v1/activity-logs/list',
    detail: '/api/v1/activity-logs/detail'
  },
  ticketCategories: {
    create: '/api/v1/ticket-categories/create',
    list: '/api/v1/ticket-categories/list',
    detail: '/api/v1/ticket-categories/detail',
    update: '/api/v1/ticket-categories/update'
  },
  ticketCategoryMappings: {
    create: '/api/v1/ticket-category-mappings/create',
    list: '/api/v1/ticket-category-mappings/list',
    detail: '/api/v1/ticket-category-mappings/detail',
    update: '/api/v1/ticket-category-mappings/update'
  },
  ticketStatuses: {
    create: '/api/v1/ticket-statuses/create',
    list: '/api/v1/ticket-statuses/list',
    detail: '/api/v1/ticket-statuses/detail',
    update: '/api/v1/ticket-statuses/update'
  },
  ticketPriorities: {
    create: '/api/v1/ticket-priorities/create',
    list: '/api/v1/ticket-priorities/list',
    detail: '/api/v1/ticket-priorities/detail',
    update: '/api/v1/ticket-priorities/update',
    delete: '/api/v1/ticket-priorities/delete'
  },
  health: {
    status: '/api/v1/health/status'
  }
} as const;
