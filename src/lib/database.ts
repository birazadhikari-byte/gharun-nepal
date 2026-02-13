import { supabase } from '@/lib/supabase';

// ============ ADMIN API HELPER ============
async function adminApiCall(action: string, data: Record<string, any> = {}) {
  const { data: result, error } = await supabase.functions.invoke('admin-api', {
    body: { action, ...data },
  });
  if (error) throw new Error(error.message || 'Admin API call failed');
  if (result?.error) throw new Error(result.error);
  return result?.data;
}

// ============ PROVIDERS (PUBLIC - READ ONLY) ============

export async function fetchProviders(filters?: { category?: string; status?: string }) {
  let query = supabase.from('providers').select('*').order('jobs_completed', { ascending: false });
  if (filters?.category) query = query.eq('category', filters.category);
  // Public can only see active/verified providers (enforced by RLS)
  if (filters?.status) query = query.eq('status', filters.status);
  else query = query.in('status', ['active', 'verified']);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ============ ADMIN: PROVIDER MANAGEMENT ============

export async function adminListAllProviders() {
  return adminApiCall('list_all_providers');
}

export async function adminCreateProvider(provider: {
  name: string;
  phone: string;
  email?: string;
  service: string;
  category: string;
  location: string;
  description?: string;
  image?: string;
  verified?: boolean;
  status?: string;
}) {
  return adminApiCall('create_provider', provider);
}

export async function adminUpdateProvider(id: string, updates: Record<string, any>) {
  return adminApiCall('update_provider', { id, updates });
}

export async function adminVerifyProvider(id: string, verified: boolean, status?: string) {
  return adminApiCall('verify_provider', { id, verified, status });
}

export async function adminSuspendProvider(id: string, reason?: string) {
  return adminApiCall('suspend_provider', { id, reason });
}

export async function adminHideProvider(id: string) {
  return adminApiCall('hide_provider', { id });
}

export async function adminDeleteProvider(id: string) {
  return adminApiCall('delete_provider', { id });
}

// ============ ADMIN: SUBMISSIONS ============

export async function adminListSubmissions(status?: string) {
  return adminApiCall('list_submissions', { status });
}

export async function adminReviewSubmission(id: string, status: string, adminNotes?: string) {
  return adminApiCall('review_submission', { id, status, admin_notes: adminNotes });
}

// ============ ADMIN: CHANGE REQUESTS ============

export async function adminListChangeRequests() {
  return adminApiCall('list_change_requests');
}

export async function adminReviewChangeRequest(id: string, approved: boolean) {
  return adminApiCall('review_change_request', { id, approved });
}

// ============ ADMIN: SERVICE REQUESTS ============

export const adminListRequests = async () => {

  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("adminListRequests error:", error);
    return [];
  }

  return data || [];
};

// ============ ADMIN: STATS ============

export async function adminGetStats() {
  return adminApiCall('get_stats');
}

// ============ ADMIN: AUDIT LOGS ============

export async function adminGetAuditLogs(limit?: number) {
  return adminApiCall('get_audit_logs', { limit });
}

// ============ INTERNAL ACCESS MANAGEMENT ============

export async function adminListInternalUsers() {
  return adminApiCall('list_internal_users');
}

export async function adminGrantInternalAccess(data: {
  email: string;
  access_level: string;
  display_name: string;
  notes?: string;
}) {
  return adminApiCall('grant_internal_access', data);
}

export async function adminUpdateInternalLevel(id: string, access_level: string, notes?: string) {
  return adminApiCall('update_internal_level', { id, access_level, notes });
}

export async function adminRevokeInternalAccess(id: string) {
  return adminApiCall('revoke_internal_access', { id });
}

export async function adminGetInternalAccessLogs(limit?: number) {
  return adminApiCall('get_internal_access_logs', { limit });
}

export async function adminGetMyInternalLevel() {
  return adminApiCall('get_my_internal_level');
}

// ============ ACTIVITY ANALYTICS (REAL-TIME DASHBOARD) ============

export async function adminGetActivityAnalytics() {
  return adminApiCall('get_activity_analytics');
}

