import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle2, XCircle, Clock, Eye, RefreshCw,
  Image, Search, Shield, X, Award, Sparkles
} from 'lucide-react';
import {
  adminListPendingDocuments, adminListProviderDocuments,
  adminVerifyDocument, adminRejectDocument, adminGetDocumentSignedUrl,
  ProviderDocument, VerifyDocumentResult
} from '@/lib/database';

const DOC_TYPE_LABELS: Record<string, { label: string; labelNp: string }> = {
  citizenship_front: { label: 'Citizenship (Front)', labelNp: 'नागरिकता (अगाडि)' },
  citizenship_back: { label: 'Citizenship (Back)', labelNp: 'नागरिकता (पछाडि)' },
  license: { label: 'License / Certificate', labelNp: 'लाइसेन्स / प्रमाणपत्र' },
  profile_photo: { label: 'Profile Photo', labelNp: 'प्रोफाइल फोटो' },
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300', label: 'Pending' },
  verified: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300', label: 'Verified' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300', label: 'Rejected' },
};

const DocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ProviderDocument | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoVerifyBanner, setAutoVerifyBanner] = useState<{ userId: string; providerIds: string[] } | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadDocuments = useCallback(async () => {
    try {
      let docs: ProviderDocument[];
      if (filter === 'pending') {
        docs = await adminListPendingDocuments();
      } else {
        docs = await adminListProviderDocuments(
          filter !== 'all' ? { verification_status: filter } : undefined
        );
      }
      setDocuments(docs || []);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const result: VerifyDocumentResult = await adminVerifyDocument(id);
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, verification_status: 'verified' as const } : d));

      // Check if auto-verification happened
      if (result?._autoVerification?.providerAutoVerified) {
        const providerIds = result._autoVerification.autoVerifiedProviderIds || [];
        setAutoVerifyBanner({ userId: result.user_id, providerIds });
        showFeedback('Document verified + Provider AUTO-VERIFIED! All required documents are now verified.');
        // Auto-dismiss banner after 8 seconds
        setTimeout(() => setAutoVerifyBanner(null), 8000);
      } else {
        showFeedback('Document verified successfully');
      }
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Verification failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      showFeedback('Please provide a rejection reason');
      return;
    }
    setActionLoading(id);
    try {
      await adminRejectDocument(id, rejectReason);
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, verification_status: 'rejected' as const, rejection_reason: rejectReason } : d));
      setRejectingId(null);
      setRejectReason('');
      showFeedback('Document rejected');
    } catch (err: any) {
      showFeedback('Error: ' + (err.message || 'Rejection failed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handlePreview = async (doc: ProviderDocument) => {
    try {
      const url = await adminGetDocumentSignedUrl(doc.file_path);
      setPreviewUrl(url);
      setPreviewDoc(doc);
    } catch (err: any) {
      showFeedback('Failed to load preview');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredDocs = documents.filter(d => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return d.user_id?.toLowerCase().includes(q) ||
        d.file_name?.toLowerCase().includes(q) ||
        d.document_type?.toLowerCase().includes(q) ||
        d.provider_id?.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = documents.filter(d => d.verification_status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed top-24 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300 max-w-sm">
          {feedback}
        </div>
      )}

      {/* Auto-Verification Success Banner */}
      {autoVerifyBanner && (
        <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-lg font-bold">Provider Auto-Verified!</h4>
              </div>
              <p className="text-sm text-white/90 mb-2">
                All required documents (Citizenship Front & Back) are now verified.
                The provider has been automatically set to <strong>verified = true</strong> and <strong>status = active</strong>.
              </p>
              <p className="text-xs text-white/70">
                प्रदायक स्वचालित रूपमा प्रमाणित भयो! सबै आवश्यक कागजातहरू प्रमाणित भए।
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                  User: {autoVerifyBanner.userId.slice(0, 8)}...
                </span>
                {autoVerifyBanner.providerIds.map(pid => (
                  <span key={pid} className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                    Provider: {pid.slice(0, 8)}...
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => setAutoVerifyBanner(null)} className="p-1.5 hover:bg-white/20 rounded-lg flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Document Verification
          </h3>
          <p className="text-xs text-gray-500">
            Review and verify provider documents / प्रदायक कागजात समीक्षा
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold">
                {pendingCount} pending
              </span>
            )}
          </p>
          <p className="text-[10px] text-green-600 mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Auto-verification: When both citizenship docs are verified, provider is automatically activated.
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user ID, file name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['pending', 'all', 'verified', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true); }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
              {f === 'verified' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
              {f === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-900 mb-1">No Documents Found</h4>
          <p className="text-sm text-gray-500">
            {filter === 'pending' ? 'No pending documents to review' : 'No documents match your filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc) => {
            const typeInfo = DOC_TYPE_LABELS[doc.document_type] || { label: doc.document_type, labelNp: '' };
            const statusCfg = STATUS_CONFIG[doc.verification_status];
            const isRejecting = rejectingId === doc.id;
            const isRequired = doc.document_type === 'citizenship_front' || doc.document_type === 'citizenship_back';

            return (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusCfg.bg}`}>
                      {doc.mime_type?.startsWith('image/') ? (
                        <Image className={`w-6 h-6 ${statusCfg.color}`} />
                      ) : (
                        <FileText className={`w-6 h-6 ${statusCfg.color}`} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">{typeInfo.label}</p>
                        {isRequired && (
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-bold border border-red-200">
                            REQUIRED
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                          {React.createElement(statusCfg.icon, { className: 'w-3 h-3' })}
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{typeInfo.labelNp}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 flex-wrap">
                        <span>File: {doc.file_name}</span>
                        <span>Size: {formatFileSize(doc.file_size)}</span>
                        <span>User: {doc.user_id?.slice(0, 8)}...</span>
                        <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                      {doc.rejection_reason && (
                        <p className="text-[10px] text-red-600 mt-1 font-medium">
                          Rejection reason: {doc.rejection_reason}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons for Pending */}
                  {doc.verification_status === 'pending' && !isRejecting && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleVerify(doc.id)}
                        disabled={actionLoading === doc.id}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {actionLoading === doc.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Verify / प्रमाणित
                      </button>
                      <button
                        onClick={() => setRejectingId(doc.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}

                  {/* Reject Form */}
                  {isRejecting && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-xs font-semibold text-red-700">Rejection Reason / अस्वीकृतिको कारण:</p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g., Image is blurry, wrong document type..."
                        rows={2}
                        className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:border-red-500 focus:outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(doc.id)}
                          disabled={actionLoading === doc.id || !rejectReason.trim()}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {actionLoading === doc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && previewDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => { setPreviewUrl(null); setPreviewDoc(null); }}>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-900 px-5 py-4 flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-semibold">{DOC_TYPE_LABELS[previewDoc.document_type]?.label || previewDoc.document_type}</p>
                <p className="text-[10px] text-gray-400">
                  {previewDoc.file_name} | User: {previewDoc.user_id?.slice(0, 8)}... | {formatFileSize(previewDoc.file_size)}
                </p>
              </div>
              <button onClick={() => { setPreviewUrl(null); setPreviewDoc(null); }} className="p-1.5 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh] flex items-center justify-center bg-gray-100">
              {previewDoc.mime_type === 'application/pdf' ? (
                <iframe src={previewUrl} className="w-full h-[65vh] rounded-lg" title="Document Preview" />
              ) : (
                <img src={previewUrl} alt="Document preview" className="max-w-full max-h-[65vh] rounded-lg object-contain shadow-lg" />
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                STATUS_CONFIG[previewDoc.verification_status].bg
              } ${STATUS_CONFIG[previewDoc.verification_status].color} border ${STATUS_CONFIG[previewDoc.verification_status].border}`}>
                {React.createElement(STATUS_CONFIG[previewDoc.verification_status].icon, { className: 'w-3.5 h-3.5' })}
                {STATUS_CONFIG[previewDoc.verification_status].label}
              </span>
              <div className="flex gap-2">
                {previewDoc.verification_status === 'pending' && (
                  <>
                    <button
                      onClick={() => { handleVerify(previewDoc.id); setPreviewUrl(null); setPreviewDoc(null); }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                    </button>
                    <button
                      onClick={() => { setRejectingId(previewDoc.id); setPreviewUrl(null); setPreviewDoc(null); }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200">
                  Open Full Size
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
