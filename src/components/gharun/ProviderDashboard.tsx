import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, CheckCircle2, Clock, XCircle, Star, DollarSign,
  MapPin, Calendar, Phone, MessageCircle, ChevronDown, Loader2,
  RefreshCw, User, Mail, Shield, AlertCircle, ArrowRight,
  Package, TrendingUp, Eye, History, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { categories, statusColors, statusLabels } from '@/data/gharunData';
import { fetchJobAssignments, fetchServiceRequests } from '@/lib/database';
import DashboardSidebar from './DashboardSidebar';
import DocumentUpload from './DocumentUpload';

const GHARUN_WHATSAPP = '9779713242471';


const ProviderDashboard: React.FC<{ onGoHome: () => void; onLogout: () => void }> = ({ onGoHome, onLogout }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Try to fetch job assignments for this provider
      const jobs = await fetchJobAssignments(user.id).catch(() => []);
      setAssignedJobs(jobs || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const pendingJobs = assignedJobs.filter(j => j.status === 'assigned' || j.status === 'pending');
  const activeJobs = assignedJobs.filter(j => j.status === 'in-progress' || j.status === 'accepted');
  const completedJobs = assignedJobs.filter(j => j.status === 'completed');
  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.amount || 0), 0);

  const providerStatus = user?.isVerified ? 'Approved' : 'Pending Verification';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        role="provider"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onGoHome={onGoHome}
        userName={user?.name || 'Provider'}
        userEmail={user?.email}
        badges={{ 'assigned-jobs': pendingJobs.length }}
      />

      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="pl-12 lg:pl-0">
              <h1 className="text-xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Provider Dashboard'}
                {activeTab === 'assigned-jobs' && 'Assigned Jobs'}
                {activeTab === 'job-history' && 'Job History'}
                {activeTab === 'earnings' && 'Earnings'}
                {activeTab === 'ratings' && 'My Ratings'}
                {activeTab === 'messages' && 'Messages'}
                {activeTab === 'profile' && 'My Profile'}
                {activeTab === 'documents' && 'My Documents'}
              </h1>
              <p className="text-sm text-gray-500">
                {activeTab === 'overview' && `Welcome, ${user?.name || 'Provider'}!`}
                {activeTab === 'assigned-jobs' && `${pendingJobs.length} pending, ${activeJobs.length} active`}
                {activeTab === 'job-history' && `${completedJobs.length} completed jobs`}
                {activeTab === 'earnings' && 'Your earnings summary'}
                {activeTab === 'ratings' && 'Customer feedback'}
                {activeTab === 'messages' && 'In-app messaging (coming soon)'}
                {activeTab === 'profile' && 'Manage your provider profile'}
                {activeTab === 'documents' && 'Upload & manage verification documents'}
              </p>

            </div>
            <button onClick={loadJobs} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* ============ OVERVIEW ============ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Namaste, {user?.name}!</h2>
                    <p className="text-green-100 text-sm">Your provider dashboard</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    user?.isVerified ? 'bg-white/20 text-white' : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    {providerStatus}
                  </div>
                </div>
              </div>

              {/* Verification Notice */}
              {!user?.isVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">Verification Pending</p>
                    <p className="text-xs text-yellow-700 mt-0.5">Your account is being reviewed by the Gharun Nepal admin team. You'll receive jobs once verified.</p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Pending Jobs', value: pendingJobs.length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                  { label: 'Active Jobs', value: activeJobs.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { label: 'Completed', value: completedJobs.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                  { label: 'Total Earnings', value: `Rs. ${totalEarnings}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} rounded-2xl p-5 border ${stat.border}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                    <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Pending Jobs */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Pending Jobs ({pendingJobs.length})</h3>
                  <button onClick={() => setActiveTab('assigned-jobs')} className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {loading ? (
                  <div className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading jobs...</p>
                  </div>
                ) : pendingJobs.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">No pending jobs</h4>
                    <p className="text-sm text-gray-500">New jobs will appear here when assigned by admin</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pendingJobs.slice(0, 5).map((job) => {
                      const req = job.service_requests || {};
                      return (
                        <div key={job.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{req.request_number || 'Job'}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {categories.find(c => c.id === req.service_type)?.name || req.service_type || 'Service'} - {req.location || 'Location TBD'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 flex-shrink-0">
                            Pending
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Important Notice */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Provider Guidelines</p>
                  <ul className="text-xs text-green-700 mt-1 space-y-0.5">
                    <li>- Jobs are assigned by admin only. You cannot take jobs outside the system.</li>
                    <li>- You cannot see client phone numbers directly. Communication is through the platform.</li>
                    <li>- Pricing is set by admin in MVP. Do not negotiate directly with clients.</li>
                    <li>- Always update job status promptly for better ratings.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ============ ASSIGNED JOBS ============ */}
          {activeTab === 'assigned-jobs' && (
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading assigned jobs...</p>
                </div>
              ) : assignedJobs.filter(j => !['completed', 'cancelled'].includes(j.status)).length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">No active jobs</h4>
                  <p className="text-sm text-gray-500">Jobs assigned by admin will appear here</p>
                </div>
              ) : (
                assignedJobs.filter(j => !['completed', 'cancelled'].includes(j.status)).map((job) => {
                  const req = job.service_requests || {};
                  const isExpanded = expandedJob === job.id;
                  const category = categories.find(c => c.id === req.service_type);
                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <button onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            job.status === 'assigned' || job.status === 'pending' ? 'bg-yellow-100' :
                            job.status === 'accepted' ? 'bg-blue-100' :
                            'bg-orange-100'
                          }`}>
                            <Briefcase className={`w-5 h-5 ${
                              job.status === 'assigned' || job.status === 'pending' ? 'text-yellow-600' :
                              job.status === 'accepted' ? 'text-blue-600' :
                              'text-orange-600'
                            }`} />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-bold text-gray-900">{req.request_number || 'Job Assignment'}</p>
                            <p className="text-xs text-gray-500 truncate">{category?.name || req.service_type || 'Service'} - {req.location || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[job.status] || 'bg-gray-100 text-gray-600'}`}>
                            {job.status === 'assigned' ? 'New' : job.status === 'accepted' ? 'Accepted' : statusLabels[job.status] || job.status}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Service Type</p>
                              <p className="text-sm font-medium">{category?.name || req.service_type}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Location</p>
                              <p className="text-sm font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.location}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Preferred Date/Time</p>
                              <p className="text-sm font-medium">{req.preferred_date || 'Flexible'} {req.preferred_time || ''}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">Client Name</p>
                              <p className="text-sm font-medium">{req.client_name || 'Client'}</p>
                            </div>
                          </div>
                          {req.description && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500 mb-1">Job Description</p>
                              <p className="text-sm text-gray-700">{req.description}</p>
                            </div>
                          )}
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-xs text-amber-800">
                              <strong>Note:</strong> Client phone number is masked. Contact through platform only. Do not share your personal number.
                            </p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {(job.status === 'assigned' || job.status === 'pending') && (
                              <>
                                <button className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" /> Accept Job
                                </button>
                                <button className="px-4 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors flex items-center gap-1.5">
                                  <XCircle className="w-4 h-4" /> Decline
                                </button>
                              </>
                            )}
                            {job.status === 'accepted' && (
                              <button className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5">
                                <TrendingUp className="w-4 h-4" /> Start Work
                              </button>
                            )}
                            {job.status === 'in-progress' && (
                              <button className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Mark Completed
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ============ JOB HISTORY ============ */}
          {activeTab === 'job-history' && (
            <div className="space-y-4">
              {completedJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-1">No completed jobs yet</h4>
                  <p className="text-sm text-gray-500">Your completed jobs will appear here</p>
                </div>
              ) : (
                completedJobs.map((job) => {
                  const req = job.service_requests || {};
                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{req.request_number || 'Job'}</p>
                          <p className="text-xs text-gray-500">{categories.find(c => c.id === req.service_type)?.name || req.service_type} - {req.location}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">Completed</span>
                      </div>
                      {job.amount && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" /> Earned: Rs. {job.amount}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ============ EARNINGS ============ */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
                <p className="text-purple-200 text-sm mb-1">Total Earnings</p>
                <p className="text-4xl font-extrabold">Rs. {totalEarnings}</p>
                <p className="text-purple-200 text-sm mt-2">{completedJobs.length} completed jobs</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Earnings Breakdown</h3>
                {completedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Complete jobs to see earnings here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedJobs.map((job) => {
                      const req = job.service_requests || {};
                      return (
                        <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-sm font-medium">{req.request_number || 'Job'}</p>
                            <p className="text-xs text-gray-500">{new Date(job.completed_at || job.created_at).toLocaleDateString()}</p>
                          </div>
                          <p className="text-sm font-bold text-green-600">Rs. {job.amount || 0}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Pricing is controlled by Gharun Nepal admin in the current version. Commission rates and payment schedules will be communicated separately.
                </p>
              </div>
            </div>
          )}

          {/* ============ RATINGS ============ */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-10 h-10 text-yellow-500" />
                </div>
                <p className="text-4xl font-extrabold text-gray-900">--</p>
                <p className="text-sm text-gray-500 mt-1">Average Rating</p>
                <p className="text-xs text-gray-400 mt-2">Ratings will appear after completing jobs</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">No reviews yet</h4>
                <p className="text-sm text-gray-500">Customer reviews will appear here after job completion</p>
              </div>
            </div>
          )}

          {/* ============ MESSAGES ============ */}
          {activeTab === 'messages' && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">In-App Messaging</h3>
                <p className="text-sm text-gray-500 mb-4">Secure messaging with clients will be available soon. Phone numbers are masked for safety.</p>
                <a href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I am a Gharun Nepal provider and need help.')}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                  <MessageCircle className="w-4 h-4" /> Contact Admin via WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* ============ PROFILE ============ */}
          {activeTab === 'profile' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-8 text-white text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <h3 className="text-xl font-bold">{user?.name}</h3>
                  <p className="text-green-100 text-sm">Service Provider</p>
                  <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.isVerified ? 'bg-white/20 text-white' : 'bg-yellow-400 text-yellow-900'
                  }`}>
                    {providerStatus}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{user?.email || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{user?.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Jobs Completed</p>
                      <p className="text-sm font-medium">{completedJobs.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Total Earnings</p>
                      <p className="text-sm font-medium">Rs. {totalEarnings}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                 <p className="text-xs text-amber-800">
                   <strong>Profile Changes:</strong> To update your profile details, please contact Gharun Nepal admin. All changes require admin approval for security.
                 </p>
              </div>
            </div>
          )}



          {/* ============ DOCUMENTS ============ */}
          {activeTab === 'documents' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <DocumentUpload />
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ProviderDashboard;
