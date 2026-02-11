import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, Camera, FileText, X, CheckCircle2, AlertCircle,
  Clock, XCircle, RefreshCw, Image, Trash2, Eye, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  uploadProviderDocument, fetchMyDocuments, deleteProviderDocument,
  getDocumentSignedUrl, DocumentType, ProviderDocument
} from '@/lib/database';

interface DocumentUploadProps {
  providerId?: string;
  compact?: boolean;
  onUploadComplete?: (docs: ProviderDocument[]) => void;
}

interface DocSlot {
  type: DocumentType;
  label: string;
  labelNp: string;
  description: string;
  required: boolean;
  accept: string;
}

const DOC_SLOTS: DocSlot[] = [
  {
    type: 'citizenship_front',
    label: 'Citizenship ID (Front)',
    labelNp: 'नागरिकता (अगाडि)',
    description: 'Front side of your Nepali citizenship card',
    required: true,
    accept: 'image/jpeg,image/png,image/jpg',
  },
  {
    type: 'citizenship_back',
    label: 'Citizenship ID (Back)',
    labelNp: 'नागरिकता (पछाडि)',
    description: 'Back side of your Nepali citizenship card',
    required: true,
    accept: 'image/jpeg,image/png,image/jpg',
  },
  {
    type: 'license',
    label: 'License / Certificate',
    labelNp: 'लाइसेन्स / प्रमाणपत्र',
    description: 'Professional license or training certificate (if applicable)',
    required: false,
    accept: 'image/jpeg,image/png,image/jpg,application/pdf',
  },
  {
    type: 'profile_photo',
    label: 'Profile Photo',
    labelNp: 'प्रोफाइल फोटो',
    description: 'Clear photo of your face for verification',
    required: false,
    accept: 'image/jpeg,image/png,image/jpg',
  },
];

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Pending / प्रतीक्षामा', labelShort: 'Pending' },
  verified: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Verified / प्रमाणित', labelShort: 'Verified' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Rejected / अस्वीकृत', labelShort: 'Rejected' },
};

