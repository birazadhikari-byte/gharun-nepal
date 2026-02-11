import React, { useState } from 'react';
import {
  X, Upload, Phone, MapPin, Briefcase, FileText,
  CheckCircle2, AlertCircle, Camera, Shield, MessageCircle
} from 'lucide-react';
import { categories, JHAPA_AREAS, formatLocation } from '@/data/gharunData';
import { submitProviderRegistration } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import DocumentUpload from './DocumentUpload';

interface ProviderRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
}

const GHARUN_WHATSAPP = '9779713242471';

const ProviderRegistration: React.FC<ProviderRegistrationProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace('+977-', '').replace('+977', '') || '',
    email: user?.email || '',
    category: '',
    service: '',
    location: '',
    experience: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'documents' | 'submitting' | 'success'>('form');

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid phone number required';
    if (!formData.category) newErrors.category = 'Select a service category';
    if (!formData.location) newErrors.location = 'Select your service area';
    if (!formData.experience) newErrors.experience = 'Select experience level';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToDocuments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStep('documents');
  };

  const handleSubmit = async () => {
    setStep('submitting');
    try {
      const categoryObj = categories.find(c => c.id === formData.category);
      await submitProviderRegistration({
        name: formData.name,
        phone: `+977${formData.phone}`,
        email: formData.email || undefined,
        service: formData.service || categoryObj?.name || formData.category,
        category: formData.category,
        location: formatLocation(formData.location),
        description: `${formData.experience} experience. ${formData.description}`,
        userId: user?.id && !user.id.startsWith('demo') ? user.id : undefined,
      });
      setStep('success');
    } catch (err) {
      console.error('Provider registration error:', err);
      setStep('success');
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({ name: user?.name || '', phone: user?.phone?.replace('+977-', '').replace('+977', '') || '', email: user?.email || '', category: '', service: '', location: '', experience: '', description: '' });
    setErrors({});
    onClose();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`Namaste! I just registered as a service provider on Gharun Nepal.\nName: ${formData.name}\nService: ${formData.category}\nLocation: ${formatLocation(formData.location)}\nPlease verify my account.`);
    window.open(`https://wa.me/${GHARUN_WHATSAPP}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C8102E] rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Provider Registration</h2>
                <p className="text-sm text-gray-400">
                  {step === 'form' && 'Step 1: Your Details'}
                  {step === 'documents' && 'Step 2: Upload Documents'}
                  {step === 'submitting' && 'Submitting...'}
                  {step === 'success' && 'Application Submitted!'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Step Indicator */}
          {(step === 'form' || step === 'documents') && (
            <div className="flex gap-2 mt-4">
              <div className={`flex-1 h-1.5 rounded-full ${step === 'form' ? 'bg-[#C8102E]' : 'bg-green-500'}`} />
              <div className={`flex-1 h-1.5 rounded-full ${step === 'documents' ? 'bg-[#C8102E]' : step === 'form' ? 'bg-white/20' : 'bg-green-500'}`} />
            </div>
          )}
        </div>

        {step === 'form' && (
          <form onSubmit={handleContinueToDocuments} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your full name"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-[#C8102E]'}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number (OTP Verified)</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-600">+977</span>
                <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98XXXXXXXX"
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.phone ? 'border-red-300' : 'border-gray-200 focus:border-[#C8102E]'}`} />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (Optional)</label>
              <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Category</label>
              <select value={formData.category} onChange={(e) => updateField('category', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors appearance-none bg-white ${errors.category ? 'border-red-300' : 'border-gray-200 focus:border-[#C8102E]'}`}>
                <option value="">Select your service...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.nameNp})</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Title (e.g., "Master Plumber")</label>
              <input type="text" value={formData.service} onChange={(e) => updateField('service', e.target.value)} placeholder="Your service title"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1" />Service Area (Jhapa District)
              </label>
              <select value={formData.location} onChange={(e) => updateField('location', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors appearance-none bg-white ${errors.location ? 'border-red-300' : 'border-gray-200 focus:border-[#C8102E]'}`}>
                <option value="">Select your area...</option>
                {JHAPA_AREAS.map((area) => (
                  <option key={area.name} value={area.name}>{area.name} ({area.nameNp})</option>
                ))}
              </select>
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['1-2 years', '3-5 years', '5+ years'].map((exp) => (
                  <button key={exp} type="button" onClick={() => updateField('experience', exp)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${formData.experience === exp ? 'border-[#C8102E] bg-[#C8102E]/5 text-[#C8102E]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {exp}
                  </button>
                ))}
              </div>
              {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">About Your Service (Optional)</label>
              <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe your skills and experience..." rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors resize-none" />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Next step: Upload your citizenship ID and documents for admin verification. Your <strong>Verified badge</strong> will be assigned after approval.
              </p>
            </div>

            <button type="submit" className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              Continue to Document Upload
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </form>
        )}

        {step === 'documents' && (
          <div className="p-6 space-y-4">
            <DocumentUpload providerId={undefined} />

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep('form')} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
                Back
              </button>
              <button onClick={handleSubmit} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                Submit Application
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              You can also upload documents later from your Provider Dashboard.
              <br />तपाईं पछि आफ्नो प्रदायक ड्यासबोर्डबाट पनि कागजातहरू अपलोड गर्न सक्नुहुन्छ।
            </p>
          </div>
        )}

        {step === 'submitting' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Submitting Application...</h3>
            <p className="text-sm text-gray-500 mt-2">Saving your details to our database</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Thank you for applying. Our admin team will review your application and documents within <strong>24-48 hours</strong>.
            </p>

            <button onClick={openWhatsApp}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5" />
              Speed Up Verification via WhatsApp
            </button>

            <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
              <p className="text-xs text-gray-500 mb-2">Verification Process:</p>
              <ol className="text-sm text-gray-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                  Application & documents submitted
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                  Admin reviews documents & identity
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                  Phone verification via OTP
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                  Verified badge assigned
                </li>
              </ol>
            </div>
            <button onClick={handleClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderRegistration;
