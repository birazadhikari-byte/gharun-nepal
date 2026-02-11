import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, CheckCircle2, Clock, MapPin, Calendar, DollarSign,
  TrendingUp, Star, User, Phone, ArrowRight, XCircle, AlertCircle,
  Edit3, Send, FileText, Lock
} from 'lucide-react';
import { statusColors, statusLabels, categories } from '@/data/gharunData';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProviders, fetchJobAssignments, fetchMySubmissions, fetchMyChangeRequests, submitChangeRequest } from '@/lib/database';

const ProviderPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'profile' | 'requests'>('profile');
  const [myProvider, setMyProvider] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [myChanges, setMyChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [changeField, setChangeField] = useState('');
  const [changeValue, setChangeValue] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);
  const [changeFeedback, setChangeFeedback] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      // Find provider linked to this user
      const providers = await fetchProviders();
      const myProv = providers.find((p: any) => p.user_id === user.id);
      setMyProvider(myProv || null);

      if (myProv) {
        const jobs = await fetchJobAssignments(myProv.id).catch(() => []);
        setAssignments(jobs);
      }

      const subs = await fetchMySubmissions(user.id).catch(() => []);
      setMySubmissions(subs);

      const changes = await fetchMyChangeRequests(user.id).catch(() => []);
      setMyChanges(changes);
    } catch (err) {
      console.error('Provider portal load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmitChange = async () => {
    if (!myProvider || !changeField || !changeValue.trim()) return;
    setSubmittingChange(true);
    try {
      await submitChangeRequest(
        myProvider.id,
        user!.id,
        changeField,
        myProvider[changeField] || '',
        changeValue,
        changeReason
      );
      setChangeFeedback('Change request submitted! Admin will review it.');
      setChangeField('');
      setChangeValue('');
      setChangeReason('');
      loadData();
      setTimeout(() => setChangeFeedback(null), 4000);
    } catch (err) {
      setChangeFeedback('Failed to submit. Please try again.');
      setTimeout(() => setChangeFeedback(null), 4000);
    } finally {
      setSubmittingChange(false);
    }
  };

  const completedJobs = assignments.filter(a => a.status === 'completed');
  const activeJobs = assignments.filter(a => ['assigned', 'accepted', 'in-progress'].includes(a.status));

  if (loading) {
    return (
      <section className="py-20 bg-[#F5F5F0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading provider portal...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-[#F5F5F0] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-extrabold text-gray-900">Provider Portal</h1>
            </div>
            <p className="text-sm text-gray-500">
              {myProvider ? `Welcome, ${myProvider.name}` : 'Your provider dashboard'}
            </p>
          </div>
          <div className="flex gap-2">
            {(['profile', 'jobs', 'requests'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab ? 'bg-green-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}>
                {tab === 'requests' ? 'My Requests' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* No Provider Found */}
        {!myProvider && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Provider Profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your provider profile is either pending admin approval or not yet created. 
              All provider profiles must be approved by Gharun Nepal admin before appearing publicly.
            </p>
            {mySubmissions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-gray-700">Your Submissions:</p>
                {mySubmissions.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sub.data?.name || 'Application'}</p>
                      <p className="text-xs text-gray-500">{sub.submission_type?.replace('_', ' ')} - {new Date(sub.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      sub.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>{sub.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {myProvider && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Jobs', value: activeJobs.length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
              { label: 'Completed', value: myProvider.jobs_completed || completedJobs.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
              { label: 'Rating', value: myProvider.rating || '0', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
              { label: 'Status', value: myProvider.status, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} rounded-2xl p-5 border ${stat.border}`}>
                <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                <p className="text-2xl font-extrabold text-gray-900 capitalize">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && myProvider && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={myProvider.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(myProvider.name)}&background=C8102E&color=fff&size=200`}
                  alt={myProvider.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(myProvider.name)}&background=C8102E&color=fff&size=200`; }}
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{myProvider.name}</h3>
                  <p className="text-sm text-gray-500">{myProvider.service}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {myProvider.verified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {myProvider.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Phone', value: myProvider.phone },
                  { label: 'Location', value: myProvider.location },
                  { label: 'Category', value: categories.find(c => c.id === myProvider.category)?.name || myProvider.category },
                  { label: 'Status', value: myProvider.status },
                  { label: 'Jobs Completed', value: myProvider.jobs_completed || 0 },
                  { label: 'Member Since', value: new Date(myProvider.created_at).toLocaleDateString() },
                ].map((field, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{field.label}</p>
                      <Lock className="w-3 h-3 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{field.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    <strong>Read-Only Profile:</strong> All profile fields are managed by Gharun Nepal admin. 
                    To request changes, use the form below. Changes require admin approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Change Request Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-green-600" />
                Request Profile Change
              </h4>
              <p className="text-xs text-gray-500 mb-4">Submit a change request. Admin will review and approve/reject it.</p>

              {changeFeedback && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                  {changeFeedback}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Field to Change</label>
                  <select value={changeField} onChange={(e) => setChangeField(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-green-500 focus:outline-none bg-white">
                    <option value="">Select field...</option>
                    <option value="phone">Phone Number</option>
                    <option value="location">Location</option>
                    <option value="description">Description</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Value</label>
                  <input type="text" value={changeValue} onChange={(e) => setChangeValue(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-green-500 focus:outline-none"
                    placeholder="Enter the new value..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Reason (Optional)</label>
                  <textarea value={changeReason} onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-green-500 focus:outline-none resize-none" rows={2}
                    placeholder="Why do you need this change?" />
                </div>
                <button onClick={handleSubmitChange} disabled={submittingChange || !changeField || !changeValue.trim()}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {submittingChange ? 'Submitting...' : 'Submit Change Request'}
                </button>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  You <strong>cannot</strong> change: Name, Service Title, Rating, Jobs Done, or Verification Badge. 
                  These are admin-controlled fields.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Jobs Assigned</h3>
                <p className="text-sm text-gray-500">Jobs assigned to you by Gharun Connect admin will appear here.</p>
              </div>
            ) : (
              assignments.map((assignment) => {
                const req = assignment.service_requests;
                const category = categories.find(c => c.id === req?.service_type);
                return (
                  <div key={assignment.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-900">{req?.request_number || assignment.id.slice(0, 8)}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                            statusColors[assignment.status] || 'bg-gray-100 text-gray-600'
                          }`}>{assignment.status}</span>
                        </div>
                        <p className="text-xs text-gray-500">{category?.name || req?.service_type}</p>
                      </div>
                    </div>
                    {req && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-3">
                        <p className="text-sm text-gray-700">{req.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {req?.client_name || 'Client'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {req?.location || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {req?.preferred_date || 'N/A'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">My Submissions</h4>
              {mySubmissions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No submissions yet.</p>
                </div>
              ) : (
                mySubmissions.map(sub => (
                  <div key={sub.id} className="bg-white rounded-2xl border border-gray-200 p-4 mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sub.submission_type?.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{new Date(sub.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        sub.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                        sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{sub.status}</span>
                    </div>
                    {sub.admin_notes && <p className="text-xs text-blue-700 mt-2 p-2 bg-blue-50 rounded-lg"><strong>Admin:</strong> {sub.admin_notes}</p>}
                  </div>
                ))
              )}
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">My Change Requests</h4>
              {myChanges.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                  <Edit3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No change requests yet.</p>
                </div>
              ) : (
                myChanges.map(cr => (
                  <div key={cr.id} className="bg-white rounded-2xl border border-gray-200 p-4 mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Change: {cr.field_name}</p>
                        <p className="text-xs text-gray-500">{cr.current_value} → {cr.requested_value}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        cr.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        cr.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>{cr.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProviderPortal;
