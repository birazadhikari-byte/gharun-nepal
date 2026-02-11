import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Clock, CheckCircle2, Circle, MapPin, User, AlertCircle,
  RefreshCw, MessageCircle, CreditCard, CalendarDays, ArrowRight,
  Shield, Phone, Loader2, ChevronRight, Timer, Banknote, Truck,
  Copy, Check, Info, XCircle, Zap, Wrench, ClipboardList
} from 'lucide-react';
import { statusColors, statusLabels, categories } from '@/data/gharunData';
import { fetchRequestByNumber } from '@/lib/database';

const GHARUN_WHATSAPP = '9779713242471';

// ============ STATUS TIMELINE CONFIG ============
const STATUS_STEPS = [
  {
    key: 'submitted',
    en: 'Request Submitted',
    np: 'अनुरोध पेश भयो',
    descEn: 'Your request has been received by Gharun Nepal',
    descNp: 'तपाईंको अनुरोध घरन नेपालले प्राप्त गरेको छ',
    icon: ClipboardList,
    color: 'yellow',
  },
  {
    key: 'confirmed',
    en: 'Details Confirmed',
    np: 'विवरण पुष्टि भयो',
    descEn: 'Our team has verified your request details and pricing',
    descNp: 'हाम्रो टोलीले तपाईंको अनुरोध विवरण र मूल्य प्रमाणित गरेको छ',
    icon: CheckCircle2,
    color: 'blue',
  },
  {
    key: 'assigned',
    en: 'Provider Assigned',
    np: 'प्रदायक तोकियो',
    descEn: 'A verified provider has been assigned to your request',
    descNp: 'तपाईंको अनुरोधमा प्रमाणित प्रदायक तोकिएको छ',
    icon: User,
    color: 'purple',
  },
  {
    key: 'in-progress',
    en: 'Work In Progress',
    np: 'काम प्रगतिमा छ',
    descEn: 'The provider is currently working on your request',
    descNp: 'प्रदायकले तपाईंको अनुरोधमा काम गर्दैछ',
    icon: Wrench,
    color: 'orange',
  },
  {
    key: 'completed',
    en: 'Job Completed',
    np: 'काम सम्पन्न भयो',
    descEn: 'The service has been completed successfully',
    descNp: 'सेवा सफलतापूर्वक सम्पन्न भएको छ',
    icon: CheckCircle2,
    color: 'green',
  },
];

// ============ HELPER FUNCTIONS ============
function getStatusIndex(status: string): number {
  return STATUS_STEPS.findIndex(s => s.key === status);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getEstimatedCompletion(request: any): { en: string; np: string } | null {
  if (request.status === 'completed') return null;
  if (request.status === 'cancelled') return null;

  const urgency = request.urgency || 'normal';
  const created = new Date(request.created_at);
  let hoursToAdd = 48; // default normal

  if (urgency === 'emergency') hoursToAdd = 4;
  else if (urgency === 'urgent') hoursToAdd = 12;
  else hoursToAdd = 48;

  // Adjust based on current status
  const statusIdx = getStatusIndex(request.status);
  if (statusIdx >= 3) hoursToAdd = Math.max(2, hoursToAdd * 0.2); // in-progress: almost done
  else if (statusIdx >= 2) hoursToAdd = Math.max(4, hoursToAdd * 0.5); // assigned
  else if (statusIdx >= 1) hoursToAdd = Math.max(6, hoursToAdd * 0.7); // confirmed

  const est = new Date(created.getTime() + hoursToAdd * 60 * 60 * 1000);
  const now = new Date();

  if (est < now) {
    // Overdue — show "soon"
    return { en: 'Expected soon', np: 'चाँडै अपेक्षित' };
  }

  const diffMs = est.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return {
      en: `~${diffDays} day${diffDays > 1 ? 's' : ''} remaining`,
      np: `~${diffDays} दिन बाँकी`,
    };
  }
  if (diffHours > 0) {
    return {
      en: `~${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`,
      np: `~${diffHours} घण्टा बाँकी`,
    };
  }
  return { en: 'Expected very soon', np: 'धेरै चाँडै अपेक्षित' };
}