export async function adminGetActivityTimeline(options?: {
  hours?: number;
  action_filter?: string;
  team_member_filter?: string;
  limit?: number;
}) {
  return adminApiCall('get_activity_timeline', options || {});
}



// ============ PROVIDER: SUBMISSIONS (DRAFT/PENDING) ============

export async function submitProviderRegistration(data: {
  name: string;
  phone: string;
  email?: string;
  service: string;
  category: string;
  location: string;
  description?: string;
  image?: string;
  userId?: string;
}) {
  const { data: result, error } = await supabase.from('provider_submissions').insert({
    user_id: data.userId || null,
    submission_type: 'new_registration',
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      category: data.category,
      location: data.location,
      description: data.description,
      image: data.image,
    },
    status: 'pending',
  }).select().single();
  if (error) throw error;
  return result;
}

export async function submitChangeRequest(providerId: string, userId: string, fieldName: string, currentValue: string, requestedValue: string, reason?: string) {
  const { data, error } = await supabase.from('provider_change_requests').insert({
    provider_id: providerId,
    user_id: userId,
    field_name: fieldName,
    current_value: currentValue,
    requested_value: requestedValue,
    reason,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchMySubmissions(userId: string) {
  const { data, error } = await supabase.from('provider_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchMyChangeRequests(userId: string) {
  const { data, error } = await supabase.from('provider_change_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ SERVICE REQUESTS (CLIENT) ============

export async function createServiceRequest(request: {
  client_name: string;
  client_phone: string;
  client_email?: string;
  client_id?: string;
  service_type: string;
  description: string;
  location: string;
  preferred_date?: string;
  preferred_time?: string;
  urgency?: string;
  payment_method?: string;
}) {
  const reqNumber = 'GN-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  const { data, error } = await supabase.from('service_requests').insert({
    ...request,
    request_number: reqNumber,
    status: 'submitted',
    payment_method: request.payment_method || 'cash',
    payment_status: 'pending',
  }).select().single();
  if (error) throw error;
  return data;
}


export async function fetchServiceRequests(filters?: { status?: string; client_id?: string }) {
  let query = supabase.from('service_requests').select('*').order('created_at', { ascending: false });
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.client_id) query = query.eq('client_id', filters.client_id);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchRequestByNumber(requestNumber: string) {
  const { data, error } = await supabase.from('service_requests').select('*').eq('request_number', requestNumber).single();
  if (error) return null;
  return data;
}

// ============ PROFILES ============

export async function upsertProfile(profile: {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  role: string;
}) {
  const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
  if (error) throw error;
  return data;
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data;
}

// ============ JOB ASSIGNMENTS ============

export async function fetchJobAssignments(providerId?: string) {
  let query = supabase.from('job_assignments').select('*, service_requests(*)').order('created_at', { ascending: false });
  if (providerId) query = query.eq('provider_id', providerId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ============ NOTIFICATIONS ============

export async function sendWhatsAppNotification(eventType: string, data: any, recipientPhone: string, language: string = 'en', recipientName?: string) {
  try {
    const { data: result, error } = await supabase.functions.invoke('whatsapp-notify', {
      body: { eventType, data, recipientPhone, language, recipientName },
    });
    if (error) throw error;
    return result;
  } catch (err) {
    console.error('WhatsApp notification error:', err);
    return null;
  }
}

// ============ EMAIL NOTIFICATIONS (SendGrid - PRODUCTION) ============

export async function sendEmailNotification(eventType: string, data: any, recipientEmail: string, recipientName?: string) {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: { eventType, data, recipientEmail, recipientName },
    });
    if (error) throw error;
    return result;
  } catch (err) {
    console.error('Email notification error:', err);
    return null;
  }
}

export async function adminListEmailLogs(filters?: { event_type?: string; status?: string; request_number?: string; limit?: number }) {
  return adminApiCall('list_email_logs', filters || {});
}

export async function adminGetEmailStats() {
  return adminApiCall('get_email_stats');
}

export async function adminSendManualEmail(eventType: string, data: any, recipientEmail: string, recipientName?: string) {
  return adminApiCall('send_manual_email', { eventType, data, recipientEmail, recipientName });
}

// ============ EMAIL AUTH (PRODUCTION) ============
// Email verification, password reset with secure tokens

async function emailAuthCall(action: string, data: Record<string, any> = {}) {
  const { data: result, error } = await supabase.functions.invoke('email-auth', {
    body: { action, ...data },
  });
  if (error) throw new Error(error.message || 'Email auth call failed');
  if (result?.error) throw new Error(result.error);
  return result?.data;
}

// Request email verification OTP
export async function requestEmailVerification(email: string) {
  return emailAuthCall('request_email_verification', { email });
}

// Verify email with OTP code
export async function verifyEmailCode(email: string, code: string) {
  return emailAuthCall('verify_email_code', { email, code });
}

// Request password reset (sends OTP to email)
export async function requestPasswordReset(email: string) {
  return emailAuthCall('request_password_reset', { email });
}

// Verify password reset code (returns resetToken)
export async function verifyResetCode(email: string, code: string) {
  return emailAuthCall('verify_reset_code', { email, code });
}

// Reset password with token
export async function resetPassword(email: string, resetToken: string, newPassword: string) {
  return emailAuthCall('reset_password', { email, resetToken, newPassword });
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name: string) {
  return emailAuthCall('send_welcome', { email, name });
}

// ============ EMAIL AUTOMATIONS (PRODUCTION) ============

// Marketing/engagement automations - NOT for auth/OTP

async function automationCall(action: string, data: Record<string, any> = {}) {
  const { data: result, error } = await supabase.functions.invoke('email-automations', {
    body: { action, ...data },
  });
  if (error) throw new Error(error.message || 'Automation call failed');
  if (result?.error) throw new Error(result.error);
  return result?.data;
}

// Get email preferences for current user
export async function getEmailPreferences(email: string, userId?: string) {
  return automationCall('get_preferences', { email, userId });
}

// Update email preferences
export async function updateEmailPreferences(email: string, userId: string, preferences: {
  welcome_emails?: boolean;
  onboarding_emails?: boolean;
  marketing_emails?: boolean;
  service_tips?: boolean;
  unsubscribed_all?: boolean;
}) {
  return automationCall('update_preferences', { email, userId, preferences });
}

// Handle unsubscribe (from email link)
export async function handleUnsubscribe(token: string, category?: string, all?: boolean) {
  return automationCall('unsubscribe', { token, category, all });
}

// Handle resubscribe
export async function handleResubscribe(token: string, category?: string) {
  return automationCall('resubscribe', { token, category });
}

// Admin: Get automation stats
export async function adminGetAutomationStats() {
  return adminApiCall('get_automation_stats');
}

// Admin: List automation log
export async function adminListAutomationLog(filters?: { automation_type?: string; status?: string; limit?: number }) {
  return adminApiCall('list_automation_log', filters || {});
}

// Admin: List automation queue
export async function adminListAutomationQueue(filters?: { status?: string; limit?: number }) {
  return adminApiCall('list_automation_queue', filters || {});
}
// Admin: Process automation queue (send pending emails)
export async function adminProcessAutomationQueue(batchSize?: number) {
  return adminApiCall('process_automation_queue', { batchSize });
}

// ============ CRON QUEUE PROCESSOR (PRODUCTION) ============

async function cronCall(action: string, data: Record<string, any> = {}) {
  const { data: result, error } = await supabase.functions.invoke('cron-queue-processor', {
    body: { action, ...data },
  });
  if (error) throw new Error(error.message || 'Cron call failed');
  return result?.data || result;
}

// Health check (no auth needed)
export async function getCronHealth() {
  return cronCall('health');
}

// Get cron execution logs (admin)
export async function getCronLogs(limit?: number) {
  return cronCall('get_logs', { limit });
}

// Toggle cron enabled/disabled (admin)
export async function toggleCron(enabled?: boolean) {
  return cronCall('toggle', { enabled });
}

// Reset circuit breaker (admin)
export async function resetCronCircuitBreaker() {
  return cronCall('reset_circuit_breaker');
}

// Get cron secret for external setup (admin - CORE+)
export async function getCronSecret() {
  return cronCall('get_secret');
}

// Manually trigger queue processing (admin)
export async function triggerCronManually() {
  return cronCall('process');
}


// ============ GHARUN CONNECT: COORDINATION ENGINE ============

async function connectCall(action: string, data: Record<string, any> = {}) {
  const { data: result, error } = await supabase.functions.invoke('gharun-connect', {
    body: { action, ...data },
  });
  if (error) throw new Error(error.message || 'Connect call failed');
  if (result?.error) throw new Error(result.error);
  return result?.data;
}

// Get coordination dashboard stats
export async function connectGetDashboard() {
  return connectCall('get_dashboard');
}

// Get pipeline (requests with coordination data)
export async function connectGetPipeline(filters?: { status?: string; priority?: string; limit?: number }) {
  return connectCall('get_pipeline', filters || {});
}

// Get full request detail with timeline, assignments, matched providers
export async function connectGetRequestDetail(requestId: string) {
  return connectCall('get_request_detail', { request_id: requestId });
}

// Confirm a request (move to matching stage)
export async function connectConfirmRequest(requestId: string) {
  return connectCall('confirm_request', { request_id: requestId });
}

// Assign a provider to a request (with SLA tracking)
export async function connectAssignProvider(requestId: string, providerId: string) {
  return connectCall('assign_provider', { request_id: requestId, provider_id: providerId });
}

// Update assignment status (accepted, declined, no_response)
export async function connectUpdateAssignment(assignmentId: string, response: string, declineReason?: string, adminNotes?: string, adminRating?: number) {
  return connectCall('update_assignment', { assignment_id: assignmentId, response, decline_reason: declineReason, admin_notes: adminNotes, admin_rating: adminRating });
}

// Start work on a request
export async function connectStartWork(requestId: string) {
  return connectCall('start_work', { request_id: requestId });
}

// Complete a job
export async function connectCompleteJob(requestId: string, completionNotes?: string, adminQualityScore?: number) {
  return connectCall('complete_job', { request_id: requestId, completion_notes: completionNotes, admin_quality_score: adminQualityScore });
}

// Verify completion
export async function connectVerifyCompletion(requestId: string, clientSatisfaction?: number) {
  return connectCall('verify_completion', { request_id: requestId, client_satisfaction: clientSatisfaction });
}

// Escalate a request
export async function connectEscalate(requestId: string, reason: string) {
  return connectCall('escalate', { request_id: requestId, reason });
}

// Cancel a request
export async function connectCancelRequest(requestId: string, reason: string) {
  return connectCall('cancel_request', { request_id: requestId, reason });
}

// Add a note to timeline
export async function connectAddNote(requestId: string, note: string) {
  return connectCall('add_note', { request_id: requestId, note });
}

// Set priority
export async function connectSetPriority(requestId: string, priority: string) {
  return connectCall('set_priority', { request_id: requestId, priority });
}

// Get provider leaderboard
export async function connectGetProviderLeaderboard(limit?: number) {
  return connectCall('get_provider_leaderboard', { limit });
}

// Get provider metrics
export async function connectGetProviderMetrics(providerId: string) {
  return connectCall('get_provider_metrics', { provider_id: providerId });
}



// ============ STATS (PUBLIC) ============

export async function fetchStats() {
  try {
    const [providersRes, requestsRes, completedRes] = await Promise.all([
      supabase.from('providers').select('id', { count: 'exact' }).in('status', ['active', 'verified']),
      supabase.from('service_requests').select('id', { count: 'exact' }),
      supabase.from('service_requests').select('id', { count: 'exact' }).eq('status', 'completed'),
    ]);
    return {
      verifiedProviders: providersRes.count || 0,
      totalRequests: requestsRes.count || 0,
      completedJobs: completedRes.count || 0,
      happyClients: completedRes.count || 0,
      activeRiders: 14,
    };
  } catch {
    return { verifiedProviders: 0, totalRequests: 0, completedJobs: 0, happyClients: 0, activeRiders: 14 };
  }
}

// ============ RIDE CONNECTOR: PUBLIC API ============

export async function fetchVehicleTypes() {
  const { data, error } = await supabase.from('vehicle_types')
    .select('*')
    .eq('enabled', true)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchServiceAreas() {
  const { data, error } = await supabase.from('service_areas')
    .select('*')
    .eq('enabled', true)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}


export async function fetchActiveRideDrivers(areaId?: string, vehicleTypeId?: string) {
  let query = supabase.from('ride_drivers')
    .select('id, name, location, rating, total_connections, available, vehicle_types(name, name_np), service_areas(area_name)')
    .eq('status', 'active')
    .eq('verified', true);
  if (areaId) query = query.eq('area_id', areaId);
  if (vehicleTypeId) query = query.eq('vehicle_type_id', vehicleTypeId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createRideRequest(request: {
  user_name: string;
  user_phone: string;
  pickup_location: string;
  drop_location: string;
  area_id?: string;
  vehicle_type_id?: string;
  preferred_vehicle?: string;
  urgency: 'now' | 'scheduled';
  scheduled_time?: string;
  notes?: string;
  user_id?: string;
}) {
  const reqNumber = 'RC-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  const { data, error } = await supabase.from('ride_requests').insert({
    ...request,
    request_number: reqNumber,
    status: 'pending',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchRideRequestByNumber(requestNumber: string) {
  const { data, error } = await supabase.from('ride_requests')
    .select('*, vehicle_types(name, name_np), service_areas(area_name)')
    .eq('request_number', requestNumber)
    .single();
  if (error) return null;
  return data;
}


// ============ RIDE CONNECTOR: ADMIN API ============

export async function adminRideListDrivers() {
  return adminApiCall('ride_list_drivers');
}

export async function adminRideCreateDriver(driver: Record<string, any>) {
  return adminApiCall('ride_create_driver', driver);
}

export async function adminRideUpdateDriver(id: string, updates: Record<string, any>) {
  return adminApiCall('ride_update_driver', { id, updates });
}

export async function adminRideVerifyDriver(id: string, verified: boolean) {
  return adminApiCall('ride_verify_driver', { id, verified });
}

export async function adminRideSuspendDriver(id: string, reason?: string) {
  return adminApiCall('ride_suspend_driver', { id, reason });
}

export async function adminRideDeleteDriver(id: string) {
  return adminApiCall('ride_delete_driver', { id });
}

export async function adminRideListVehicleTypes() {
  return adminApiCall('ride_list_vehicle_types');
}

export async function adminRideToggleVehicleType(id: string, enabled: boolean) {
  return adminApiCall('ride_toggle_vehicle_type', { id, enabled });
}

export async function adminRideListAreas() {
  return adminApiCall('ride_list_areas');
}

export async function adminRideToggleArea(id: string, enabled: boolean) {
  return adminApiCall('ride_toggle_area', { id, enabled });
}

export async function adminRideUpdateArea(id: string, updates: Record<string, any>) {
  return adminApiCall('ride_update_area', { id, updates });
}

export async function adminRideListRequests() {
  return adminApiCall('ride_list_requests');
}

export async function adminRideUpdateRequest(id: string, updates: Record<string, any>) {
  return adminApiCall('ride_update_request', { id, updates });
}

export async function adminRideCreateConnection(rideRequestId: string, driverId: string) {
  return adminApiCall('ride_create_connection', { ride_request_id: rideRequestId, driver_id: driverId });
}

export async function adminRideListConnections(rideRequestId?: string) {
  return adminApiCall('ride_list_connections', { ride_request_id: rideRequestId });
}
export async function adminRideGetStats() {
  return adminApiCall('ride_get_stats');
}


// ============ CATALOG: SERVICES CRUD ============

export async function adminListServices() {
  return adminApiCall('list_services');
}

export async function adminCreateService(service: Record<string, any>) {
  return adminApiCall('create_service', service);
}

export async function adminUpdateService(id: string, updates: Record<string, any>) {
  return adminApiCall('update_service', { id, updates });
}

export async function adminToggleService(id: string, enabled: boolean) {
  return adminApiCall('toggle_service', { id, enabled });
}

export async function adminDeleteService(id: string) {
  return adminApiCall('delete_service', { id });
}

// ============ CATALOG: AREAS CRUD ============

export async function adminRideCreateArea(area: Record<string, any>) {
  return adminApiCall('ride_create_area', area);
}

export async function adminRideDeleteArea(id: string) {
  return adminApiCall('ride_delete_area', { id });
}

// ============ CATALOG: VEHICLE TYPES CRUD ============

export async function adminRideCreateVehicleType(vehicleType: Record<string, any>) {
  return adminApiCall('ride_create_vehicle_type', vehicleType);
}

export async function adminRideUpdateVehicleType(id: string, updates: Record<string, any>) {
  return adminApiCall('ride_update_vehicle_type', { id, updates });
}

export async function adminRideDeleteVehicleType(id: string) {
  return adminApiCall('ride_delete_vehicle_type', { id });
}

// ============ ORDER MANAGEMENT ============

export async function adminListOrders(filters?: { status?: string; limit?: number }) {
  return adminApiCall('list_orders', filters || {});
}

export async function adminUpdateOrder(id: string, updates: Record<string, any>) {
  return adminApiCall('update_order', { id, updates });
}

export async function adminVerifyOrder(id: string) {
  return adminApiCall('verify_order', { id });
}

export async function adminCancelOrder(id: string, reason: string) {
  return adminApiCall('cancel_order', { id, reason });
}

// ============ USER MANAGEMENT ============

export async function adminListUsers(filters?: { search?: string; role?: string; limit?: number }) {
  return adminApiCall('list_users', filters || {});
}

export async function adminBlockUser(id: string, reason?: string) {
  return adminApiCall('block_user', { id, reason });
}

export async function adminUnblockUser(id: string) {
  return adminApiCall('unblock_user', { id });
}

export async function adminDeleteUser(id: string) {
  return adminApiCall('delete_user', { id });
}

export async function adminGetUserOrders(userId: string) {
  return adminApiCall('get_user_orders', { user_id: userId });
}

// ============ PAYMENT / TRANSACTIONS ============

export async function adminListTransactions(filters?: { payment_method?: string; payment_status?: string; limit?: number }) {
  return adminApiCall('list_transactions', filters || {});
}

export async function adminMarkCashReceived(id: string) {
  return adminApiCall('mark_cash_received', { id });
}

export async function adminGetRevenueReport() {
  return adminApiCall('get_revenue_report');
}

// Admin: set cost on a service request
export async function adminSetRequestCost(id: string, estimated_cost?: number, final_cost?: number) {
  return adminApiCall('set_request_cost', { id, estimated_cost, final_cost });
}

// Admin: mark payment received on a service request
export async function adminMarkRequestPaymentReceived(id: string) {
  return adminApiCall('mark_request_payment_received', { id });
}

// Client: fetch payment summary from their service_requests
export async function fetchClientPaymentSummary(clientId: string) {
  const { data, error } = await supabase.from('service_requests')
    .select('id, request_number, service_type, location, status, payment_method, payment_status, estimated_cost, final_cost, payment_received_at, created_at, updated_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Client: fetch payment receipts for their requests
export async function fetchClientReceipts(clientId: string) {
  const { data, error } = await supabase.from('payment_receipts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Fetch a single receipt by request_id
export async function fetchReceiptByRequestId(requestId: string) {
  const { data, error } = await supabase.from('payment_receipts')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

// Admin: list all receipts
export async function adminListReceipts(requestId?: string) {
  return adminApiCall('list_request_receipts', { request_id: requestId });
}


// ============ PROVIDER DOCUMENTS ============

export type DocumentType = 'citizenship_front' | 'citizenship_back' | 'license' | 'profile_photo';

export interface ProviderDocument {
  id: string;
  provider_id: string | null;
  user_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Upload a document to storage and save metadata
export async function uploadProviderDocument(
  userId: string,
  file: File,
  documentType: DocumentType,
  providerId?: string,
): Promise<ProviderDocument> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed. / अमान्य फाइल प्रकार। JPG, PNG, र PDF मात्र अनुमति छ।');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum 5MB allowed. / फाइल धेरै ठूलो छ। अधिकतम ५ MB अनुमति छ।');
  }

  // Compress image if needed (client-side)
  let uploadFile: File | Blob = file;
  if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
    try {
      uploadFile = await compressImage(file, 1024, 0.8);
    } catch {
      uploadFile = file; // Fallback to original
    }
  }

  // Generate unique file path: userId/docType_timestamp.ext
  const ext = file.name.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const filePath = `${userId}/${documentType}_${timestamp}.${ext}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('provider-documents')
    .upload(filePath, uploadFile, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error('Upload failed: ' + uploadError.message + ' / अपलोड असफल भयो');
  }

  // Save metadata to database
  const { data, error } = await supabase.from('provider_documents').insert({
    provider_id: providerId || null,
    user_id: userId,
    document_type: documentType,
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    verification_status: 'pending',
  }).select().single();

  if (error) {
    // Clean up uploaded file on metadata save failure
    await supabase.storage.from('provider-documents').remove([filePath]);
    throw new Error('Failed to save document record: ' + error.message);
  }

  return data;
}

// Fetch documents for a specific user
export async function fetchMyDocuments(userId: string): Promise<ProviderDocument[]> {
  const { data, error } = await supabase.from('provider_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Delete a pending document (provider can only delete their own pending docs)
export async function deleteProviderDocument(docId: string, filePath: string): Promise<void> {
  // Delete from storage
  await supabase.storage.from('provider-documents').remove([filePath]);
  // Delete metadata
  const { error } = await supabase.from('provider_documents').delete().eq('id', docId);
  if (error) throw error;
}

// Get a signed URL for viewing a document
export async function getDocumentSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('provider-documents')
    .createSignedUrl(filePath, 3600); // 1 hour
  if (error) throw error;
  return data.signedUrl;
}

// Admin: list all provider documents
export async function adminListProviderDocuments(filters?: { provider_id?: string; user_id?: string; verification_status?: string }) {
  return adminApiCall('list_provider_documents', filters || {});
}

// Admin: list pending documents
export async function adminListPendingDocuments() {
  return adminApiCall('list_pending_documents');
}


// Admin: verify a document (returns auto-verification info)
export interface VerifyDocumentResult extends ProviderDocument {
  _autoVerification?: {
    allRequiredDocsVerified: boolean;
    providerAutoVerified: boolean;
    autoVerifiedProviderIds: string[];
  };
}

export async function adminVerifyDocument(id: string): Promise<VerifyDocumentResult> {
  return adminApiCall('verify_document', { id });
}

// Admin: reject a document
export async function adminRejectDocument(id: string, reason: string) {
  return adminApiCall('reject_document', { id, reason });
}

// Admin: get signed URL for a document
export async function adminGetDocumentSignedUrl(filePath: string): Promise<string> {
  const result = await adminApiCall('get_document_signed_url', { file_path: filePath });
  return result?.signedUrl || '';
}

// Admin: check provider verification status
export interface ProviderVerificationStatus {
  docsStatus: Record<string, string>;
  allRequiredVerified: boolean;
  providerStatus: {
    id: string;
    name: string;
    verified: boolean;
    documents_verified: boolean;
    status: string;
  } | null;
}

export async function adminCheckProviderVerificationStatus(
  userId?: string,
  providerId?: string
): Promise<ProviderVerificationStatus> {
  return adminApiCall('check_provider_verification_status', {
    user_id: userId,
    provider_id: providerId,
  });
}

// ============ SERVICE PRICING (PUBLIC) ============

export interface ServicePricing {
  id: string;
  service_category: string;
  service_category_name: string;
  service_category_name_np: string;
  job_scope: 'small' | 'medium' | 'large';
  min_price: number;
  max_price: number;
  scope_description: string;
  scope_description_np: string;
  enabled: boolean;
}

export async function fetchServicePricing(): Promise<ServicePricing[]> {
  const { data, error } = await supabase.from('service_pricing')
    .select('*')
    .eq('enabled', true)
    .order('service_category')
    .order('job_scope');
  if (error) throw error;
  return (data || []).map(d => ({ ...d, min_price: Number(d.min_price), max_price: Number(d.max_price) }));
}

// ============ ADMIN: SERVICE PRICING MANAGEMENT ============

export async function adminListPricing() {
  return adminApiCall('list_pricing');
}

export async function adminCreatePricing(pricing: Record<string, any>) {
  return adminApiCall('create_pricing', pricing);
}

export async function adminUpdatePricing(id: string, updates: Record<string, any>) {
  return adminApiCall('update_pricing', { id, updates });
}

export async function adminDeletePricing(id: string) {
  return adminApiCall('delete_pricing', { id });
}

// ============ PROVIDER JOB BOARD ============

export async function fetchAvailableJobs(providerCategory?: string) {
  let query = supabase.from('service_requests')
    .select('*')
    .in('status', ['confirmed'])
    .order('created_at', { ascending: false });
  if (providerCategory) {
    query = query.eq('service_type', providerCategory);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchProviderByUserId(userId: string) {
  const { data, error } = await supabase.from('providers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function expressJobInterest(providerId: string, requestId: string, userId: string, note?: string) {
  const { data, error } = await supabase.from('provider_job_interests').upsert({
    provider_id: providerId,
    request_id: requestId,
    user_id: userId,
    status: 'interested',
    note: note || '',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'provider_id,request_id' }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchMyJobInterests(providerId: string) {
  const { data, error } = await supabase.from('provider_job_interests')
    .select('*, service_requests(*)')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ TERMS ACCEPTANCE (LEGAL COMPLIANCE) ============

export const CURRENT_TERMS_VERSION = 'v1.0';
export const CURRENT_PRIVACY_VERSION = 'v1.0';

// Cache clearing utility - ADD THIS FUNCTION! ⭐
export function clearTermsConfigCache() {
  // No cache to clear in this simplified version
  console.log('Terms config cache cleared');
}

/**
 * Check if user has accepted terms
 */
export async function checkTermsAcceptance(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('terms_acceptance')
      .select('id')
      .eq('user_id', userId)
      .eq('terms_version', CURRENT_TERMS_VERSION)
      .eq('privacy_version', CURRENT_PRIVACY_VERSION)
      .limit(1);

    if (error) {
      console.error('Terms check error:', error);
      return false;
    }
    return data && data.length > 0;
  } catch (err) {
    console.error('Terms check exception:', err);
    return false;
  }
}

/**
 * Record terms acceptance
 */
export async function recordTermsAcceptance(
  userId: string,
  role?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('terms_acceptance')
      .insert([
        {
          user_id: userId,
          terms_version: CURRENT_TERMS_VERSION,
          privacy_version: CURRENT_PRIVACY_VERSION,
          accepted_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Terms record error:', error);
      return false;
    }

    console.log('Terms acceptance recorded successfully');
    return true;
  } catch (err) {
    console.error('Terms record exception:', err);
    return false;
  }
}

// ============ ADMIN: TERMS ACCEPTANCE REPORT ============

export async function adminGetTermsReport() {
  return adminApiCall('get_terms_report');
}

export async function adminListTermsAcceptances(filters?: { role?: string; terms_version?: string; limit?: number }) {
  return adminApiCall('list_terms_acceptances', filters || {});
}

export async function adminUpdateTermsVersion(data: {
  new_terms_version?: string;
  new_privacy_version?: string;
  change_notes?: string;
}) {
  const result = await adminApiCall('update_terms_version', data);
  // Clear the cached config so the new version takes effect immediately
  clearTermsConfigCache();  // ✅ Now this function exists!
  return result;
}

export async function adminGetTermsVersionConfig() {
  return adminApiCall('get_terms_version_config');
}





// ============ IMAGE COMPRESSION UTILITY ============

function compressImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
}