const DocumentUpload: React.FC<DocumentUploadProps> = ({ providerId, compact = false, onUploadComplete }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ProviderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ProviderDocument | null>(null);
  const [dragOver, setDragOver] = useState<DocumentType | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const docs = await fetchMyDocuments(user.id);
      setDocuments(docs);
      onUploadComplete?.(docs);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, onUploadComplete]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const getDocForType = (type: DocumentType): ProviderDocument | undefined => {
    return documents.find(d => d.document_type === type && d.verification_status !== 'rejected');
  };

  const getRejectedDoc = (type: DocumentType): ProviderDocument | undefined => {
    return documents.find(d => d.document_type === type && d.verification_status === 'rejected');
  };

  const handleFileSelect = async (file: File, docType: DocumentType) => {
    if (!user?.id) {
      setError('Please sign in to upload documents. / कृपया कागजात अपलोड गर्न साइन इन गर्नुहोस्।');
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(docType);
    setUploadProgress(0);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      await uploadProviderDocument(user.id, file, docType, providerId);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(`${docType.replace(/_/g, ' ')} uploaded successfully! / सफलतापूर्वक अपलोड भयो!`);
      await loadDocuments();
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Upload failed / अपलोड असफल भयो');
    } finally {
      setTimeout(() => {
        setUploading(null);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentType) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file, docType);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent, docType: DocumentType) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file, docType);
  };

  const handleDelete = async (doc: ProviderDocument) => {
    if (doc.verification_status !== 'pending') return;
    try {
      await deleteProviderDocument(doc.id, doc.file_path);
      setSuccess('Document removed / कागजात हटाइयो');
      await loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete / हटाउन असफल');
    }
  };

  const handlePreview = async (doc: ProviderDocument) => {
    try {
      const url = await getDocumentSignedUrl(doc.file_path);
      setPreviewUrl(url);
      setPreviewDoc(doc);
    } catch (err: any) {
      setError('Failed to load preview / पूर्वावलोकन लोड गर्न असफल');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading documents...</span>
      </div>
    );
  }

  const totalRequired = DOC_SLOTS.filter(s => s.required).length;
  const uploadedRequired = DOC_SLOTS.filter(s => s.required && getDocForType(s.type)).length;
  const verifiedCount = documents.filter(d => d.verification_status === 'verified').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C8102E]" />
            Upload Documents / कागजात अपलोड
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload verification documents for admin review / प्रमाणीकरण कागजातहरू अपलोड गर्नुहोस्
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            uploadedRequired === totalRequired ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {uploadedRequired}/{totalRequired} required
          </span>
          {verifiedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              {verifiedCount} verified
            </span>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3.5 h-3.5 text-red-400" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-700">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto"><X className="w-3.5 h-3.5 text-green-400" /></button>
        </div>
      )}

      {/* Document Slots */}
      <div className={compact ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
        {DOC_SLOTS.map((slot) => {
          const existingDoc = getDocForType(slot.type);
          const rejectedDoc = getRejectedDoc(slot.type);
          const isUploading = uploading === slot.type;
          const isDraggedOver = dragOver === slot.type;
          const status = existingDoc ? STATUS_CONFIG[existingDoc.verification_status] : null;

          return (
            <div key={slot.type} className="relative">
              {/* Hidden file input */}
              <input
                ref={(el) => { fileInputRefs.current[slot.type] = el; }}
                type="file"
                accept={slot.accept}
                onChange={(e) => handleInputChange(e, slot.type)}
                className="hidden"
                capture={slot.type === 'profile_photo' ? 'user' : undefined}
              />

              {existingDoc ? (
                /* ===== UPLOADED STATE ===== */
                <div className={`rounded-xl border-2 p-3 transition-all ${status?.border} ${status?.bg}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      existingDoc.verification_status === 'verified' ? 'bg-green-200' :
                      existingDoc.verification_status === 'rejected' ? 'bg-red-200' : 'bg-yellow-200'
                    }`}>
                      {existingDoc.mime_type?.startsWith('image/') ? (
                        <Image className={`w-5 h-5 ${status?.color}`} />
                      ) : (
                        <FileText className={`w-5 h-5 ${status?.color}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                        {slot.required && <span className="text-[10px] text-red-500 font-medium">Required</span>}
                      </div>
                      <p className="text-[10px] text-gray-500">{slot.labelNp}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status?.bg} ${status?.color} border ${status?.border}`}>
                          {status && <status.icon className="w-3 h-3" />}
                          {status?.labelShort}
                        </span>
                        <span className="text-[10px] text-gray-400">{existingDoc.file_name} ({formatFileSize(existingDoc.file_size)})</span>
                      </div>
                      {existingDoc.verification_status === 'rejected' && existingDoc.rejection_reason && (
                        <p className="text-[10px] text-red-600 mt-1 font-medium">
                          Reason: {existingDoc.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handlePreview(existingDoc)} className="p-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" title="Preview">
                        <Eye className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      {existingDoc.verification_status === 'pending' && (
                        <button onClick={() => handleDelete(existingDoc)} className="p-1.5 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors" title="Remove">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ===== UPLOAD STATE ===== */
                <div
                  className={`rounded-xl border-2 border-dashed p-4 transition-all cursor-pointer ${
                    isUploading ? 'border-blue-300 bg-blue-50' :
                    isDraggedOver ? 'border-[#C8102E] bg-red-50 scale-[1.01]' :
                    'border-gray-300 bg-white hover:border-[#C8102E] hover:bg-red-50/30'
                  }`}
                  onClick={() => !isUploading && fileInputRefs.current[slot.type]?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(slot.type); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => handleDrop(e, slot.type)}
                >
                  {isUploading ? (
                    <div className="text-center py-2">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs font-semibold text-blue-700">Uploading... / अपलोड हुँदैछ...</p>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-[10px] text-blue-500 mt-1">{Math.round(uploadProgress)}%</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1.5">
                        {slot.type === 'profile_photo' ? (
                          <Camera className="w-6 h-6 text-gray-400" />
                        ) : (
                          <Upload className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{slot.label}</p>
                      <p className="text-[10px] text-gray-500">{slot.labelNp}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{slot.description}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="px-2.5 py-1 bg-[#C8102E] text-white rounded-lg text-[10px] font-semibold">
                          {slot.type === 'profile_photo' ? 'Take Photo / Gallery' : 'Upload from Gallery'}
                        </span>
                        {slot.required && <span className="text-[10px] text-red-500 font-medium">Required</span>}
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1.5">JPG, PNG{slot.accept.includes('pdf') ? ', PDF' : ''} - Max 5MB</p>
                      <p className="text-[9px] text-gray-400 hidden sm:block">or drag & drop here</p>
                    </div>
                  )}

                  {/* Show rejected doc info if exists */}
                  {rejectedDoc && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-[10px] text-red-600 font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Previous upload rejected
                      </p>
                      {rejectedDoc.rejection_reason && (
                        <p className="text-[10px] text-red-500 mt-0.5">Reason: {rejectedDoc.rejection_reason}</p>
                      )}
                      <p className="text-[10px] text-red-500 mt-0.5">Please upload a new document / कृपया नयाँ कागजात अपलोड गर्नुहोस्</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-800 font-medium">
            Your documents are stored securely and only visible to Gharun Nepal admin team.
          </p>
          <p className="text-[10px] text-blue-600 mt-0.5">
            तपाईंका कागजातहरू सुरक्षित रूपमा भण्डारण गरिन्छ र घरन नेपाल एड्मिन टोलीलाई मात्र देखिन्छ।
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && previewDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => { setPreviewUrl(null); setPreviewDoc(null); }}>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-semibold">{DOC_SLOTS.find(s => s.type === previewDoc.document_type)?.label}</p>
                <p className="text-[10px] text-gray-400">{previewDoc.file_name} ({formatFileSize(previewDoc.file_size)})</p>
              </div>
              <button onClick={() => { setPreviewUrl(null); setPreviewDoc(null); }} className="p-1.5 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh] flex items-center justify-center bg-gray-100">
              {previewDoc.mime_type === 'application/pdf' ? (
                <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg" title="Document Preview" />
              ) : (
                <img src={previewUrl} alt="Document preview" className="max-w-full max-h-[60vh] rounded-lg object-contain shadow-lg" />
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                STATUS_CONFIG[previewDoc.verification_status].bg
              } ${STATUS_CONFIG[previewDoc.verification_status].color} border ${STATUS_CONFIG[previewDoc.verification_status].border}`}>
                {React.createElement(STATUS_CONFIG[previewDoc.verification_status].icon, { className: 'w-3.5 h-3.5' })}
                {STATUS_CONFIG[previewDoc.verification_status].label}
              </span>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                Open Full Size
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