function getPaymentStatusInfo(request: any): { label: string; labelNp: string; color: string; icon: typeof CreditCard } {
  const ps = request.payment_status || 'pending';
  switch (ps) {
    case 'paid':
    case 'received':
      return { label: 'Payment Received', labelNp: 'भुक्तानी प्राप्त भयो', color: 'green', icon: CheckCircle2 };
    case 'pending':
      return { label: 'Payment Pending', labelNp: 'भुक्तानी बाँकी', color: 'yellow', icon: Clock };
    case 'overdue':
      return { label: 'Payment Overdue', labelNp: 'भुक्तानी ढिला', color: 'red', icon: AlertCircle };
    default:
      return { label: 'Payment Pending', labelNp: 'भुक्तानी बाँकी', color: 'yellow', icon: Clock };
  }
}

function getUrgencyBadge(urgency: string): { en: string; np: string; color: string } {
  switch (urgency) {
    case 'emergency':
      return { en: 'Emergency', np: 'आपतकालीन', color: 'bg-red-100 text-red-700 border-red-200' };
    case 'urgent':
      return { en: 'Urgent', np: 'जरुरी', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    default:
      return { en: 'Normal', np: 'सामान्य', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  }
}


// ============ MAIN COMPONENT ============
const StatusTracker: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (autoRefresh && request) {
      intervalRef.current = setInterval(() => {
        handleRefresh();
      }, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, request?.request_number]);

  const handleSearch = useCallback(async () => {
    const id = trackingId.trim().toUpperCase();
    if (!id) {
      setError('Please enter a request number / कृपया अनुरोध नम्बर हाल्नुहोस्');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const found = await fetchRequestByNumber(id);
      if (found) {
        setRequest(found);
        setLastRefreshed(new Date());
      } else {
        setRequest(null);
        setError('Request not found. Please check the number and try again.\nअनुरोध भेटिएन। कृपया नम्बर जाँच गर्नुहोस् र पुन: प्रयास गर्नुहोस्।');
      }
    } catch {
      setError('Search failed. Please try again.\nखोज असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।');
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [trackingId]);

  const handleRefresh = useCallback(async () => {
    if (!request?.request_number) return;
    setRefreshing(true);
    try {
      const found = await fetchRequestByNumber(request.request_number);
      if (found) {
        setRequest(found);
        setLastRefreshed(new Date());
      }
    } catch {
      // Silent fail on refresh
    } finally {
      setRefreshing(false);
    }
  }, [request?.request_number]);

  const handleCopyId = useCallback(() => {
    if (!request?.request_number) return;
    navigator.clipboard.writeText(request.request_number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [request?.request_number]);

  const openWhatsApp = useCallback((reqNumber?: string) => {
    const msg = encodeURIComponent(
      `Namaste! I'd like to check on my request${reqNumber ? ` ${reqNumber}` : ''}. Can you please provide an update?\n\nनमस्ते! मेरो अनुरोध${reqNumber ? ` ${reqNumber}` : ''} बारेमा जानकारी चाहिन्छ।`
    );
    window.open(`https://wa.me/${GHARUN_WHATSAPP}?text=${msg}`, '_blank');
  }, []);

  const handleReset = useCallback(() => {
    setRequest(null);
    setSearched(false);
    setTrackingId('');
    setError('');
    setAutoRefresh(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    inputRef.current?.focus();
  }, []);

  const isCancelled = request?.status === 'cancelled';
  const isCompleted = request?.status === 'completed';
  const currentIndex = request ? getStatusIndex(request.status) : -1;
  const category = request ? categories.find(c => c.id === (request.service_type || request.serviceType)) : null;
  const estimatedCompletion = request ? getEstimatedCompletion(request) : null;
  const paymentInfo = request ? getPaymentStatusInfo(request) : null;
  const urgencyBadge = request ? getUrgencyBadge(request.urgency || 'normal') : null;

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* ============ HERO / SEARCH SECTION ============ */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/5 via-transparent to-blue-50/50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8102E]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <div className="w-2 h-2 bg-[#C8102E] rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-700">Real-Time Tracking</span>
              <span className="text-xs text-gray-400">वास्तविक समय ट्र्याकिङ</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
              Track My <span className="text-[#C8102E]">Request</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 mt-2 font-medium">
              मेरो अनुरोध ट्र्याक गर्नुहोस्
            </p>
            <p className="text-sm text-gray-400 mt-3 max-w-lg mx-auto">
              Enter your request number to see real-time status, assigned provider, and payment details
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              वास्तविक स्थिति, तोकिएको प्रदायक, र भुक्तानी विवरण हेर्न अनुरोध नम्बर हाल्नुहोस्
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-2 sm:p-3">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={trackingId}
                    onChange={(e) => { setTrackingId(e.target.value.toUpperCase()); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="GN-260210-4161"
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 border-2 border-gray-100 rounded-xl text-sm sm:text-base font-mono font-semibold text-gray-900 placeholder:text-gray-300 placeholder:font-normal focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/10 focus:outline-none transition-all bg-gray-50/50"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#C8102E] text-white rounded-xl font-bold text-sm sm:text-base hover:bg-[#A00D24] active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">Track Now</span>
                      <span className="sm:hidden">Track</span>
                    </>
                  )}
                </button>
              </div>

              {/* Hint */}
              <div className="flex items-center justify-between mt-2 px-2">
                <p className="text-[11px] text-gray-400">
                  Format: <span className="font-mono font-medium text-gray-500">GN-YYMMDD-XXXX</span>
                </p>
                {searched && request && (
                  <button
                    onClick={handleReset}
                    className="text-[11px] text-[#C8102E] font-medium hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> New search / नयाँ खोज
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  {error.split('\n').map((line, i) => (
                    <p key={i} className={`text-sm ${i === 0 ? 'font-medium text-red-700' : 'text-red-500 text-xs mt-0.5'}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ LOADING STATE ============ */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-700 font-semibold">Searching for your request...</p>
            <p className="text-gray-400 text-sm mt-1">तपाईंको अनुरोध खोज्दै...</p>
          </div>
        </div>
      )}

      {/* ============ NOT FOUND STATE ============ */}
      {searched && !loading && !request && !error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Request Not Found</h3>
            <p className="text-sm text-gray-500 mt-1">अनुरोध भेटिएन</p>
            <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">
              Please double-check your request number and try again. If you need help, contact us on WhatsApp.
            </p>
            <button
              onClick={() => openWhatsApp()}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Ask on WhatsApp / व्हाट्सएपमा सोध्नुहोस्
            </button>
          </div>
        </div>
      )}

      {/* ============ REQUEST FOUND — FULL DETAILS ============ */}
      {request && !loading && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* ---- Top Bar: Request ID + Status + Refresh ---- */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Request</span>
                  <span className="font-mono font-bold text-lg text-gray-900">{request.request_number}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                    title="Copy request number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isCancelled ? 'bg-red-100 text-red-700 border-red-200' :
                  isCompleted ? 'bg-green-100 text-green-700 border-green-200' :
                  statusColors[request.status] || 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {statusLabels[request.status] || request.status}
                </span>
                {urgencyBadge && request.urgency !== 'normal' && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${urgencyBadge.color}`}>
                    {urgencyBadge.en} / {urgencyBadge.np}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Auto-refresh toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-9 h-5 rounded-full transition-colors ${autoRefresh ? 'bg-[#C8102E]' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${autoRefresh ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Auto-refresh</span>
                </label>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {lastRefreshed && (
              <p className="text-[10px] text-gray-400 mt-2 text-right">
                Last updated: {lastRefreshed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                {autoRefresh && <span className="ml-1 text-[#C8102E]">(auto-refreshing every 30s)</span>}
              </p>
            )}
          </div>

          {/* ---- Main Grid ---- */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* ---- LEFT COLUMN: Timeline ---- */}
            <div className="lg:col-span-2 space-y-6">
              {/* Visual Timeline */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-[#C8102E]" />
                    Status Timeline
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">स्थिति समयरेखा</p>
                </div>

                <div className="p-6">
                  {isCancelled ? (
                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <p className="font-bold text-red-700">Request Cancelled</p>
                        <p className="text-sm text-red-500">अनुरोध रद्द भयो</p>
                        {request.cancellation_reason && (
                          <p className="text-xs text-red-400 mt-1">Reason: {request.cancellation_reason}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {STATUS_STEPS.map((step, index) => {
                        const StepIcon = step.icon;
                        const isStepCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const isLast = index === STATUS_STEPS.length - 1;

                        const bgColor = isStepCompleted
                          ? step.color === 'green' ? 'bg-green-500' :
                            step.color === 'blue' ? 'bg-blue-500' :
                            step.color === 'purple' ? 'bg-purple-500' :
                            step.color === 'orange' ? 'bg-orange-500' :
                            step.color === 'yellow' ? 'bg-yellow-500' :
                            'bg-gray-300'
                          : 'bg-gray-200';

                        const ringColor = isCurrent
                          ? step.color === 'green' ? 'ring-green-200' :
                            step.color === 'blue' ? 'ring-blue-200' :
                            step.color === 'purple' ? 'ring-purple-200' :
                            step.color === 'orange' ? 'ring-orange-200' :
                            step.color === 'yellow' ? 'ring-yellow-200' :
                            'ring-gray-200'
                          : '';

                        return (
                          <div key={step.key} className="flex gap-4">
                            {/* Timeline dot + line */}
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${bgColor} ${isCurrent ? `ring-4 ${ringColor} shadow-md` : ''}`}>
                                {isStepCompleted ? (
                                  <StepIcon className="w-5 h-5 text-white" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              {!isLast && (
                                <div className={`w-0.5 flex-1 min-h-[3rem] ${index < currentIndex ? bgColor : 'bg-gray-200'} transition-all`} />
                              )}
                            </div>

                            {/* Content */}
                            <div className={`pb-8 ${isLast ? 'pb-0' : ''} flex-1`}>
                              <div className={`${isCurrent ? 'bg-gray-50 -mx-2 px-3 py-2 rounded-xl border border-gray-100' : ''}`}>
                                <p className={`text-sm font-bold ${isStepCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {step.en}
                                </p>
                                <p className={`text-xs ${isStepCompleted ? 'text-gray-500' : 'text-gray-300'} mt-0.5`}>
                                  {step.np}
                                </p>
                                {isCurrent && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-600">{step.descEn}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{step.descNp}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                      </span>
                                      <span className="text-[10px] font-semibold text-green-600">Current Status / हालको स्थिति</span>
                                    </div>
                                  </div>
                                )}
                                {isStepCompleted && !isCurrent && (
                                  <p className="text-[10px] text-green-600 font-medium mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Completed / सम्पन्न
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details Card */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#C8102E]" />
                    Request Details
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">अनुरोध विवरण</p>
                </div>

                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Service Type */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 bg-[#C8102E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-4 h-4 text-[#C8102E]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Service / सेवा</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          {category?.name || request.service_type || 'N/A'}
                        </p>
                        {category?.nameNp && (
                          <p className="text-[10px] text-gray-400">{category.nameNp}</p>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Location / स्थान</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{request.location || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Client Name */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Client / ग्राहक</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{request.client_name || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Submitted Date */}
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Submitted / पेश गरिएको</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateTime(request.created_at)}</p>
                      </div>
                    </div>

                    {/* Preferred Date */}
                    {request.preferred_date && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Preferred Date / मनपर्ने मिति</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {formatDate(request.preferred_date)}
                            {request.preferred_time && ` — ${request.preferred_time}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Urgency */}
                    {request.urgency && request.urgency !== 'normal' && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Urgency / तत्कालता</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {urgencyBadge?.en} <span className="text-xs text-gray-400">({urgencyBadge?.np})</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {request.description && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Description / विवरण</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ---- RIGHT COLUMN: Provider + Payment + ETA ---- */}
            <div className="space-y-6">
              {/* Estimated Completion */}
              {estimatedCompletion && !isCancelled && (
                <div className="bg-gradient-to-br from-[#C8102E] to-[#8B0A1E] rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Timer className="w-5 h-5 text-white/80" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">Estimated Completion</h3>
                  </div>
                  <p className="text-xs text-white/60 mb-3">अनुमानित सम्पन्न समय</p>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-xl font-extrabold">{estimatedCompletion.en}</p>
                    <p className="text-sm text-white/70 mt-0.5">{estimatedCompletion.np}</p>
                  </div>
                  <p className="text-[10px] text-white/50 mt-3 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Based on urgency level and current status
                  </p>
                </div>
              )}

              {/* Completed Badge */}
              {isCompleted && (
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold">Completed!</p>
                      <p className="text-sm text-white/80">काम सम्पन्न भयो!</p>
                    </div>
                  </div>
                  {request.updated_at && (
                    <p className="text-xs text-white/60 mt-3">
                      Completed on {formatDateTime(request.updated_at)}
                    </p>
                  )}
                </div>
              )}

              {/* Assigned Provider */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C8102E]" />
                    Assigned Provider
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">तोकिएको प्रदायक</p>
                </div>

                <div className="p-5">
                  {request.assigned_provider_name ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{request.assigned_provider_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] font-semibold text-green-600">Verified Provider / प्रमाणित प्रदायक</span>
                          </div>
                        </div>
                      </div>

                      {request.assigned_provider_phone && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-[10px] text-gray-400">Provider Contact (via Gharun)</p>
                            <p className="text-xs font-medium text-gray-600">Contact through platform only</p>
                            <p className="text-[10px] text-gray-400">प्लेटफर्ममार्फत मात्र सम्पर्क गर्नुहोस्</p>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-blue-600 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          For safety, all communication goes through Gharun Nepal
                        </p>
                        <p className="text-[10px] text-blue-500 mt-0.5">
                          सुरक्षाको लागि सबै सञ्चार घरन नेपालमार्फत हुन्छ
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">
                        {isCancelled ? 'No provider assigned' : 'Finding a provider...'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isCancelled ? 'प्रदायक तोकिएको छैन' : 'प्रदायक खोज्दै...'}
                      </p>
                      {!isCancelled && (
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8102E]/60 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8102E]" />
                          </span>
                          <span className="text-[10px] text-[#C8102E] font-medium">Our team is working on it</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#C8102E]" />
                    Payment Status
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">भुक्तानी स्थिति</p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Payment Status Badge */}
                  {paymentInfo && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                      paymentInfo.color === 'green' ? 'bg-green-50 border-green-200' :
                      paymentInfo.color === 'red' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}>
                      {React.createElement(paymentInfo.icon, {
                        className: `w-5 h-5 flex-shrink-0 ${
                          paymentInfo.color === 'green' ? 'text-green-500' :
                          paymentInfo.color === 'red' ? 'text-red-500' :
                          'text-yellow-500'
                        }`
                      })}
                      <div>
                        <p className={`text-sm font-bold ${
                          paymentInfo.color === 'green' ? 'text-green-700' :
                          paymentInfo.color === 'red' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>{paymentInfo.label}</p>
                        <p className={`text-[10px] ${
                          paymentInfo.color === 'green' ? 'text-green-500' :
                          paymentInfo.color === 'red' ? 'text-red-500' :
                          'text-yellow-500'
                        }`}>{paymentInfo.labelNp}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Banknote className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Payment Method / भुक्तानी विधि</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize mt-0.5">
                        {request.payment_method === 'cash' ? 'Cash on Delivery (COD)' :
                         request.payment_method === 'online' ? 'Online Payment' :
                         request.payment_method || 'Cash'}
                      </p>
                    </div>
                  </div>

                  {/* Cost Info */}
                  {(request.estimated_cost || request.final_cost) && (
                    <div className="space-y-2">
                      {request.estimated_cost && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-xs text-gray-500">Estimated Cost / अनुमानित लागत</span>
                          <span className="text-sm font-bold text-gray-900">Rs. {Number(request.estimated_cost).toLocaleString()}</span>
                        </div>
                      )}
                      {request.final_cost && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                          <span className="text-xs text-green-600 font-medium">Final Cost / अन्तिम लागत</span>
                          <span className="text-sm font-bold text-green-700">Rs. {Number(request.final_cost).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Received Date */}
                  {request.payment_received_at && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-[10px] text-green-600">Payment received on</p>
                        <p className="text-xs font-medium text-green-700">{formatDateTime(request.payment_received_at)}</p>
                      </div>
                    </div>
                  )}

                  {/* No cost set yet */}
                  {!request.estimated_cost && !request.final_cost && (
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-400">Cost will be confirmed by Gharun Connect</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">लागत घरन कनेक्टले पुष्टि गर्नेछ</p>
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Support CTA */}
              {!isCompleted && !isCancelled && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Need Help?</h3>
                    <p className="text-xs text-gray-400 mb-4">सहयोग चाहिन्छ?</p>
                    <button
                      onClick={() => openWhatsApp(request.request_number)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 active:scale-[0.98] transition-all shadow-md"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Contact Gharun Connect
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      घरन कनेक्टमा सम्पर्क गर्नुहोस् — +977-9713242471
                    </p>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700">Your Privacy is Protected</p>
                    <p className="text-[10px] text-blue-500 mt-0.5">तपाईंको गोपनीयता सुरक्षित छ</p>
                    <p className="text-[10px] text-blue-400 mt-2 leading-relaxed">
                      Your personal details are never shared directly with providers. All communication is coordinated through Gharun Nepal.
                    </p>
                    <p className="text-[10px] text-blue-400 mt-1 leading-relaxed">
                      तपाईंको व्यक्तिगत विवरण प्रदायकहरूसँग सिधा साझा गरिँदैन। सबै सञ्चार घरन नेपालमार्फत समन्वय गरिन्छ।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ EMPTY STATE (before search) ============ */}
      {!searched && !loading && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* How to find your request number */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-6 sm:p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Where to find your request number?
            </h3>
            <p className="text-xs text-gray-400 mb-6">तपाईंको अनुरोध नम्बर कहाँ पाउने?</p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-[#C8102E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#C8102E]">1</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Confirmation Screen</p>
                  <p className="text-xs text-gray-500 mt-0.5">Shown after you submit a request</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">अनुरोध पेश गरेपछि देखिन्छ</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-[#C8102E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#C8102E]">2</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Your Dashboard</p>
                  <p className="text-xs text-gray-500 mt-0.5">Listed under "My Requests"</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">"मेरा अनुरोधहरू" मा सूचीबद्ध</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">WhatsApp Message</p>
                  <p className="text-xs text-gray-500 mt-0.5">Sent to you by Gharun Connect</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">घरन कनेक्टबाट पठाइएको</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Flow Explainer */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              How request tracking works
            </h3>
            <p className="text-xs text-gray-400 mb-6">अनुरोध ट्र्याकिङ कसरी काम गर्छ</p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {STATUS_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const bgClass =
                  step.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                  step.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                  step.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                  step.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                  'bg-green-50 border-green-200';
                const iconClass =
                  step.color === 'yellow' ? 'text-yellow-600' :
                  step.color === 'blue' ? 'text-blue-600' :
                  step.color === 'purple' ? 'text-purple-600' :
                  step.color === 'orange' ? 'text-orange-600' :
                  'text-green-600';

                return (
                  <React.Fragment key={step.key}>
                    <div className={`flex-1 p-3 rounded-xl border ${bgClass} text-center`}>
                      <StepIcon className={`w-5 h-5 mx-auto mb-1.5 ${iconClass}`} />
                      <p className="text-xs font-bold text-gray-800">{step.en}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{step.np}</p>
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div className="flex items-center justify-center sm:flex-shrink-0">
                        <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                        <ArrowRight className="w-4 h-4 text-gray-300 sm:hidden rotate-90" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-3">
              Can't find your request number? / अनुरोध नम्बर भेटिएन?
            </p>
            <button
              onClick={() => openWhatsApp()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Ask Gharun Connect on WhatsApp
            </button>
            <p className="text-[10px] text-gray-400 mt-2">+977-9713242471</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default StatusTracker;
